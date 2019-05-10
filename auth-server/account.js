const _ = require('lodash');
const crypto = require("crypto");
const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

var db = null;

(async () => {
  let client = await MongoClient.connect(process.env.SPASS_CONNECTION_STRING + '/spassDatabase');
  db = client.db("spassDatabase")
  console.log(`DB connection set`);
})().catch( err => {
  console.log(`DB connection err: ${err}`);
});

class Account {
  constructor(id) {
    this.accountId = id; // the property named accountId is important to oidc-provider
  }

  // claims() should return or resolve with an object with claims that are mapped 1:1 to
  // what your OP supports, oidc-provider will cherry-pick the requested ones automatically
  claims() {
    return Object.assign({}, {
      sub: this.accountId,
    });
  }

  static async findById(ctx, id) {
    // this is usually a db lookup, so let's just wrap the thing in a promise, oidc-provider expects
    // one
    let user = await db.collection('usersCollection').findOne({"_id" : ObjectId(id)});
    if (user != null) {
      return new Account(id);
    } else {
      return null;
    }
  }

  static async authenticate(email, password) {
    if (password == null) throw 'password must be provided';
    if (email == null) throw 'email must be provided';
    const lowercasedEmail = String(email).toLowerCase();

    return db.collection('usersCollection').findOne({'email': lowercasedEmail}).then( user => {
      if (user != null && user.password == password) {
        return new this(user._id);
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
      let result = await db.collection('usersCollection').insertOne({
        email: lowercasedEmail,
        password: password
      });
      return new this(result.insertedId);
    } else {
      throw `User already registered`;
    }
  }
}

module.exports = Account;
