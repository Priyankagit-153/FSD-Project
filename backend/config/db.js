const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isPlaceholder = !uri || uri.includes('PASTE_YOUR_ATLAS_CONNECTION_STRING_HERE');

  if (!isPlaceholder) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[Database] Connected to MongoDB Atlas: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[Database] Failed to connect to MongoDB Atlas at ${uri}: ${err.message}`);
      console.log('[Database] Falling back to MongoDB Memory Server for local development...');
    }
  } else {
    console.log('[Database] MONGO_URI contains placeholder. Initializing local MongoDB Memory Server...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'resource_sharing_platform'
      }
    });
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to in-memory MongoDB at: ${memoryUri}`);
    console.log('[Database] Note: To persist to MongoDB Atlas, add your Atlas connection string to backend/.env');
    return conn;
  } catch (memErr) {
    console.error(`[Database] Critical: Could not connect to MongoDB: ${memErr.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
