import express from 'express';
import { createConnection } from 'typeorm';
import { caching } from 'cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { setupFundRoutes } from './routes';
import { FundService, BlockchainService } from './services';
import { FundController } from './controllers';
import { Transaction } from './entities';
import { errorHandlerMiddleware } from './middlewares';
import { Logger } from './utils';
import { config } from './config';

async function bootstrap() {
    //Create Express app
    const app = express();
    app.use(express.json());

    //Database Connection
    const connection = await createConnection({
        type: "postgres",
        url: config.databaseUrl,
        entities: [Transaction],
        synchronize: true,
    });

    const cache = await caching(await redisStore({
        url: `redis://${config.redis.host}:${config.redis.port}`,
        password: config.redis.password,
        ttl: 300,
    }));

    //Initialize services
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

    //Initialize controllers
    const fundController = new FundController(fundService);

    //Setup routes
    app.use('/api/fund', setupFundRoutes(fundController));

    //Error handling middleware
    app.use(errorHandlerMiddleware);

    //Start server
    const port = config.port;
    app.listen(port, () => {
        Logger.log(`Server is running on port ${port}`);
    })
}

bootstrap().catch(Logger.error);