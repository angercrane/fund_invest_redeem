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
        require(usdAmount >= MIN_INVESTMENT, "Investment below minimum");
        require(investor != address(0), "Invalid investor address");

        uint256 currentSharePrice = getSharePrice();
        require(currentSharePrice > 0, "Invalid share price");

        // Calculate shares to issue: USD amount / price per share
        sharesIssued = (usdAmount * PRICE_DECIMALS) / currentSharePrice;
        require(sharesIssued > 0, "Investment too small for shares");

        // Update state
        investorShares[investor] += sharesIssued;
        fundMetrics.sharesSupply += sharesIssued;
        fundMetrics.totalAssetValue += usdAmount;
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
        usdAmount = (shares * currentSharePrice) / PRICE_DECIMALS;
        require(usdAmount <= fundMetrics.totalAssetValue, "Insufficient fund balance");

        // Update state
        investorShares[investor] -= shares;
        fundMetrics.sharesSupply -= shares;
        fundMetrics.totalAssetValue -= usdAmount;
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
        if (fundMetrics.sharesSupply == 0) return PRICE_DECIMALS; // Initial price of 1 USD
        return (fundMetrics.totalAssetValue * PRICE_DECIMALS) / fundMetrics.sharesSupply;
    }

    function balanceOf(address investor) external view override returns (uint256) {
        return investorShares[investor];
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
