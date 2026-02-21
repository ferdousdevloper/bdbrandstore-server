const stripe = require("../../config/stripe");
const Order = require("../../model/OrderProductModel");
const cartModel = require("../../model/Cart");

/**
 * When user lands on success page after Stripe checkout.
 * Stripe webhook often doesn't reach localhost, so we confirm order here:
 * retrieve session from Stripe, verify paid, save order & clear cart.
 * Duplicate prevented by checking stripeSessionId already in DB.
 */
const ConfirmStripeOrder = async (req, res) => {
  try {
    const { session_id } = req.body;
    const userId = req.userId;

    if (!session_id) {
      return res.status(400).json({ success: false, message: "session_id required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    if (session.metadata.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Session does not belong to this user",
      });
    }

    const existingOrder = await Order.findOne({
      "paymentDetails.stripeSessionId": session.id,
    });
    if (existingOrder) {
      await cartModel.deleteMany({ userId });
      return res.json({
        success: true,
        message: "Order already recorded",
        orderId: existingOrder._id,
      });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    const newOrder = new Order({
      user: session.metadata.userId,
      cartItems: JSON.parse(session.metadata.cartItems),
      shippingDetails: {
        fullName: session.metadata.fullName,
        address: session.metadata.address,
        phone: session.metadata.phone,
      },
      paymentMethod: "Online",
      paymentDetails: {
        paymentId: paymentIntentId,
        payment_status: session.payment_status || "paid",
        stripeSessionId: session.id,
      },
      status: "confirmed",
      total_amount: session.amount_total ? session.amount_total / 100 : 0,
    });

    await newOrder.save();
    await cartModel.deleteMany({ userId: session.metadata.userId });

    res.json({
      success: true,
      message: "Order saved and cart cleared",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("ConfirmStripeOrder error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm order",
    });
  }
};

module.exports = ConfirmStripeOrder;
