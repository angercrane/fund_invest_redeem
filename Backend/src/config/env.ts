import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/fund_db',
  blockchainRpcUrl: "https://ethereum-holesky-rpc.publicnode.com",
  contractAddress: `${process.env.CONTRACT_ADDRESS}`,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  privateKey: `${process.env.PRIVATE_KEY}`,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    username: process.env.REDIS_USERNAME || '',
    password: process.env.REDIS_PASSWORD
  }
};

// Validate required environment variables
const requiredEnvVars = ['CONTRACT_ADDRESS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 