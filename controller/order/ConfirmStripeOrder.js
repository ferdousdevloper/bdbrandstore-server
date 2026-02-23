const stripe = require("../../config/stripe");
const Order = require("../../model/OrderProductModel");
const cartModel = require("../../model/Cart");

const ConfirmStripeOrder = async (req, res) => {
    try {
        const { session_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== "paid") {
            return res.status(400).json({ success: false, message: "Payment not completed" });
        }

        const existingOrder = await Order.findOne({ "paymentDetails.stripeSessionId": session.id });
        if (existingOrder) return res.json({ success: true, orderId: existingOrder._id });

        // মেটাডেটা থেকে শর্ট ডাটা রিসিভ করা
        const rawCart = JSON.parse(session.metadata.cartItems);
        const formattedCartItems = rawCart.map(item => ({
            productId: item.pId,
            productName: item.name,
            price: item.prc,
            image: item.img,
            quantity: item.qty
        }));

        const newOrder = new Order({
            user: session.metadata.userId,
            cartItems: formattedCartItems,
            shippingDetails: {
                fullName: session.metadata.fullName,
                address: session.metadata.address,
                phone: session.metadata.phone,
            },
            paymentMethod: "Online",
            paymentDetails: {
                paymentId: session.payment_intent,
                payment_status: "paid",
                stripeSessionId: session.id,
            },
            status: "confirmed",
            subTotal: Number(session.metadata.subTotal),
            shippingFee: Number(session.metadata.shippingFee),
            total_amount: session.amount_total / 100,
        });

        await newOrder.save();
        await cartModel.deleteMany({ userId: session.metadata.userId });

        res.json({ success: true, message: "Order saved exactly like COD!", orderId: newOrder._id });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = ConfirmStripeOrder;