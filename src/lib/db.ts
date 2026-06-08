import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// ⚠️ We no longer throw at module load — routes that use the file-store
// fallback should not crash just because MONGODB_URI is absent.

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

let lastConnectFailureTime = 0;
// Increased from 15 s → 5 mins (300,000 ms) to avoid frequent slow retries when Atlas is down
const FAILURE_COOLDOWN_MS = 300000;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured — falling back to file store.');
  }

  // Return existing live connection immediately
  if (cached.conn) {
    return cached.conn;
  }

  // Cooldown check to prevent blocking request loop when Atlas is down
  const cooldownRemaining = FAILURE_COOLDOWN_MS - (Date.now() - lastConnectFailureTime);
  if (cooldownRemaining > 0) {
    throw new Error(
      `MongoDB connection in cooldown (${Math.ceil(cooldownRemaining / 1000)}s remaining).`
    );
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Reduced from 4s → 2s — fail fast so requests don't hang
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
      socketTimeoutMS: 4000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ Successfully connected to MongoDB Atlas.');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        lastConnectFailureTime = Date.now();
        console.error('❌ MongoDB connection failed:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
