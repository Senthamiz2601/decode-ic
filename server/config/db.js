const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function connectDatabase() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);

    if (error.reason?.servers) {
      for (const [server, info] of error.reason.servers) {
        console.error(
          server,
          '=>',
          info.error?.message || info.type
        );
      }
    }

    process.exit(1);
  }
}

module.exports = connectDatabase;