const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  productName: String,
  price: Number,
  image: String,
  quantity: Number,
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  cartItems: [orderItemSchema],  // ✅ structured array

  shippingDetails: {
    fullName: String,
    address: String,
    phone: String,
  },

  paymentMethod: String,
  status: String,
  totalAmount: Number,

}, { timestamps: true });

const OrderProduct = mongoose.model("OrderProduct", orderSchema);

module.exports = OrderProduct;