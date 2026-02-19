const OrderProduct = require("../../model/OrderProductModel");
const cartModel = require("../../model/Cart");

const createCODOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItems, shippingDetails } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // ✅ Transform cart data properly
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

    const newOrder = await OrderProduct.create({
      user: userId,
      cartItems: formattedItems,
      shippingDetails,
      paymentMethod: "COD",
      status: "Pending",
      totalAmount,
    });

    await cartModel.deleteMany({ userId });

    res.status(201).json({
      success: true,
      message: "COD Order placed successfully",
      data: newOrder,
    });

  } catch (error) {
    console.error("COD ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = createCODOrder;