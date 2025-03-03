//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFundToken {
    struct FundMetrics {
        uint256 totalAssetValue;
        uint256 sharesSupply;
        uint256 lastUpdateTime;
    }

    //Core Operations
    function invest(address investor, uint256 usdAmount) external returns (uint256 sharesIssued);
    function redeem(address investor, uint256 shares) external returns (uint256 usdAmount);

    //View Functions
    function getFundMetrics() external view returns (FundMetrics memory);
    function getSharePrice() external view returns (uint256); // USD per share (6 decimals)
    function balanceOf(address investor) external view returns (uint256);

    event Investment(
        address indexed investor,
        uint256 usdAmount,
        uint256 sharesIssued,
        uint256 sharePrice
    );

    event Redemtion(
        address indexed investor,
        uint256 shares,
        uint256 usdAmount,
        uint256 sharePrice
    );

    event MetricsUpdated(
        uint256 totalAssetValue,
        uint256 sharesSupply,
        uint256 sharePrice
    );
}