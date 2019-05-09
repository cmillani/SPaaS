const assert = require('assert');
const _ = require('lodash');
const crypto = require("crypto");
const MongoClient = require("mongodb").MongoClient;
var db = null;

(async () => {
  let client = await MongoClient.connect(process.env.SPASS_CONNECTION_STRING + '/spassDatabase');
  db = client.db("spassDatabase")
  console.log(`DB connection set`);
})().catch( err => {
  console.log(`DB connection err: ${err}`);
});

var USERS = {
  '23121d3c-84df-44ac-b458-3d63a9a05497': {
    email: 'foo@example.com',
    email_verified: true,
  },
  'c2ac2b4a-2262-4e2f-847a-a40dd3c4dcd5': {
    email: 'bar@example.com',
    email_verified: false,
  },
};

class Account {
  constructor(id) {
    this.accountId = id; // the property named accountId is important to oidc-provider
  }

  // claims() should return or resolve with an object with claims that are mapped 1:1 to
  // what your OP supports, oidc-provider will cherry-pick the requested ones automatically
  claims() {
    return Object.assign({}, USERS[this.accountId], {
      sub: this.accountId,
    });
  }

  static async findById(ctx, id) {
    // this is usually a db lookup, so let's just wrap the thing in a promise, oidc-provider expects
    // one
    return new Account(id);
  }

  static async authenticate(email, password) {
    assert(password, 'password must be provided');
    assert(email, 'email must be provided');
    const lowercasedEmail = String(email).toLowerCase();
    // const id = _.findKey(USERS, { email: lowercased });
    // assert(id, 'invalid credentials provided');

    return db.collection('usersCollection').findOne({'email': lowercasedEmail}).then( user => {
      if (user != null && user.password == password) {
        return new this(user._id);
      } else {
        throw "Throw not found"
      }
    })
  }

  static async create(email, password) {
    assert(password, 'password must be provided');
    assert(email, 'email must be provided');
    const lowercased = String(email).toLowerCase();
    const id = crypto.randomBytes(16).toString("hex");

    USERS[id] = {
      email: lowercased,
      email_verified: false
    }

    return new this(id);
  }
}

module.exports = Account;
