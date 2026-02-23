const stripe = require("../../config/stripe");
const Order = require("../../model/OrderProductModel");
const cartModel = require("../../model/Cart");

const endpointSecret = process.env.STRIPE_WEBHOOK_END_POINTS_SECRET;

const webHooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // স্ট্রাইপ থেকে আসা রRaw বডি ব্যবহার করতে হবে (Express এ app.use(express.raw({type: 'application/json'})) কনফিগার করা থাকলে ভালো)
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig,
            endpointSecret
        );
    } catch (err) {
        console.log("⚠️  Webhook signature error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // পেমেন্ট সফল হলে এই ইভেন্টটি ফায়ার হবে
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        console.log("✅  PAYMENT SUCCESS WEBHOOK RECEIVED:", session.id);

        try {
            // ১. মেটাডেটা থেকে শিপিং ফি এবং ইউজার আইডি রিসিভ করা
            const shippingFee = Number(session.metadata.shippingFee || 0);
            const userId = session.metadata.userId;
            
            // ২. গ্র্যান্ড টোটাল থেকে শিপিং ফি বাদ দিয়ে সাব-টোটাল বের করা
            // Stripe এ অ্যামাউন্ট পয়সায় (cents) থাকে না, যদি আপনি কন্ট্রোলারে ১০০ দিয়ে ভাগ করে থাকেন
            const totalAmount = session.amount_total / 100; 
            const subTotal = totalAmount - shippingFee;

            // ৩. নতুন অর্ডার অবজেক্ট তৈরি
            const newOrder = new Order({
                user: userId,
                cartItems: JSON.parse(session.metadata.cartItems),
                shippingDetails: {
                    fullName: session.metadata.fullName,
                    address: session.metadata.address,
                    phone: session.metadata.phone,
                },
                paymentMethod: "Online",
                paymentDetails: {
                    paymentId: session.payment_intent,
                    payment_status: session.payment_status || "paid",
                    stripeSessionId: session.id,
                },
                status: "confirmed",
                subTotal: subTotal,         // আলাদাভাবে প্রোডাক্টের দাম সেভ হচ্ছে
                shippingFee: shippingFee,   // আলাদাভাবে শিপিং ফি সেভ হচ্ছে
                total_amount: totalAmount,  // সর্বমোট টাকা
            });

            // ৪. ডেটাবেজে অর্ডার সেভ করা
            await newOrder.save();

            // ৫. ইউজারের কার্ট খালি করে দেওয়া
            await cartModel.deleteMany({ userId: userId });

            console.log(`✨ Order saved for User: ${userId}. Subtotal: ${subTotal}, Shipping: ${shippingFee}`);

        } catch (error) {
            console.error("❌  Webhook DB Error:", error);
            // এখানে ৫-শ তক রেসপন্স দিলে স্ট্রাইপ আবার ট্রাই করবে (Retry)
            return res.status(500).json({ success: false, message: "Database error" });
        }
    }

    // স্ট্রাইপকে পজিটিভ রেসপন্স পাঠানো
    res.status(200).json({ received: true });
};

module.exports = webHooks;