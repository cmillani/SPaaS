const _ = require('lodash');
const saltRounds = 10;
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

var db = null;

(async () => {
  let client = await MongoClient.connect(process.env.SPASS_CONNECTION_STRING);
  db = client.db("spassDatabase")
  console.log(`DB connection set`);
})().catch( err => {
  console.log(`DB connection err: ${err}`);
});

class Account {
  constructor(id, email) {
    this.accountId = id; // the property named accountId is important to oidc-provider
    this.email = email;
  }

  // claims() should return or resolve with an object with claims that are mapped 1:1 to
  // what your OP supports, oidc-provider will cherry-pick the requested ones automatically
  claims() {
    return Object.assign({}, {
      sub: this.accountId,
      email: this.email
    });
  }

  static async findById(ctx, id) {
    // this is usually a db lookup, so let's just wrap the thing in a promise, oidc-provider expects
    // one
    let user = await db.collection('usersCollection').findOne({"_id" : ObjectId(id)});
    if (user != null) {
      return new Account(id, user.email);
    } else {
      return null;
    }
  }

  static async authenticate(email, password) {
    if (password == null) throw 'password must be provided';
    if (email == null) throw 'email must be provided';
    const lowercasedEmail = String(email).toLowerCase();

    return db.collection('usersCollection').findOne({'email': lowercasedEmail}).then( user => {
      if (user != null && bcrypt.compareSync(password, user.password)) {
        return new this(user._id, user.email); 
      } else {
        throw "User Not Found";
      }
    })
  }

  static async create(email, password) {
    if (password == null) throw 'password must be provided';
    if (email == null) throw 'email must be provided';
    const lowercasedEmail = String(email).toLowerCase();

    let user = await db.collection('usersCollection').findOne({'email': lowercasedEmail});
    if (user == null) {
      let hahsedPassword = bcrypt.hashSync(password, saltRounds)
      let result = await db.collection('usersCollection').insertOne({
        email: lowercasedEmail,
        password: hahsedPassword
      });
      return new this(result.insertedId);
    } else {
      throw `User already registered`;
    }
  }
}

module.exports = Account;
