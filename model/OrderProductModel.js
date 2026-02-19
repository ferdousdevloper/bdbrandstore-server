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

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cartItems: [orderItemSchema],

    shippingDetails: {
      fullName: String,
      address: String,
      phone: String,
    },

    paymentMethod: String,

    paymentDetails: {
      paymentId: String,
      payment_status: {
        type: String,
        default: "pending",
      },
    },

    // 🔥 UPDATED STATUS FIELD
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "canceled"],
      default: "pending",
    },

    total_amount: Number,
  },
  { timestamps: true }
);

const OrderProduct = mongoose.model("OrderProduct", orderSchema);

module.exports = OrderProduct;