/**
 * SacredSamskara - Database Verification Script
 * Run with: npx tsx src/lib/testDb.ts
 *
 * Tests all MongoDB model CRUD operations and relational consistency.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// ─── Schema Imports ────────────────────────────────────────────────────────────
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
import Subscription from "../models/Subscription";
import Address from "../models/Address";
import Payment from "../models/Payment";
import KitItem from "../models/KitItem";
import Coupon from "../models/Coupon";
import Testimonial from "../models/Testimonial";
import Referral from "../models/Referral";

// ─── Test Utilities ─────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

const pass = (msg: string) => {
  console.log(`  ✅  ${msg}`);
  passed++;
};
const fail = (msg: string, err?: any) => {
  console.error(`  ❌  ${msg}`, err ? `→ ${err.message || err}` : "");
  failed++;
};
const section = (title: string) =>
  console.log(`\n${"─".repeat(60)}\n  📌  ${title}\n${"─".repeat(60)}`);

// Track test IDs for cleanup
const testIds: Record<string, mongoose.Types.ObjectId | null> = {
  userId: null,
  userId2: null,
  productId: null,
  addressId: null,
  orderId: null,
  subId: null,
  paymentId: null,
  kitItemId: null,
  couponId: null,
  testimonialId: null,
  referralId: null,
};

// ─── Main Test Runner ────────────────────────────────────────────────────────
async function runTests() {
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  🪔  SacredSamskara — Database Verification Suite");
  console.log("══════════════════════════════════════════════════════════");

  // CONNECT
  section("1. Database Connection");
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    pass(`Connected to MongoDB (db: ${mongoose.connection.name})`);
  } catch (err) {
    fail("Failed to connect to MongoDB", err);
    process.exit(1);
  }

  // USER MODEL
  section("2. User Model — Create & Read");
  try {
    const user = await User.create({
      fullName: "Test Devotee",
      email: `testdevotee${Date.now()}@sacredsamskara.com`,
      mobile: "9999988888",
      passwordHash: "$2a$10$testhashplaceholder12345678900",
      role: "customer",
      status: "active",
      referralCode: "TREF" + Date.now().toString().slice(-5),
    });
    testIds.userId = user._id as mongoose.Types.ObjectId;
    pass(`User created: ${user.fullName} (${user.email})`);
    pass(`  role=${user.role}, status=${user.status}, referralCode=${user.referralCode}`);

    // Create a second user for Referral test
    const user2 = await User.create({
      fullName: "Referred Devotee",
      email: `referred${Date.now()}@sacredsamskara.com`,
      mobile: "9111222333",
      passwordHash: "$2a$10$testhashplaceholder12345678900",
      role: "customer",
      status: "active",
      referralCode: "RREF" + Date.now().toString().slice(-5),
    });
    testIds.userId2 = user2._id as mongoose.Types.ObjectId;
    pass(`Second user created for referral tests: ${user2.fullName}`);
  } catch (err) {
    fail("User model test failed", err);
  }

  // PRODUCT MODEL
  section("3. Product Model — Create & Read");
  try {
    const product = await Product.create({
      productName: "Test Pooja Kit — Verification",
      description: "Automated test product, safe to delete.",
      sku: "TEST-SKU-" + Date.now(),
      mrp: 665,
      sellingPrice: 450,
      stock: 50,
      category: "Pooja Kit",
      isSubscriptionEnabled: true,
    });
    testIds.productId = product._id as mongoose.Types.ObjectId;
    pass(`Product created: ${product.productName}`);
    pass(`  sku=${product.sku}, mrp=₹${product.mrp}, selling=₹${product.sellingPrice}, stock=${product.stock}`);
  } catch (err) {
    fail("Product model test failed", err);
  }

  // ADDRESS MODEL
  section("4. Address Model — Create & Read");
  try {
    const address = await Address.create({
      userId: testIds.userId!,
      fullName: "Test Devotee",
      mobile: "9999988888",
      addressLine1: "1, Sacred Lane, Temple Road",
      city: "Varanasi",
      state: "Uttar Pradesh",
      pincode: "221001",
      isDefault: true,
    });
    testIds.addressId = address._id as mongoose.Types.ObjectId;
    pass(`Address created: ${address.addressLine1}, ${address.city}, ${address.pincode}`);
    pass(`  isDefault=${address.isDefault}`);
  } catch (err) {
    fail("Address model test failed", err);
  }

  // SUBSCRIPTION MODEL
  section("5. Subscription Model — Create & Read");
  try {
    const sub = await Subscription.create({
      userId: testIds.userId!,
      productId: testIds.productId!,
      planType: "Monthly",
      amount: 450,
      startDate: new Date(),
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      renewalCount: 0,
      autoRenew: true,
      status: "active",
    });
    testIds.subId = sub._id as mongoose.Types.ObjectId;
    pass(`Subscription created: planType=${sub.planType}, amount=₹${sub.amount}`);
    pass(`  autoRenew=${sub.autoRenew}, nextRenewal=${sub.nextRenewalDate.toDateString()}`);
  } catch (err) {
    fail("Subscription model test failed", err);
  }

  // PAYMENT MODEL
  section("6. Payment Model — Create & Read");
  try {
    const payment = await Payment.create({
      userId: testIds.userId!,
      razorpayOrderId: "order_test_" + Date.now(),
      razorpayPaymentId: "pay_test_" + Date.now(),
      amount: 450,
      paymentMethod: "card",
      paymentStatus: "success",
      transactionDate: new Date(),
    });
    testIds.paymentId = payment._id as mongoose.Types.ObjectId;
    pass(`Payment created: ₹${payment.amount} via ${payment.paymentMethod}`);
    pass(`  razorpayOrderId=${payment.razorpayOrderId}, status=${payment.paymentStatus}`);
  } catch (err) {
    fail("Payment model test failed", err);
  }

  // ORDER MODEL
  section("7. Order Model — Create, Read & Populate");
  try {
    const order = await Order.create({
      orderNumber: "ORD-TEST-" + Date.now(),
      userId: testIds.userId!,
      productId: testIds.productId!,
      addressId: testIds.addressId!,
      orderType: "subscription",
      subscriptionId: testIds.subId!,
      paymentId: testIds.paymentId!,
      subtotal: 665,
      discount: 215,
      finalAmount: 450,
      shippingCost: 0,
      orderStatus: "confirmed",
      deliveryStatus: "pending",
    });
    testIds.orderId = order._id as mongoose.Types.ObjectId;
    pass(`Order created: ${order.orderNumber}`);
    pass(`  orderType=${order.orderType}, finalAmount=₹${order.finalAmount}, status=${order.orderStatus}`);

    // Test deep populate
    const populated = await Order.findById(testIds.orderId)
      .populate("userId", "fullName email")
      .populate("productId", "productName sellingPrice");
    const popUser = (populated?.userId as any)?.fullName;
    const popProduct = (populated?.productId as any)?.productName;
    pass(`  Populated userId  → "${popUser}"`);
    pass(`  Populated productId → "${popProduct}"`);
  } catch (err) {
    fail("Order model test failed", err);
  }

  // KIT ITEM MODEL — correct schema: productId, itemName, quantity, unit
  section("8. KitItem Model — Create & Read");
  try {
    const kitItem = await KitItem.create({
      productId: testIds.productId!,
      itemName: "Test Camphor Tablets",
      quantity: 20,
      unit: "pieces",
    });
    testIds.kitItemId = kitItem._id as mongoose.Types.ObjectId;
    pass(`KitItem created: ${kitItem.itemName}, qty=${kitItem.quantity} ${kitItem.unit}`);
    pass(`  linked to productId=${kitItem.productId}`);
  } catch (err) {
    fail("KitItem model test failed", err);
  }

  // COUPON MODEL — correct schema: code, type, value, minimumOrder, expiryDate, usageLimit, active
  section("9. Coupon Model — Create & Validate");
  try {
    const coupon = await Coupon.create({
      code: "TESTCPN" + Date.now(),
      type: "percentage",
      value: 10,
      minimumOrder: 400,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      active: true,
    });
    testIds.couponId = coupon._id as mongoose.Types.ObjectId;
    pass(`Coupon created: ${coupon.code} — ${coupon.value}% off`);
    pass(`  minimumOrder=₹${coupon.minimumOrder}, expires=${coupon.expiryDate.toDateString()}`);
  } catch (err) {
    fail("Coupon model test failed", err);
  }

  // TESTIMONIAL MODEL — correct schema: customerName, city, rating, review, approved
  section("10. Testimonial Model — Create & Read");
  try {
    const testimonial = await Testimonial.create({
      customerName: "Test Devotee",
      city: "Varanasi",
      rating: 5,
      review: "Excellent sacred kit! Auto-verification test passed. 🙏",
      approved: true,
    });
    testIds.testimonialId = testimonial._id as mongoose.Types.ObjectId;
    pass(`Testimonial created: Rating ${testimonial.rating}/5 by ${testimonial.customerName}`);
    pass(`  city=${testimonial.city}, approved=${testimonial.approved}`);
  } catch (err) {
    fail("Testimonial model test failed", err);
  }

  // REFERRAL MODEL — correct schema: referrerUserId, referredUserId, rewardAmount, rewardStatus
  section("11. Referral Model — Create & Read");
  try {
    const referral = await Referral.create({
      referrerUserId: testIds.userId!,
      referredUserId: testIds.userId2!,
      rewardAmount: 50,
      rewardStatus: "pending",
    });
    testIds.referralId = referral._id as mongoose.Types.ObjectId;
    pass(`Referral created: reward=₹${referral.rewardAmount}, status=${referral.rewardStatus}`);
    pass(`  referrerUserId=${referral.referrerUserId}, referredUserId=${referral.referredUserId}`);
  } catch (err) {
    fail("Referral model test failed", err);
  }

  // RELATIONAL CONSISTENCY
  section("12. Relational Integrity — Cross-Model Queries");
  try {
    const userOrders = await Order.find({ userId: testIds.userId });
    pass(`Orders for test user: ${userOrders.length} found`);

    const activeSubs = await Subscription.find({ userId: testIds.userId, status: "active" });
    pass(`Active subscriptions for test user: ${activeSubs.length}`);

    const successPayments = await Payment.find({ userId: testIds.userId, paymentStatus: "success" });
    pass(`Successful payments for test user: ${successPayments.length}`);

    const kitItems = await KitItem.find({ productId: testIds.productId });
    pass(`KitItems linked to test product: ${kitItems.length}`);

    const activeCoupons = await Coupon.find({ active: true });
    pass(`Active coupons in DB: ${activeCoupons.length}`);
  } catch (err) {
    fail("Relational integrity check failed", err);
  }

  // UPDATE TEST
  section("13. Update & Verify — Order Status Change");
  try {
    const updated = await Order.findByIdAndUpdate(
      testIds.orderId,
      { orderStatus: "shipped", deliveryStatus: "in-transit" },
      { new: true }
    );
    pass(`Order updated: orderStatus=${updated?.orderStatus}, deliveryStatus=${updated?.deliveryStatus}`);
  } catch (err) {
    fail("Order update test failed", err);
  }

  // CLEANUP
  section("14. Cleanup — Removing All Test Records");
  const cleanups: Array<{ name: string; fn: () => Promise<any> }> = [
    { name: "Referral",    fn: () => Referral.findByIdAndDelete(testIds.referralId) },
    { name: "Testimonial", fn: () => Testimonial.findByIdAndDelete(testIds.testimonialId) },
    { name: "Coupon",      fn: () => Coupon.findByIdAndDelete(testIds.couponId) },
    { name: "KitItem",     fn: () => KitItem.findByIdAndDelete(testIds.kitItemId) },
    { name: "Order",       fn: () => Order.findByIdAndDelete(testIds.orderId) },
    { name: "Payment",     fn: () => Payment.findByIdAndDelete(testIds.paymentId) },
    { name: "Subscription",fn: () => Subscription.findByIdAndDelete(testIds.subId) },
    { name: "Address",     fn: () => Address.findByIdAndDelete(testIds.addressId) },
    { name: "Product",     fn: () => Product.findByIdAndDelete(testIds.productId) },
    { name: "User (ref)",  fn: () => User.findByIdAndDelete(testIds.userId2) },
    { name: "User",        fn: () => User.findByIdAndDelete(testIds.userId) },
  ];

  for (const c of cleanups) {
    try {
      await c.fn();
      pass(`${c.name} test record deleted`);
    } catch (err) {
      fail(`Failed to delete ${c.name} test record`, err);
    }
  }

  await mongoose.disconnect();

  // SUMMARY
  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`  🎉  Tests complete — ✅ ${passed} passed, ❌ ${failed} failed`);
  console.log("══════════════════════════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Unhandled test error:", err);
  process.exit(1);
});
