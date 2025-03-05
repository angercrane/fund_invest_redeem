import { Repository } from 'typeorm';
import { BlockchainService } from './BlockchainService';
import { Transaction, TransactionType } from '../entities';
import { FundMetrics, InvestmentRequest, RedemptionRequest } from '../types';
import { Cache } from 'cache-manager';

export class FundService {
  constructor(
    private blockchainService: BlockchainService,
    private transactionRepository: Repository<Transaction>,
    private cacheManager: Cache
  ) {}

  async getFundMetrics(): Promise<FundMetrics> {
    try {
      // Try to get from cache first
      const cachedMetrics = await this.cacheManager.get<FundMetrics>('fundMetrics');
      if (cachedMetrics) {
        return cachedMetrics;
      }

      // If not in cache, get from blockchain
      const metrics = await this.blockchainService.getFundMetrics();
      
      // Cache the metrics for 5 minutes
      await this.cacheManager.set('fundMetrics', metrics, 300000);
      
      return metrics;
    } catch (error: any) {
      throw new Error(`Failed to get fund metrics: ${error.message}`);
    }
  }

  async invest(request: InvestmentRequest): Promise<Transaction> {
    try {
      const metrics = await this.getFundMetrics();
      const txHash = await this.blockchainService.invest(
        request.investorAddress,
        request.usdAmount
      );

      const sharesIssued = request.usdAmount / metrics.sharePrice;

      const transaction = this.transactionRepository.create({
        investorAddress: request.investorAddress,
        usdAmount: request.usdAmount,
        shares: sharesIssued,
        sharePrice: metrics.sharePrice,
        type: TransactionType.INVESTMENT,
        transactionHash: txHash
      });

      await this.transactionRepository.save(transaction);
      await this.cacheManager.del('fundMetrics'); // Invalidate cache

      return transaction;
    } catch (error: any) {
      throw new Error(`Investment failed: ${error.message}`);
    }
  }

  async redeem(request: RedemptionRequest): Promise<Transaction> {
    try {
      const metrics = await this.getFundMetrics();
      const txHash = await this.blockchainService.redeem(
        request.investorAddress,
        request.shares
      );

      const usdAmount = request.shares * metrics.sharePrice;

      const transaction = this.transactionRepository.create({
        investorAddress: request.investorAddress,
        usdAmount: usdAmount,
        shares: request.shares,
        sharePrice: metrics.sharePrice,
        type: TransactionType.REDEMPTION,
        transactionHash: txHash
      });

      await this.transactionRepository.save(transaction);
      await this.cacheManager.del('fundMetrics'); // Invalidate cache

      return transaction;
    } catch (error: any) {
      throw new Error(`Redemption failed: ${error.message}`);
    }
  }

  async getBalance(investorAddress: string): Promise<number> {
    try {
      return await this.blockchainService.getBalance(investorAddress);
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }
} 