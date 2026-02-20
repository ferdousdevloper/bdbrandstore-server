const Order = require("../../model/OrderProductModel");

const GetOrderDetails = async (req, res) => {
  try {

    let orders;

    // 🔥 ADMIN হলে সব order
    if (req.role === "ADMIN") {
      orders = await Order.find()
        .sort({ createdAt: -1 }); // ✅ new to old
    } 
    // 🔥 USER হলে শুধু নিজের order
    else {
      orders = await Order.find({ user: req.userId }) // ⚠ userId না, user
        .sort({ createdAt: -1 }); // ✅ new to old
    }

    return res.json({
      success: true,
      error: false,
      message: "Ordered Product Details",
      data: orders,
    });

  } catch (error) {
    console.log("ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: "Something went wrong",
    });
  }
};

module.exports = GetOrderDetails;