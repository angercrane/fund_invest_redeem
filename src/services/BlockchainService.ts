import { ethers } from 'ethers';
import { FundMetrics } from '../types/fund.types';
import fundABI from "../abi/FundToken.json";

export class BlockchainService {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(
    contractAddress: any,
    providerUrl: string,
    privateKey: string
  ) {
    const provider = new ethers.JsonRpcProvider(providerUrl);
    this.signer = new ethers.Wallet(privateKey, provider);
    this.contract = new ethers.Contract(contractAddress, fundABI, this.signer);
  }

  async getFundMetrics(): Promise<FundMetrics> {
    try {
      const metrics = await this.contract.getFundMetrics();
      const sharePrice = await this.contract.getSharePrice();
      
      return {
        totalAssetValue: Number(metrics.totalAssetValue),
        sharesSupply: Number(metrics.sharesSupply),
        lastUpdateTime: Number(metrics.lastUpdateTime),
        sharePrice: Number(sharePrice)
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch fund metrics: ${error.message}`);
    }
  }

  async invest(investorAddress: string, usdAmount: number): Promise<string> {
    try {
      const tx = await this.contract.invest(investorAddress, usdAmount);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error: any) {
      throw new Error(`Investment failed: ${error.message}`);
    }
  }

  async redeem(investorAddress: string, shares: number): Promise<string> {
    try {
      const tx = await this.contract.redeem(investorAddress, shares);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error: any) {
      throw new Error(`Redemption failed: ${error.message}`);
    }
  }

  async getBalance(investorAddress: string): Promise<number> {
    try {
      const balance = await this.contract.balanceOf(investorAddress);
      return Number(balance);
    } catch (error: any) {
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }
  }
} 