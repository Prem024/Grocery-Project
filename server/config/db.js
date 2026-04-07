const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 1. Check if a connection already exists
    // Vercel reuses function containers; this prevents creating multiple 
    // unnecessary connections every time an API is called.
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    // 2. Suppress strictQuery warnings for modern Mongoose versions
    mongoose.set('strictQuery', false);

    // 3. Connect with a timeout
    // serverSelectionTimeoutMS ensures the function fails fast if the 
    // database is unreachable, rather than hanging until Vercel kills it.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, 
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    
    // 4. CRITICAL: Remove process.exit(1)
    // On Vercel, exiting the process crashes the serverless instance.
    // Instead, throw the error so your Express error middleware can handle it.
    throw error; 
  }
};

module.exports = connectDB;
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`❌ MongoDB connection error: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
