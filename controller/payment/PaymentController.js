const stripe = require("../../config/stripe");
const OrderProduct = require("../../model/OrderProductModel");
const cartModel = require("../../model/Cart");

const PaymentController = async (req, res) => {
  try {
    const { cartItems, shippingDetails } = req.body;
    const userId = req.userId;

    if (!shippingDetails.fullName || !shippingDetails.address || !shippingDetails.phone) {
      return res.status(400).json({
        success: false,
        message: "Shipping details required",
      });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ---------------- LINE ITEMS ----------------
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.productName,
        },
        unit_amount: item.productId.sellingPrice * 100,
      },
      quantity: item.quantity,
    }));

    // ---------------- CREATE STRIPE SESSION ----------------
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        userId,
        fullName: shippingDetails.fullName,
        address: shippingDetails.address,
        phone: shippingDetails.phone,
      },
    });

    // ---------------- SAVE ORDER IN DB IMMEDIATELY (DEV PURPOSE) ----------------
    const formattedItems = cartItems.map((item) => ({
      productId: item.productId._id,
      productName: item.productId.productName,
      price: item.productId.sellingPrice,
      image: item.productId.productImage[0],
      quantity: item.quantity,
    }));

    const totalAmount = formattedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Save order with pending status
    await OrderProduct.create({
      user: userId,
      cartItems: formattedItems,
      shippingDetails,
      paymentMethod: "Online",
      paymentDetails: {
        paymentId: session.id,
        payment_status: "Pending",
      },
      status: "Pending",
      totalAmount,
    });

    // Optionally, empty cart
    await cartModel.deleteMany({ userId });

    // ---------------- SEND SESSION ID ----------------
    res.json({ id: session.id, success: true });

  } catch (error) {
    console.error("PAYMENT CONTROLLER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = PaymentController;