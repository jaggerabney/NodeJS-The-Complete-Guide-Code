const { ObjectId } = require("mongodb");

const db = require("../util/database").getDb;

class User {
  constructor(name, email, cart, _id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = _id;
  }

  save() {
    return db().collection("users").insertOne(this);
  }

  addToCart(product) {
    let updatedCartItems, cartProductIndex;

    try {
      cartProductIndex = this.cart.items.findIndex(
        (element) => element._id.toString() === product._id.toString()
      );
      updatedCartItems = [...this.cart.items];
    } catch {
      cartProductIndex = -1;
      updatedCartItems = [];
    }

    if (cartProductIndex >= 0) {
      // to be added
    } else {
      const updatedCart = {
        items: [{ productId: new ObjectId(product._id), quantity: 1 }],
      };

      return db()
        .collection("users")
        .updateOne(
          { _id: new ObjectId(this._id) },
          { $set: { cart: updatedCart } }
        );
    }
  }

  static findById(userId) {
    return db()
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
  }
}

module.exports = User;
