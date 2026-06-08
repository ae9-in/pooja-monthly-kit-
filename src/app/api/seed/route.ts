export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Subscription from "@/models/Subscription";
import Address from "@/models/Address";
import Payment from "@/models/Payment";
import { memoryDb, seedMemoryDbWithDefaults } from "@/lib/memoryDb";
import { resetStore } from "@/lib/persistentDb";

export async function POST() {
  try {
    try {
      await connectToDatabase();
    } catch (dbErr: any) {
      console.warn("MongoDB connection failed during seeding. Seeding memoryDb only:", dbErr.message);
      seedMemoryDbWithDefaults();
      resetStore(); // Clear disk-based JSON store as well
      return NextResponse.json({
        success: true,
        message: "Seeded mock memory database (Offline Mode)",
        seededProduct: "Monthly Pooja Kit",
        offline: true,
      });
    }

    // 1. Clear existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Subscription.deleteMany({});
    await Address.deleteMany({});
    await Payment.deleteMany({});

    // Reset persistent JSON file store (disk) to clear dummy data
    resetStore();

    // 2. Seed default Product
    const defaultProduct = await Product.create({
      productName: "Monthly Pooja Kit",
      description: "A premium, curated bundle of essential pooja supplies including hand-rolled incense, pure camphor, organic deepa oil, and more.",
      sku: "ESSENTIAL-01",
      mrp: 665,
      sellingPrice: 450,
      stock: 1500,
      category: "Pooja Kit",
      images: ["/pooja_kit.png"],
      benefits: ["Authentic sourcing", "100% natural materials", "Perfect daily quantities"],
      isSubscriptionEnabled: true,
    });

    // 3. Seed Admin User
    await User.create({
      fullName: "Admin Priest",
      email: "admin@sacredsamskara.com",
      mobile: "9876543210",
      passwordHash: "$2a$10$Y5nCjD3Y2Y78g6G3t2uCie2k9pZfI234jY99g99r99r99r99r99r9", // simulated bcrypt hash
      role: "admin",
      status: "active",
      referralCode: "REF-ADMIN",
    });

    // Sync to memoryDb as well so they are in alignment
    memoryDb.products = [JSON.parse(JSON.stringify(defaultProduct))];
    memoryDb.customers = [];
    memoryDb.subscriptions = [];
    memoryDb.orders = [];
    memoryDb.payments = [];
    memoryDb.addresses = [];
    memoryDb.inventoryStock = 1500;

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully (0 fake orders/customers)",
      seededProduct: defaultProduct.productName,
    });
  } catch (error: any) {
    console.error("Seeding failed:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Add GET handler so they can seed by opening URL
export async function GET() {
  return POST();
}
