const Order = require("../../model/OrderProductModel");

const updateOrderStatus = async (req, res) => {
  try {
    if (req.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update order",
      });
    }

    const { orderId, status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
};

module.exports = updateOrderStatus;