const OrderProduct = require("../../model/OrderProductModel");
const productModel = require("../../model/productModel");
const userModel = require("../../model/userModel");

const getStatisticsController = async (req, res) => {
    try {
        // ১. টোটাল ক্যালকুলেশন
        const totalSales = await OrderProduct.aggregate([
            { $match: { status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$total_amount" } } }
        ]);

        const totalOrders = await OrderProduct.countDocuments();
        const totalUsers = await userModel.countDocuments();
        const totalProducts = await productModel.countDocuments();

        // ২. মাসিক সেলস ডাটা (Area Chart এর জন্য)
        const monthlySales = await OrderProduct.aggregate([
            { $match: { status: "delivered" } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    sales: { $sum: "$total_amount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthlySales = monthlySales.map(item => ({
            name: monthNames[item._id - 1],
            sales: item.sales,
            orders: item.orders
        }));

        // ৩. ক্যাটাগরি অনুযায়ী প্রোডাক্ট ডিস্ট্রিবিউশন (Pie Chart)
        const categoryStats = await productModel.aggregate([
            { $group: { _id: "$category", value: { $sum: 1 } } }
        ]);
        const formattedCategoryData = categoryStats.map(item => ({
            name: item._id,
            value: item.value
        }));

        res.json({
            success: true,
            data: {
                counts: {
                    revenue: totalSales[0]?.total || 0,
                    orders: totalOrders,
                    users: totalUsers,
                    products: totalProducts
                },
                salesData: formattedMonthlySales,
                categoryData: formattedCategoryData
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message, success: false });
    }
};

module.exports = getStatisticsController;