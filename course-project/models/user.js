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
    const cartProduct = this.cart.items.findIndex(
      (element) => element._id === product._id
    );

    if (cartProduct) {
      // to be added
    } else {
      const updatedCart = { items: [{ ...product, quantity: 1 }] };

      return db()
        .collection("users")
        .updateOne({ _id: new ObjectId(_id) }, { $set: { cart: updatedCart } });
    }
  }

  static findById(userId) {
    return db()
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
  }
}

module.exports = User;
