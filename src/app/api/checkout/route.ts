import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Subscription from "@/models/Subscription";
import Address from "@/models/Address";
import Payment from "@/models/Payment";
import {
  getStore,
  addOrder,
  addCustomer,
  addSubscription,
  decrementInventory,
} from "@/lib/persistentDb";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      mobile,
      email,
      addressLine1,
      city,
      pincode,
      paymentMethod,
      planType,
      amount,
      subtotal,
      discount,
    } = body;

    // Validate request
    if (!fullName || !mobile || !email || !addressLine1 || !city || !pincode) {
      return NextResponse.json({ success: false, message: "Missing required details" }, { status: 400 });
    }

    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const mockOrdId = "mock_order_" + Math.floor(100000 + Math.random() * 900000);
    const mockUserId = "mock_user_" + Math.floor(100000 + Math.random() * 900000);
    const mockSubId = "mock_sub_" + Math.floor(100000 + Math.random() * 900000);

    // ── 1. Save customer to persistent file store ──────────────────────────
    const store = getStore();
    let memUser = store.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (!memUser) {
      memUser = {
        _id: mockUserId,
        fullName,
        email: email.toLowerCase(),
        mobile,
        role: "customer",
        status: "active",
        referralCode: "REF-" + Math.floor(1000 + Math.random() * 9000),
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      };
    }
    memUser.totalOrders = (memUser.totalOrders || 0) + 1;
    memUser.totalSpent = (memUser.totalSpent || 0) + amount;
    addCustomer(memUser);

    // ── 2. Default product reference ───────────────────────────────────────
    const defaultProduct = {
      _id: "mock_product_01",
      productName: "Monthly Pooja Kit",
      sku: "ESSENTIAL-01",
      sellingPrice: 450,
      mrp: 665,
    };

    const orderType = planType === "one-time" ? "one-time" : "subscription";

    // ── 3. Save subscription if applicable ────────────────────────────────
    let memSub = null;
    if (orderType === "subscription") {
      let renewalDays = 30;
      if (planType === "Quarterly") renewalDays = 90;
      else if (planType === "HalfYearly") renewalDays = 180;

      memSub = {
        _id: mockSubId,
        userId: memUser,
        productId: defaultProduct,
        planType,
        amount,
        startDate: new Date().toISOString(),
        nextRenewalDate: new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000).toISOString(),
        renewalCount: 0,
        autoRenew: true,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      addSubscription(memSub);
    }

    // ── 4. Save order to persistent file store (DISK) ─────────────────────
    const memOrder = {
      _id: mockOrdId,
      orderNumber,
      userId: memUser,
      productId: defaultProduct,
      orderType,
      subscriptionId: memSub ? mockSubId : undefined,
      subtotal,
      discount,
      finalAmount: amount,
      shippingCost: 0,
      orderStatus: "confirmed",
      deliveryStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    addOrder(memOrder);       // persists to orders_data.json on disk
    decrementInventory();     // update stock count

    // ── 5. Defer MongoDB Atlas sync to a macrotask so HTTP response is instant ──
    setTimeout(async () => {
      try {
        await connectToDatabase();

        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          user = await User.create({
            fullName,
            email: email.toLowerCase(),
            mobile,
            passwordHash: "$2a$10$Y5nCjD3Y2Y78g6G3t2uCie2k9pZfI234jY99g99r99r99r99r99r9",
            role: "customer",
            status: "active",
            referralCode: "REF-" + Math.floor(1000 + Math.random() * 9000),
          });
        }

        const address = await Address.create({
          userId: user._id,
          fullName,
          mobile,
          addressLine1,
          city,
          state: "India State",
          pincode,
          isDefault: true,
        });

        let product = await Product.findOne();
        if (!product) {
          product = await Product.create({
            productName: "Monthly Pooja Kit",
            description: "A premium, curated bundle of essential pooja supplies.",
            sku: "ESSENTIAL-01",
            mrp: 665,
            sellingPrice: 450,
            stock: 500,
            category: "Pooja Kit",
            isSubscriptionEnabled: true,
          });
        }

        let subscriptionId = undefined;
        if (orderType === "subscription") {
          let renewalDays = 30;
          if (planType === "Quarterly") renewalDays = 90;
          else if (planType === "HalfYearly") renewalDays = 180;

          const sub = await Subscription.create({
            userId: user._id,
            productId: product._id,
            planType,
            amount,
            startDate: new Date(),
            nextRenewalDate: new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000),
            renewalCount: 0,
            autoRenew: true,
            status: "active",
          });
          subscriptionId = sub._id;
        }

        const payment = await Payment.create({
          userId: user._id,
          razorpayOrderId: "order_" + Math.floor(100000 + Math.random() * 900000),
          razorpayPaymentId: "pay_" + Math.floor(100000 + Math.random() * 900000),
          amount,
          paymentMethod: paymentMethod || "card",
          paymentStatus: "success",
          transactionDate: new Date(),
        });

        const order = await Order.create({
          orderNumber,
          userId: user._id,
          productId: product._id,
          addressId: address._id,
          orderType,
          subscriptionId,
          paymentId: payment._id,
          subtotal,
          discount,
          finalAmount: amount,
          shippingCost: 0,
          orderStatus: "confirmed",
          deliveryStatus: "pending",
        });

        payment.orderId = order._id;
        await payment.save();

        user.totalOrders = (user.totalOrders || 0) + 1;
        user.totalSpent = (user.totalSpent || 0) + amount;
        await user.save();

        console.log(`[Background DB Sync] Successfully saved order ${orderNumber} to MongoDB.`);
      } catch (dbError: any) {
        console.warn(
          `[Background DB Sync] MongoDB unavailable – order ${orderNumber} already saved to local file store.`,
          dbError.message || dbError
        );
      }
    }, 0);

    return NextResponse.json({
      success: true,
      message: "Order processed successfully",
      orderNumber,
      orderId: mockOrdId,
    });
  } catch (error: any) {
    console.error("Checkout processing error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
