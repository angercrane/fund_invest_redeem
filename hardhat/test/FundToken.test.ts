import { expect } from "chai";
import { ethers } from "hardhat";
import { FundToken } from "../typechain-types";
import { BigNumber } from "ethers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("FundToken", function () {
    let fundToken: FundToken;
    let owner: any;
    let investor1: any;
    let investor2: any;
    
    const INITIAL_ASSET_VALUE: BigNumber = ethers.utils.parseUnits("10000", 6); // $10,000 initial value
    const PRICE_DECIMALS: BigNumber = ethers.utils.parseUnits("1", 6);
    const MIN_INVESTMENT: BigNumber = ethers.utils.parseUnits("100", 6); // $100 minimum

    beforeEach(async function () {
        // Get signers
        [owner, investor1, investor2] = await ethers.getSigners();

        // Deploy contract
        const FundToken = await ethers.getContractFactory("FundToken");
        fundToken = await FundToken.deploy(INITIAL_ASSET_VALUE);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const fundTokenOwner = await fundToken.owner();
            expect(fundTokenOwner).to.equal(owner.address);
        });

        it("Should initialize with correct fund metrics", async function () {
            const metrics = await fundToken.getFundMetrics();
            expect(metrics.totalAssetValue).to.equal(INITIAL_ASSET_VALUE);
            expect(metrics.sharesSupply).to.equal(INITIAL_ASSET_VALUE);
            expect(metrics.lastUpdateTime).to.be.gt(0);
        });

        it("Should have initial share price of 1 USD", async function () {
            const sharePrice = await fundToken.getSharePrice();
            expect(sharePrice).to.equal(1);
        });
    });

    describe("Investments", function () {
        it("Should allow investment and issue correct shares", async function () {
            const investAmount = ethers.utils.parseUnits("1000", 0); // $1000
            
            await fundToken.invest(investor1.address, investAmount);
            const shares = await fundToken.balanceOf(investor1.address);
            const sharesBigInt = ethers.utils.parseUnits(shares.toString(), 0);
            console.log("shares", sharesBigInt);
            console.log("investAmount", investAmount);
            expect(sharesBigInt).to.equal(investAmount);
            const metrics = await fundToken.getFundMetrics();
            expect(metrics.totalAssetValue).to.equal(INITIAL_ASSET_VALUE.add(investAmount.mul(PRICE_DECIMALS)));
            expect(metrics.sharesSupply).to.equal(INITIAL_ASSET_VALUE.sub(sharesBigInt.mul(PRICE_DECIMALS)));
        });

        it("Should reject investment to zero address", async function () {
            const investAmount = ethers.utils.parseUnits("1000", 6);
            await expect(
                fundToken.invest(ethers.constants.AddressZero, investAmount)
            ).to.be.revertedWith("Invalid investor address");
        });

        it("Should reject investment below minimum", async function () {
            const smallAmount: BigNumber = ethers.utils.parseUnits("50", 0); // $50
            await expect(
                fundToken.invest(investor1.address, smallAmount)
            ).to.be.revertedWith("Investment below minimum");
        });

        it("Should reject investment from non-owner", async function () {
            const investAmount: BigNumber = ethers.utils.parseUnits("1000", 0);
            await expect(
                fundToken.connect(investor1).invest(investor1.address, investAmount)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Redemptions", function () {
        const initialInvestment = ethers.utils.parseUnits("1000", 0);

        beforeEach(async function () {
            await fundToken.invest(investor1.address, initialInvestment);
        });

        it("Should allow redemption with correct state updates", async function () {
            const sharesToRedeem = ethers.utils.parseUnits("500", 0);
            
            // Get initial metrics
            const initialMetrics = await fundToken.getFundMetrics();
            
            await fundToken.redeem(investor1.address, sharesToRedeem);

            // Check remaining shares for investor
            const remainingShares = await fundToken.balanceOf(investor1.address);
            expect(remainingShares).to.equal(initialInvestment.sub(sharesToRedeem));
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
        const initialInvestment = ethers.utils.parseUnits("1000", 6);

        beforeEach(async function () {
            await fundToken.invest(investor1.address, initialInvestment);
        });

    });

    describe("Pause Functionality", function () {
        it("Should prevent investments when paused", async function () {
            await fundToken.pause();
            
            await expect(
                fundToken.invest(investor1.address, MIN_INVESTMENT)
            ).to.be.revertedWith("Pausable: paused");
        });
    });
});