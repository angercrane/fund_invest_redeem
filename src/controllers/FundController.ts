import { Request, Response } from 'express';
import { FundService } from '../services/FundService';
import { httpStatus } from '../config';

export class FundController {
  constructor(private fundService: FundService) {}

  async getFundMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.fundService.getFundMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async invest(req: Request, res: Response) {
    try {
      const { investorAddress, usdAmount } = req.body;
      
      if (!investorAddress || !usdAmount) {
        return res.status(httpStatus.BAD_REQUEST).json({ error: 'Missing required parameters' });
      }

      const transaction = await this.fundService.invest({ investorAddress, usdAmount });
      res.json(transaction);
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async redeem(req: Request, res: Response) {
    try {
      const { investorAddress, shares } = req.body;
      
      if (!investorAddress || !shares) {
        return res.status(httpStatus.BAD_REQUEST).json({ error: 'Missing required parameters' });
      }

      const transaction = await this.fundService.redeem({ investorAddress, shares });
      res.json(transaction);
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getBalance(req: Request, res: Response) {
    try {
      const { address } = req.params;
      
      if (!address) {
        return res.status(httpStatus.BAD_REQUEST).json({ error: 'Missing investor address' });
      }

      const balance = await this.fundService.getBalance(address);
      res.json({ address, balance });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
} 