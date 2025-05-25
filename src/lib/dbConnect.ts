import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the structure for the mongoose cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the NodeJS global type to include mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Store a reference to the cached connection
const globalMongoose = global as unknown as { mongoose?: MongooseCache };
let cached: MongooseCache = globalMongoose.mongoose || { conn: null, promise: null };

// Set the global mongoose cache if it doesn't exist
if (!globalMongoose.mongoose) {
  globalMongoose.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  // If we have a cached connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is already in progress, wait for it
  if (cached.promise) {
    return cached.promise;
  }

  const opts = {
    bufferCommands: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Create a new connection if none exists
  // We already checked that MONGODB_URI is not undefined at the top of the file
  cached.promise = mongoose.connect(MONGODB_URI as string, opts)
    .then((mongoose) => {
      return mongoose;
    });

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
