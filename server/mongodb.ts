import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare-hms';

export async function connectToMongoDB() {
  try {
    // For development, use a simpler connection approach
    if (process.env.NODE_ENV === 'development') {
      console.log('MongoDB connection skipped in development - using in-memory storage');
      return;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing with in-memory storage for development');
  }
}

export default mongoose;