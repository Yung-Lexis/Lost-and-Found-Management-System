const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_and_found';
  
  try {
    // Attempt standard connection first
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if no local MongoDB service
    });
    console.log(`✓ Connected to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`! Could not connect to primary MongoDB at ${uri}. (${err.message})`);
    console.log('⚡ Initializing resilient in-memory MongoDB fallback for instant zero-config operation...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      
      await mongoose.connect(memUri);
      console.log(`✓ Connected to In-Memory MongoDB at: ${memUri}`);
    } catch (memErr) {
      console.error('✗ Failed to connect to In-Memory MongoDB:', memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
