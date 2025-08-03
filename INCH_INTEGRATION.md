# 1inch Portfolio Integration

This project integrates with the 1inch Portfolio API to fetch real cryptocurrency holdings across multiple chains.

## Features

- ✅ Real-time portfolio data from 1inch API
- ✅ Multi-chain support (Ethereum, Polygon, Arbitrum, Base, Optimism)
- ✅ Interactive chain selector with real values and percentages
- ✅ Automatic fallback to mock data when API is unavailable
- ✅ Token balance details with USD values
- ✅ Portfolio metrics and analytics
- ✅ Responsive UI with loading states
- ✅ Chain-specific portfolio breakdown
- ✅ Clickable chain selection with detailed view

## Setup Instructions

### 1. Get 1inch API Key

1. Visit [1inch Developer Portal](https://portal.1inch.dev/)
2. Sign up and create a new project
3. Copy your API key

### 2. Environment Configuration

1. Navigate to the `src` directory and copy `.env.local` and update the values:
   ```bash
   cd src
   ```
   
2. Update `.env.local` with your actual API key:
   ```bash
   ONEINCH_API_KEY=your_actual_api_key_here
   ```

### 3. Install Dependencies

```bash
cd src
npm install
# or
yarn install
```

### 4. Run Development Server

```bash
cd src
npm run dev
# or
yarn dev
```

### 5. Connect Your Wallet (Optional)

1. Open [http://localhost:3000](http://localhost:3000)
2. The app will automatically load real data using a test address (`0x000000000000000000000000000000000000dead`)
3. Optionally connect your wallet to see your personal portfolio data
4. Switch between different chains to see chain-specific holdings

## Testing with Burn Address

Since 1inch APIs primarily support mainnet and you might not have mainnet balances, the app uses a clever testing approach:

- **Test Address**: `0x000000000000000000000000000000000000dead`
- **Why this works**: This is the universal burn address where projects send tokens to be permanently removed from circulation
- **Real data**: Shows actual token holdings from burn operations across EVM chains
- **Perfect for testing**: Always has real token balances to demonstrate the API integration

The app will automatically use this test address when:
- No wallet is connected
- Connected wallet has no mainnet balances
- You want to see the integration with real data

## API Endpoints

### GET /api/portfolio
Fetches portfolio summary across all supported chains.

**Parameters:**
- `address` (required): Ethereum wallet address
- `chainIds` (optional): Comma-separated chain IDs

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 1234.56,
    "totalValueFormatted": "$1,234.56",
    "chains": [...],
    "categories": [...]
  }
}
```

### GET /api/portfolio/tokens
Fetches detailed token holdings for a specific chain.

**Parameters:**
- `address` (required): Ethereum wallet address
- `chainId` (optional): Chain ID (defaults to 1 for Ethereum)

## Supported Chains

- **Ethereum** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **Arbitrum** (Chain ID: 42161)
- **Base** (Chain ID: 8453)
- **Optimism** (Chain ID: 10)

## Error Handling

The application includes comprehensive error handling:

- API failures automatically fall back to mock data
- Invalid addresses are validated
- Network errors are displayed to users
- Refresh functionality allows manual retries

## Development Notes

### Mock Data Fallback

When real data is unavailable, the app uses mock data to ensure a good user experience. The UI clearly indicates when mock data is being used.

### Rate Limiting

Be aware of 1inch API rate limits. The application includes caching mechanisms to minimize API calls.

### TypeScript Support

All API responses and data structures are fully typed for better development experience.

## Troubleshooting

### "Using mock data" message
- Check if your wallet is connected
- Verify your 1inch API key is correct
- Check browser console for API errors

### Empty token list
- Ensure the wallet has tokens on the selected chain
- Try switching to a different chain
- Check if the wallet address has any holdings

### API errors
- Verify your API key is valid and has sufficient quota
- Check network connectivity
- Review the API response in browser dev tools
