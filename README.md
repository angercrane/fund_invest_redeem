# Investment Fund Management System

A backend service that manages investments in a fund through smart contract integration. The system handles investment and redemption operations while tracking fund value and investor positions.

## Features

- Process investments and redemptions through smart contracts
- Track and cache fund metrics
- Record transaction history
- RESTful API endpoints
- PostgreSQL database integration
- In-memory caching
- Error handling and logging

## System Architecture

### Components

- **Express Server**: Main application server
- **TypeORM**: Database ORM for PostgreSQL
- **Cache Manager**: In-memory caching for fund metrics
- **Blockchain Service**: Handles smart contract interactions using ethers.js
- **Fund Service**: Core business logic layer
- **Controllers**: API endpoint handlers
- **Error Handling Middleware**: Centralized error processing

### Data Flow

1. Client makes API request
2. Controller validates input
3. Service layer processes request
4. Blockchain interaction if needed
5. Database update
6. Cache invalidation/update
7. Response returned to client

## Prerequisites

- Node.js >= 16.0.0
- PostgreSQL
- Ethereum node access (local or testnet)
- Smart contract deployed with ABI available

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/fund_db

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=your_contract_address
PRIVATE_KEY=your_private_key

# Optional: Testnet Configuration (e.g., Holesky)
TESTNET_RPC_URL=https://ethereum-holesky-rpc.publicnode.com
TESTNET_CONTRACT_ADDRESS=your_testnet_contract_address
TESTNET_PRIVATE_KEY=your_testnet_private_key

# Cache Configuration
CACHE_TTL=300 # Cache time-to-live in seconds
CACHE_MAX_ITEMS=100 # Maximum items in cache

# Logging Configuration
LOG_LEVEL=info # Options: error, warn, info, debug
```

**Note**: Replace placeholders (e.g., `your_contract_address`, `your_private_key`) with actual values. Do not commit the `.env` file to version control.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```
2. Backend 
```bash
cd Backend

3. Install dependencies:
```bash
npx bun install
```

4. Build the project:
```bash
npx bun build
```

5. Start the server:
```bash
npx bun start
```

For development:
```bash
npx bun dev
```

## API Endpoints

### Fund Metrics
```
GET /api/fund/metrics
```
Returns current fund metrics including total asset value, shares supply, and share price.

### Investment
```
POST /api/fund/invest
```
Body:
```json
{
  "investorAddress": "0x...",
  "usdAmount": 1000.00
}
```

### Redemption
```
POST /api/fund/redeem
```
Body:
```json
{
  "investorAddress": "0x...",
  "shares": 100.00
}
```

### Balance Check
```
GET /api/fund/balance/:address
```
Returns the current balance for a given investor address.

## Error Handling

The system implements a centralized error handling approach with custom error types:
- BadRequestError
- NotFoundError
- UnauthorizedError
- InternalServerError
- DuplicationError
- ArgumentValidationError
- CustomError

All errors are logged and returned with appropriate HTTP status codes.

## Caching Strategy

- Fund metrics are cached for 5 minutes
- Cache is invalidated after investment/redemption operations
- Maximum 100 items in cache
- Memory-based caching for quick access

## Database Schema

### Transaction Entity
- id: UUID (Primary Key)
- investorAddress: string
- usdAmount: decimal(18,6)
- shares: decimal(18,6)
- sharePrice: decimal(18,6)
- type: enum (INVESTMENT/REDEMPTION)
- transactionHash: string
- createdAt: timestamp

## Testing

Run tests using:
```bash
npm test
```

## Design Decisions

1. **TypeORM**: Chosen for its TypeScript support and robust feature set
2. **In-memory Caching**: Used for fund metrics to reduce blockchain calls
3. **Repository Pattern**: Implemented for clean separation of concerns
4. **Middleware Approach**: Centralized error handling and request processing
5. **Service Layer**: Encapsulates business logic and blockchain interactions

## Security Considerations

- Private key management through environment variables
- Input validation on all endpoints
- Error messages don't expose internal details
- Transaction handling with proper error recovery

## Limitations and Future Improvements

- Add rate limiting
- Implement queue system for blockchain operations
- Add WebSocket support for real-time updates
- Enhance monitoring and alerting
- Implement proper blockchain event listening

## License

MIT
