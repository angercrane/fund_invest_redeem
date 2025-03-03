import { expect } from "chai";
import { ethers } from "hardhat";
import { FundToken } from "../typechain-types";
import { BigNumber } from "ethers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("FundToken", function () {
    let fundToken: FundToken;
    let owner: any;
    let investor1: any;
    
    const INITIAL_ASSET_VALUE: BigNumber = ethers.utils.parseUnits("1000000", 6); // $1M initial value
    const PRICE_DECIMALS: BigNumber = ethers.utils.parseUnits("1", 6);
    const MIN_INVESTMENT: BigNumber = ethers.utils.parseUnits("100", 6); // $100 minimum

    beforeEach(async function () {
        // Get signers
        [owner, investor1] = await ethers.getSigners();

        // Deploy contract
        const FundToken = await ethers.getContractFactory("FundToken");
        fundToken = await FundToken.deploy(INITIAL_ASSET_VALUE);
        await fundToken.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const fundTokenOwner = await fundToken.owner();
            expect(fundTokenOwner).to.equal(owner.address);
        });

        it("Should initialize with correct fund metrics", async function () {
            const metrics = await fundToken.getFundMetrics();
            expect(metrics.totalAssetValue).to.equal(INITIAL_ASSET_VALUE);
            expect(metrics.sharesSupply).to.equal(0);
        });

        it("Should have initial share price of 1 USD", async function () {
            const sharePrice = await fundToken.getSharePrice();
            expect(sharePrice).to.equal(PRICE_DECIMALS);
        });
    });

    describe("Investments", function () {
        it("Should allow investment and issue correct shares", async function () {
            const investAmount: BigNumber = ethers.utils.parseUnits("1000", 6); // $1000
            const tx = await fundToken.invest(investor1.address, investAmount);
            await tx.wait();

            const shares = await fundToken.balanceOf(investor1.address);
            expect(shares).to.equal(investAmount); // At 1 USD per share initially

            const metrics = await fundToken.getFundMetrics();
            expect(metrics.totalAssetValue).to.equal(INITIAL_ASSET_VALUE.add(investAmount));
            expect(metrics.sharesSupply).to.equal(investAmount);
        });

        it("Should reject investment below minimum", async function () {
            const smallAmount: BigNumber = ethers.utils.parseUnits("50", 6); // $50
            await expect(
                fundToken.invest(investor1.address, smallAmount)
            ).to.be.revertedWith("Investment below minimum");
        });

        it("Should reject investment from non-owner", async function () {
            const investAmount: BigNumber = ethers.utils.parseUnits("1000", 6);
            await expect(
                fundToken.connect(investor1).invest(investor1.address, investAmount)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Redemptions", function () {
        const initialInvestment: BigNumber = ethers.utils.parseUnits("1000", 6);

        beforeEach(async function () {
            // Setup: Make an initial investment
            await fundToken.invest(investor1.address, initialInvestment);
        });

        it("Should allow redemption and return correct USD amount", async function () {
            const sharesToRedeem: BigNumber = ethers.utils.parseUnits("500", 6);
            const tx = await fundToken.redeem(investor1.address, sharesToRedeem);
            await tx.wait();

            const remainingShares = await fundToken.balanceOf(investor1.address);
            expect(remainingShares).to.equal(initialInvestment.sub(sharesToRedeem));

            const metrics = await fundToken.getFundMetrics();
            expect(metrics.sharesSupply).to.equal(initialInvestment.sub(sharesToRedeem));
        });

        it("Should reject redemption of more shares than owned", async function () {
            const tooManyShares: BigNumber = ethers.utils.parseUnits("2000", 6);
            await expect(
                fundToken.redeem(investor1.address, tooManyShares)
            ).to.be.revertedWith("Insufficient shares");
        });

        it("Should reject redemption of zero shares", async function () {
            await expect(
                fundToken.redeem(investor1.address, 0)
            ).to.be.revertedWith("Must redeem positive shares");
        });

        it("Should reject redemption from non-owner", async function () {
            const shares: BigNumber = ethers.utils.parseUnits("500", 6);
            await expect(
                fundToken.connect(investor1).redeem(investor1.address, shares)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Price Updates", function () {
        const initialInvestment: BigNumber = ethers.utils.parseUnits("1000", 6);

        beforeEach(async function () {
            await fundToken.invest(investor1.address, initialInvestment);
        });

        it("Should correctly update metrics and share price", async function () {
            const newAssetValue: BigNumber = ethers.utils.parseUnits("1500000", 6); // $1.5M
            const tx = await fundToken.updateMetrics(newAssetValue);
            await tx.wait();

            const metrics = await fundToken.getFundMetrics();
            expect(metrics.totalAssetValue).to.equal(newAssetValue);

            const newSharePrice = await fundToken.getSharePrice();
            expect(newSharePrice).to.be.gt(PRICE_DECIMALS);
        });

        it("Should reject invalid asset value updates", async function () {
            await expect(
                fundToken.updateMetrics(0)
            ).to.be.revertedWith("Invalid asset value");
        });
    });

    describe("Pause Functionality", function () {
        it("Should prevent investments when paused", async function () {
            await fundToken.pause();
            
            await expect(
                fundToken.invest(investor1.address, MIN_INVESTMENT)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow investments after unpause", async function () {
            await fundToken.pause();
            await fundToken.unpause();

            const tx = await fundToken.invest(investor1.address, MIN_INVESTMENT);
            await tx.wait();

            const shares = await fundToken.balanceOf(investor1.address);
            expect(shares).to.be.gt(0);
        });
    });
}); 