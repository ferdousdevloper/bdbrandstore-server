const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({

  userId: String,
  email: String,

  productDetails: Array,

  shippingDetails: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String,
  },

  paymentMethod: {
    type: String, // stripe / cod
  },

  paymentDetails: {
    paymentId: String,
    payment_status: String,
  },

  orderStatus: {
    type: String,
    default: "Pending"
  },

  total_amount: Number

}, { timestamps: true })

module.exports = mongoose.model("order", orderSchema)