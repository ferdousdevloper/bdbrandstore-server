const stripe = require("../../config/stripe");
const Order = require("../../model/OrderProductModel");
const cartModel = require("../../model/Cart");
console.log("Webhook route hit");
const endpointSecret = process.env.STRIPE_WEBHOOK_END_POINTS_SECRET;

const webHooks = async (req, res) => {

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // ✅ NOT req.rawBody
      sig,
      endpointSecret
    );
  } catch (err) {
    console.log("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {

    console.log("✅ PAYMENT SUCCESS WEBHOOK HIT");

    const session = event.data.object;

    try {
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
          paymentId: session.payment_intent,
          payment_status: session.payment_status || "paid",
          stripeSessionId: session.id,
        },
        status: "confirmed",
        total_amount: session.amount_total / 100,
      });

      await newOrder.save();

      await cartModel.deleteMany({ userId: session.metadata.userId });

      console.log("✅ Order Saved & Cart Cleared");

    } catch (error) {
      console.log("Webhook DB Error:", error);
    }
  }

  res.status(200).json({ received: true });
};

module.exports = webHooks;