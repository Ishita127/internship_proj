import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Falls back to a local database if MONGO_URI is missing
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_assignment';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};