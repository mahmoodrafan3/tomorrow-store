import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    // Do NOT exit — Render may restart; crashing immediately prevents
    // auto-healing and makes logs harder to read.
    return;
  }

  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB Error (attempt ${retries}/${maxRetries}): ${error.message}`);
      if (retries >= maxRetries) {
        console.error('❌ Could not connect to MongoDB after multiple attempts. Server will serve API responses that fail gracefully.');
        return;
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
    }
  }
};

export default connectDB;
