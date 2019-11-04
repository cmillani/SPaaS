const Provider = require('oidc-provider');
const keystore = require('./keystore.json');
const redisAdapter = require('./redis_adapter');
const account = require('./account');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var cors = require('cors');

const configuration = {
  // ... see available options /docs/configuration.md
  claims: {
    // scope: [claims] format
    openid: ['sub'],
    email: ['email', 'email_verified'],
  },
  findById: account.findById,
  interactionUrl(ctx) {
    return `/interaction/${ctx.oidc.uuid}`;
  },
  formats: {
    AccessToken: 'jwt',
  },
  features: {
    claimsParameter: true,
    discovery: true,
    encryption: true,
    introspection: true,
    registration: false,
    request: true,
    revocation: true,
    sessionManagement: true,
  },
  ttl: { 
    AccessToken: 3600,
    AuthorizationCode: 600,
    ClientCredentials: 600,
    DeviceCode: 600,
    IdToken: 3600,
    RefreshToken: 1209600 
  }
};
const clients = [{
  client_id: 'spaas',
  redirect_uris: [
    'http://localhost:4200',
    'http://localhost:4200/toolsmanager', 
    'http://localhost:4200/silent-renew.html',
    'http://localhost:4200/login'],
  post_logout_redirect_uris: ['http://localhost:4200', 'http://localhost:4200/login'],
  response_types: ['code'],
  grant_types: ['authorization_code'],
  token_endpoint_auth_method: 'none'
  // + other client properties
}];
 
const oidc = new Provider('http://localhost:3000', configuration);
 
let server;
(async () => {
  await oidc.initialize({ keystore, clients, adapter: redisAdapter });

  const expressApp = express();

  expressApp.set('trust proxy', true);
  expressApp.set('view engine', 'ejs');
  expressApp.set('views', path.resolve(__dirname, 'views'));

  expressApp.use(cors());

  const parse = bodyParser.urlencoded({ extended: false });

  expressApp.get('/interaction/:grant', async (req, res) => {
    oidc.interactionDetails(req).then((details) => {

      const view = (() => {
        switch (details.interaction.reason) {
          case 'consent_prompt':
          case 'client_not_authorized':
            return 'interaction';
          default:
            return 'login';
        }
      })();

      res.render(view, { details });
    });
  });

  expressApp.get('/interaction/:grant/registration', async (req, res) => {
    oidc.interactionDetails(req).then((details) => {
      console.log('see what else is available to you for interaction views', details);

      res.render('registration', { details });
    });
  })

  expressApp.post('/interaction/:grant/confirm', parse, (req, res) => {
    oidc.interactionFinished(req, res, {
      consent: {
        // TODO: add offline_access checkbox to confirm too
      },
    });
  });

  expressApp.post('/interaction/:grant/login', parse, (req, res, next) => {
    account.authenticate(req.body.email, req.body.password)
      .then(account => oidc.interactionFinished(req, res, {
        login: {
          account: account.accountId,
          remember: !!req.body.remember,
          ts: Math.floor(Date.now() / 1000),
        },
        consent: {
          rejectedScopes: req.body.remember ? [] : ['offline_access'],
        },
      })).catch(next);
  });

  expressApp.post('/interaction/:grant/registration', parse, (req, res, next) => {
    account.create(req.body.email, req.body.password)
      .then(account => oidc.interactionFinished(req, res, {
        login: {
          account: account.accountId,
          remember: !!req.body.remember,
          ts: Math.floor(Date.now() / 1000),
        },
        consent: {
          rejectedScopes: req.body.remember ? [] : ['offline_access'],
        },
      })).catch(next);
  });

  // leave the rest of the requests to be handled by oidc-provider, there's a catch all 404 there
  expressApp.use(oidc.callback);

  expressApp.listen(3000);
})().catch((err) => {
  if (server && server.listening) server.close();
  console.error(err);
  process.exitCode = 1;
});