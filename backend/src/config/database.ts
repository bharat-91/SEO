import mongoose from 'mongoose';
import { getConfig } from './index.js';
import { getLogger } from '../utils/logger.js';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    return;
  }

  const logger = getLogger();
  const config = getConfig();

  try {
    logger.info('Connecting to MongoDB...');

    await mongoose.connect(config.MONGODB_URI);

    isConnected = true;
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  const logger = getLogger();

  try {
    logger.info('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}
