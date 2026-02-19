const Order = require("../../model/OrderProductModel");

const deleteOrder = async (req, res) => {
  try {
    if (req.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete order",
      });
    }

    const { orderId } = req.params;

    await Order.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

module.exports = deleteOrder;