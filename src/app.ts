import express from 'express';
import { createConnection } from 'typeorm';
import { caching } from 'cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { setupFundRoutes } from './routes';
import { BlockchainService, FundService } from './services';
import { FundController } from './controllers';
import { Transaction } from './entities';
import { errorHandlerMiddleware } from './middleware';
import { Logger } from './utils';
import { config } from './config';

async function bootstrap() {
  // Create Express app
  const app = express();
  app.use(express.json());

  // Database connection
  const connection = await createConnection({
    type: 'postgres',
    url: config.databaseUrl,
    entities: [Transaction],
    synchronize: true // Be careful with this in production
  });

  const cache = await caching(await redisStore({
    url: `redis://${config.redis.host}:${config.redis.port}`,
    password: config.redis.password,
    ttl: 300 // 5 minutes in seconds
  }));

  // Initialize services
  const blockchainService = new BlockchainService(
    config.contractAddress,
    config.blockchainRpcUrl,
    config.privateKey
  );

  const fundService = new FundService(
    blockchainService,
    connection.getRepository(Transaction),
    cache
  );

  const fundController = new FundController(fundService);

  // Setup routes
  app.use('/api/fund', setupFundRoutes(fundController));

  // Error handling middleware
  app.use(errorHandlerMiddleware);

  // Start server
  const port = config.port;
  app.listen(port, () => {
    Logger.log(`Server running on port ${port}`);
  });
}

bootstrap().catch(Logger.error);