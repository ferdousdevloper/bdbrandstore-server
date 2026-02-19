const stripe = require("../../config/stripe");
const Order = require("../../model/OrderProductModel");
const cartModel = require("../../model/Cart");

const endpointSecret = process.env.STRIPE_WEBHOOK_END_POINTS_SECRET;

const webHooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      endpointSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const newOrder = new Order({
  user: session.metadata.userId,
  cartItems: JSON.parse(session.metadata.cartItems),  // must send from checkout
  shippingDetails: {
    fullName: session.metadata.fullName,
    address: session.metadata.address,
    phone: session.metadata.phone,
  },
  paymentMethod: "Online",
  paymentDetails: {
    paymentId: session.payment_intent,
    payment_status: session.payment_status,
  },
  status: "Confirmed",
  total_amount: session.amount_total / 100,
});

    await newOrder.save();

    await cartModel.deleteMany({ userId: session.metadata.userId });
  }

  res.status(200).send();
};

module.exports = webHooks;