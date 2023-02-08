const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);

// const mongodb = require("mongodb");
// const db = require("../util/database").getDb;

// class Product {
//   constructor(title, imageUrl, description, price, id, userId) {
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     let dbOperation;

//     if (this._id) {
//       dbOperation = db()
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOperation = db().collection("products").insertOne(this);
//     }app.use((req, res, next) => {
//   User.findById(DUMMY_USER._id)
//     .then((user) => {
//       req.user = new User(user.name, user.email, user.cart, user._id);

//       next();
//     })
//     .catch((error) => console.log(error));
// });

//     return dbOperation;
//   }

//   static fetchAll() {
//     return db()
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         return products;
//       })
//       .catch((error) => console.log(error));
//   }

//   static findById(productId) {
//     return db()
//       .collection("products")
//       .findOne({ _id: new mongodb.ObjectId(productId) })
//       .then((product) => {
//         return product;
//       })
//       .catch((error) => console.log(error));
//   }

//   static deleteById(productId) {
//     return db()
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(productId) });
//   }
// }

// module.exports = Product;
