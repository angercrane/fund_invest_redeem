import Web3 from 'web3';
import { FundMetrics } from '../types';
import FundTokenABI from "../abi/FundToken.json";

export class BlockchainService {
  private web3: Web3;
  private contract: any;
  private account: any;

  constructor(
    contractAddress: string,
    providerUrl: string,
    privateKey: string
  ) {

    // Initialize Web3 provider
    this.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
    
    // Create account from private key
    this.account = this.web3.eth.accounts.privateKeyToAccount(`0x${privateKey}`);
    this.web3.eth.accounts.wallet.add(this.account);
    
    // Initialize contract
    this.contract = new this.web3.eth.Contract(FundTokenABI, contractAddress);
  }

  async getFundMetrics(): Promise<FundMetrics> {
    try {
      const metrics = await this.contract.methods.getFundMetrics().call({
        from: this.account.address
      });
      const sharePrice = await this.contract.methods.getSharePrice().call({
        from: this.account.address
      });
      
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
      const tx = this.contract.methods.invest(investorAddress, usdAmount);
      const gas = await tx.estimateGas({ from: this.account.address });
      const receipt = await tx.send({
        from: this.account.address,
        gas
      });
      return receipt.transactionHash;
    } catch (error: any) {
      throw new Error(`Investment failed: ${error.message}`);
    }
  }

  async redeem(investorAddress: string, shares: number): Promise<string> {
    try {
      const tx = this.contract.methods.redeem(investorAddress, shares);
      const gas = await tx.estimateGas({ from: this.account.address });
      const receipt = await tx.send({
        from: this.account.address,
        gas
      });
      return receipt.transactionHash;
    } catch (error: any) {
      throw new Error(`Redemption failed: ${error.message}`);
    }
  }

  async getBalance(investorAddress: string): Promise<number> {
    try {
      const balance = await this.contract.methods.balanceOf(investorAddress).call();
      return Number(balance);
    } catch (error: any) {
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }
  }
} 