const stripe = require("../../config/stripe");
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

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "bdt",
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
        cartItems: JSON.stringify(
          cartItems.map((item) => ({
            productId: item.productId._id,
            productName: item.productId.productName,
            price: item.productId.sellingPrice,
            image: item.productId.productImage[0],
            quantity: item.quantity,
          }))
        ),
      },
    });

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