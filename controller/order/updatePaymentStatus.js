const OrderProduct = require("../../model/OrderProductModel"); // আপনার মডেলের সঠিক পাথটি এখানে দিন

const updatePaymentStatusController = async (req, res) => {
    try {
        const { orderId, payment_status } = req.body;

        if (!orderId || !payment_status) {
            return res.status(400).json({
                message: "Order ID and Status are required",
                success: false
            });
        }

        // এখানে orderModel ছিল, সেটা পরিবর্তন করে OrderProduct হবে
        const updatedOrder = await OrderProduct.findByIdAndUpdate(
            orderId,
            { "paymentDetails.payment_status": payment_status }, 
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found",
                success: false
            });
        }

        res.json({
            data: updatedOrder,
            message: "Payment status updated successfully",
            success: true,
            error: false
        });

    } catch (err) {
        // কনসোলে এররটি প্রিন্ট করলে আপনি দেখতে পাবেন কেন ৫০০ এরর আসছে
        console.log("Error updating payment status:", err);
        res.status(500).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
};

module.exports = updatePaymentStatusController;