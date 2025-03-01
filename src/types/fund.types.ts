export interface FundMetrics {
  totalAssetValue: number; // Total fund value in USD (6 decimals)
  sharesSupply: number; // Total supply of shares
  lastUpdateTime: number; // Last update timestamp
  sharePrice: number; // Calculated share price
}

export interface InvestmentRequest {
  investorAddress: string;
  usdAmount: number;
}

export interface RedemptionRequest {
  investorAddress: string;
  shares: number;
} 