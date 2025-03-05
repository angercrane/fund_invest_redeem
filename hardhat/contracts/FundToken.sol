// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IFundToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract FundToken is IFundToken, Ownable, ReentrancyGuard, Pausable {
    // State variables
    FundMetrics private fundMetrics;
    mapping(address => uint256) private investorShares;
    
    // Constants 
    uint256 private constant PRICE_DECIMALS = 1e6;  // 6 decimals for USD price
    uint256 private constant MIN_INVESTMENT = 100 * PRICE_DECIMALS; // Minimum 100 USD

    constructor(uint256 initialAssetValue) {
        fundMetrics.totalAssetValue = initialAssetValue;
        fundMetrics.sharesSupply = initialAssetValue;  // Initialize shares supply to match initial asset value
        fundMetrics.lastUpdateTime = block.timestamp;
    }

    // Core Operations
    function invest(address investor, uint256 usdAmount) 
        external 
        override 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
        returns (uint256 sharesIssued) 
    {
        require(usdAmount * PRICE_DECIMALS >= MIN_INVESTMENT, "Investment below minimum");
        require(investor != address(0), "Invalid investor address");

        uint256 currentSharePrice = getSharePrice();
        require(currentSharePrice > 0, "Invalid share price");

        // Calculate shares to issue: USD amount / price per share
        sharesIssued = usdAmount / currentSharePrice;
        require(sharesIssued > 0, "Investment too small for shares");

        // Update state
        investorShares[investor] += sharesIssued * PRICE_DECIMALS;
        fundMetrics.sharesSupply -= sharesIssued * PRICE_DECIMALS;
        fundMetrics.totalAssetValue += usdAmount * PRICE_DECIMALS;
        fundMetrics.lastUpdateTime = block.timestamp;

        emit Investment(
            investor,
            usdAmount,
            sharesIssued,
            currentSharePrice
        );

        return sharesIssued;
    }

    function redeem(address investor, uint256 shares) 
        external 
        override 
        onlyOwner 
        nonReentrant 
        whenNotPaused 
        returns (uint256 usdAmount) 
    {
        require(shares > 0, "Must redeem positive shares");
        require(investorShares[investor] >= shares, "Insufficient shares");

        uint256 currentSharePrice = getSharePrice();
        require(currentSharePrice > 0, "Invalid share price");

        // Calculate USD amount: shares * price per share
        usdAmount = shares * currentSharePrice;
        require(usdAmount * PRICE_DECIMALS <= fundMetrics.totalAssetValue, "Insufficient fund balance");

        // Update state
        investorShares[investor] -= shares * PRICE_DECIMALS;
        fundMetrics.sharesSupply += shares * PRICE_DECIMALS;
        fundMetrics.totalAssetValue -= usdAmount * PRICE_DECIMALS;
        fundMetrics.lastUpdateTime = block.timestamp;

        emit Redemtion(
            investor,
            shares,
            usdAmount,
            currentSharePrice
        );

        return usdAmount;
    }

    // View Functions
    function getFundMetrics() external view override returns (FundMetrics memory) {
        return fundMetrics;
    }

    function getSharePrice() public view override returns (uint256) {
        if (fundMetrics.sharesSupply == 0) return 1; // Initial price of 1 USD
        return (fundMetrics.totalAssetValue) / fundMetrics.sharesSupply;
    }

    function balanceOf(address investor) external view override returns (uint256) {
        return investorShares[investor] / PRICE_DECIMALS;
    }

    // Admin functions
    function updateMetrics(uint256 newTotalAssetValue) external onlyOwner {
        require(newTotalAssetValue > 0, "Invalid asset value");
        
        fundMetrics.totalAssetValue = newTotalAssetValue;
        fundMetrics.lastUpdateTime = block.timestamp;
        
        emit MetricsUpdated(
            fundMetrics.totalAssetValue,
            fundMetrics.sharesSupply,
            getSharePrice()
        );
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
