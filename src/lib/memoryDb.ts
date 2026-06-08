interface MemoryStore {
  orders: any[];
  subscriptions: any[];
  customers: any[];
  payments: any[];
  products: any[];
  addresses: any[];
  inventoryStock: number;
}

const defaultProduct = {
  _id: "mock_product_01",
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
};

// IMPORTANT: Only initialize if not already set — preserves order data across API route calls
if (!(global as any).memoryDb) {
  (global as any).memoryDb = {
    products: [defaultProduct],
    customers: [],
    subscriptions: [],
    orders: [],
    payments: [],
    addresses: [],
    inventoryStock: 1500,
  };
} else if (!(global as any).memoryDb.products?.length) {
  // Ensure default product is always available for checkout
  (global as any).memoryDb.products = [defaultProduct];
}

export const memoryDb = (global as any).memoryDb as MemoryStore;

export function seedMemoryDbWithDefaults() {
  memoryDb.products = [{ ...defaultProduct }];
  memoryDb.customers = [];
  memoryDb.subscriptions = [];
  memoryDb.orders = [];
  memoryDb.payments = [];
  memoryDb.addresses = [];
  memoryDb.inventoryStock = 1500;
}
