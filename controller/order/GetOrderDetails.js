const Order = require("../../model/OrderProductModel");

const GetOrderDetails = async (req, res) => {
  try {

    let orders;

    if (req.role === "ADMIN") {
      orders = await Order.find();   // 👈 populate বাদ
    } else {
      orders = await Order.find({ userId: req.userId });
    }

    return res.json({
      success: true,
      error: false,
      message: "Ordered Product Details",
      data: orders,
    });

  } catch (error) {
    console.log("ORDER ERROR:", error);   // 👈 এটা add করো
    return res.status(500).json({
      success: false,
      error: true,
      message: "Something went wrong",
    });
  }
};

module.exports = GetOrderDetails;