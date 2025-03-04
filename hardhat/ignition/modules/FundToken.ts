import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FundTokenModule = buildModule("FundTokenModule", (m) => {

    const initialAssetValue = m.getParameter("initialAssetValue", 1000000 * 1e6);

    const fundToken = m.contract("FundToken", [initialAssetValue]);
    return { fundToken };
});

export default FundTokenModule;
