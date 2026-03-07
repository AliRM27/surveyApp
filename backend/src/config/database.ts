import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};
