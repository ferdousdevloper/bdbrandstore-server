const jwt = require('jsonwebtoken');
const User = require('../model/userModel'); // তোমার user model path ঠিক করে দিও

const authToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers['authorization'];

    if (!token) {
      return res.status(401).json({
        message: "Please log in to proceed.",
        error: true,
        success: false
      });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    // userId attach
    req.userId = decoded?._id;

    // ===============================
    // 🔥 ROLE database থেকে নিয়ে attach করছি
    // ===============================
    const user = await User.findById(decoded?._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    req.role = user.role;   // 👈 এটাই main জিনিস

    next();

  } catch (error) {
    return res.status(403).json({
      message: "Please log in to proceed.",
      error: true,
      success: false
    });
  }
};

module.exports = authToken;