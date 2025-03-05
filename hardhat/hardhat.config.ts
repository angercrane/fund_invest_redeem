import { HardhatUserConfig } from "hardhat/types";

import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const HOLESKY_RPC_URL = process.env.HOLESKY_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    holesky: {
      url: "https://holesky.gateway.tenderly.co",
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};

export default config;