import dotenv from 'dotenv';
dotenv.config();
import { ethers } from 'hardhat';

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);

    const FundToken = await ethers.getContractFactory("FundToken");
    console.log("Deploying FundToken...");

    // Initial asset value of $1,000,000 with 6 decimals
    const initialAssetValue = ethers.utils.parseUnits("1000000", 6);

    // Deploy the contract with initial asset value
    const fundToken = await FundToken.deploy(initialAssetValue);
    await fundToken.deployed();

    console.log("FundToken deployed to:", fundToken.address);
    console.log("Initial asset value:", ethers.utils.formatUnits(initialAssetValue, 6), "USD");

    // Log initial metrics
    const metrics = await fundToken.getFundMetrics();
    console.log("\nInitial Fund Metrics:");
    console.log("Total Asset Value:", ethers.utils.formatUnits(metrics.totalAssetValue, 6), "USD");
    console.log("Shares Supply:", ethers.utils.formatUnits(metrics.sharesSupply, 6));
    console.log("Share Price:", ethers.utils.formatUnits(await fundToken.getSharePrice(), 6), "USD");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error during deployment:", error);
        process.exit(1);
    });