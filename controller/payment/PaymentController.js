const stripe = require("../../config/stripe");

const PaymentController = async (req, res) => {
  try {
    const { cartItems, shippingDetails, shippingFee } = req.body;
    const userId = req.userId;

    const subTotal = cartItems.reduce((sum, item) => sum + (item.productId.sellingPrice * item.quantity), 0);

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "bdt",
        product_data: { name: item.productId.productName },
        unit_amount: item.productId.sellingPrice * 100,
      },
      quantity: item.quantity,
    }));

    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "bdt",
          product_data: { name: "Shipping Fee" },
          unit_amount: shippingFee * 100,
        },
        quantity: 1,
      });
    }

    // মেটাডেটা ছোট রাখা (খুবই জরুরি)
    const simplifiedCart = cartItems.map(item => ({
      pId: item.productId._id,
      name: item.productId.productName,
      prc: item.productId.sellingPrice,
      img: item.productId.productImage[0],
      qty: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        userId: userId,
        fullName: shippingDetails.fullName,
        address: shippingDetails.address,
        phone: shippingDetails.phone,
        shippingFee: String(shippingFee),
        subTotal: String(subTotal),
        cartItems: JSON.stringify(simplifiedCart).substring(0, 450) // লিমিট রক্ষা
      },
    });

    res.json({ id: session.id, success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = PaymentController;