import { Router } from 'express';
import { FundController } from '../controllers/FundController';
import { errorHandlerWrapper } from '../utils/errorHandler';
export function setupFundRoutes(fundController: FundController): Router {
  const router = Router();

  // Fund metrics endpoint
  router.get('/metrics', errorHandlerWrapper((req, res) => fundController.getFundMetrics(req, res)));

  // Investment endpoint
  router.post('/invest', errorHandlerWrapper((req, res) => fundController.invest(req, res)));

  // Redemption endpoint
  router.post('/redeem', errorHandlerWrapper((req, res) => fundController.redeem(req, res)));

  // Balance check endpoint
  router.get('/balance/:address', errorHandlerWrapper((req, res) => fundController.getBalance(req, res)));

  return router;
} 