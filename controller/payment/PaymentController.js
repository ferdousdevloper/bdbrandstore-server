const stripe = require("../../config/stripe");

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

    res.json({ id: session.id });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = PaymentController;