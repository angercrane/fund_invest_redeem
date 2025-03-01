import { Router } from 'express';
import { FundController } from '../controllers/FundController';
import { errorHandlerWrapper } from '../utils/errorHandler';
export function setupFundRoutes(fundController: FundController): Router {
  const router = Router();

  // Fund metrics endpoint
  router.get('/metrics', errorHandlerWrapper(fundController.getFundMetrics));

  // Investment endpoint
  router.post('/invest', errorHandlerWrapper(fundController.invest));

  // Redemption endpoint
  router.post('/redeem', errorHandlerWrapper(fundController.redeem));

  // Balance check endpoint
  router.get('/balance/:address', errorHandlerWrapper(fundController.getBalance));

  return router;
} 