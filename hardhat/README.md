# Fund Token Smart Contract

This project implements a fund management smart contract using Hardhat. The contract allows for investments and redemptions in USD terms, with share price calculations and administrative controls.

## Project Structure 

```
hardhat/
├── contracts/
│   ├── FundToken.sol        # Main contract implementation
│   └── IFundToken.sol       # Interface definition
├── scripts/
│   └── deploy.js            # Deployment script
├── test/
│   └── FundToken.test.js    # Test suite
├── .env                     # Environment variables
└── hardhat.config.js        # Hardhat configuration
```

## Features

- USD-denominated investments and redemptions
- Dynamic share price calculation
- Owner-controlled operations
- Pausable functionality
- Reentrancy protection
- Minimum investment requirements

## Smart Contract Details

### IFundToken Interface
- Defines the core functionality for the fund token
- Includes struct for fund metrics
- Declares events for investments, redemptions, and updates

### FundToken Implementation
- Implements IFundToken interface
- Uses OpenZeppelin contracts for security features
- Handles share price calculations with 6 decimal precision
- Includes admin functions for fund management

## Getting Started

### Prerequisites

- Node.js v16 or later
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the hardhat directory with:
```
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### Testing

Run the test suite:
```bash
npx hardhat test
```

### Deployment

Deploy to local network:
```bash
npx hardhat run scripts/deploy.js --network hardhat
```

Deploy to Sepolia testnet:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Core Functions

### Investment
```solidity
function invest(address investor, uint256 usdAmount) external returns (uint256)
```
- Accepts USD-denominated investments
- Calculates and issues shares based on current share price
- Minimum investment: 100 USD

### Redemption
```solidity
function redeem(address investor, uint256 shares) external returns (uint256)
```
- Allows share redemption for USD value
- Calculates redemption amount based on current share price
- Includes balance and ownership checks

### Price Calculation
```solidity
function getSharePrice() public view returns (uint256)
```
- Calculates current share price
- Uses 6 decimal precision for USD values
- Based on total assets and share supply

## Security Features

1. Access Control
   - Owner-only functions
   - Pausable operations
   - Role-based permissions

2. Safety Checks
   - Reentrancy protection
   - Input validation
   - Balance verification

3. Precision Handling
   - 6 decimal places for USD
   - Safe math operations
   - Overflow protection

## Testing Coverage

The test suite includes:
- Deployment validation
- Investment scenarios
- Redemption cases
- Price calculations
- Access control
- Emergency functions
- Edge cases

## Network Configuration

Supported networks in hardhat.config.js:
- Hardhat local network
- Sepolia testnet
- Configurable for other networks

## Development Workflow

1. Make changes to contracts
2. Update tests
3. Run test suite
4. Deploy to test network
5. Verify contract

## License

This project is licensed under the MIT License.

