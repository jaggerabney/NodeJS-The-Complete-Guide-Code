const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(
    (element) => element.productId.toString() === product._id.toString()
  );
  const updatedCartItems = [...this.cart.items];
  let newQuantity = 1;

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  this.cart = {
    items: updatedCartItems,
  };

  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item._id.toString() !== productId.toString()
  );

  this.cart.items = updatedCartItems;

  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };

  return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const { ObjectId, Double } = require("mongodb");

// const db = require("../util/database").getDb;

// class User {
//   constructor(name, email, cart, _id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart;
//     this._id = _id;
//   }

//   save() {
//     return db().collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(
//       (element) => element.productId.toString() === product._id.toString()
//     );
//     const updatedCartItems = [...this.cart.items];
//     let newQuantity = 1;

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     return db()
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   deleteFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter(
//       (item) => item.productId.toString() !== productId.toString()
//     );

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     return db()
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     const productIds = this.cart.items.map((product) => product.productId);

//     return db()
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         console.log(products);

//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find(
//               (item) => item.productId.toString() === product._id.toString()
//             ).quantity,
//           };
//         });
//       });
//   }

//   order() {
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new ObjectId(this._id),
//             name: this.name,
//           },
//         };

//         return db().collection("orders").insertOne(order);
//       })
//       .then(() => {
//         this.cart = { items: [] };

//         return db()
//           .collection("users")
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   static findById(userId) {
//     return db()
//       .collection("users")
//       .findOne({ _id: new ObjectId(userId) });
//   }

//   getOrders() {
//     return db()
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray();
//   }
// }

// module.exports = User;
