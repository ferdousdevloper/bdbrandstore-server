const productModel = require("../../model/productModel");

const deleteProductController = async (req, res) => {
    try {
        const productId = req.params.id; // URL থেকে আইডি নেওয়া হচ্ছে

        if (!productId) {
            throw new Error("Product ID is required");
        }

        const deleteProduct = await productModel.findByIdAndDelete(productId);

        res.json({
            message: "Product deleted successfully",
            error: false,
            success: true,
            data: deleteProduct
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = deleteProductController; // এটি এক্সপোর্ট করতে ভুলবেন না