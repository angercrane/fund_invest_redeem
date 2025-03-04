import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/fund_db',
  blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  privateKey: process.env.PRIVATE_KEY || ''
};

// Validate required environment variables
const requiredEnvVars = ['CONTRACT_ADDRESS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 