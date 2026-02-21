const userModel = require("../../model/userModel");

const UpdateuserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body; // ফ্রন্টেন্ড থেকে আসা রোলটি ডিস্ট্রাকচার করুন

    const options = { new: true };

    // সরাসরি অবজেক্ট আকারে পাঠালে কনফার্ম হবে যে শুধু রোল আপডেট হচ্ছে
    const result = await userModel.findByIdAndUpdate(
      userId, 
      { role: role }, 
      options
    );

    if (!result) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false
      });
    }

    res.status(200).json({
      data: result,
      message: "User role updated successfully..!",
      error: false,
      success: true
    });

  } catch (error) {
    res.status(400).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

module.exports = UpdateuserRole;