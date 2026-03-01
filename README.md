# QuantXData MCP Server

Model Context Protocol (MCP) server for QuantXData API - the first institutional crypto data provider with AI-native access.

## What is This?

This MCP server exposes all QuantXData market data APIs to AI assistants like Claude Desktop, allowing you to query institutional-grade crypto data using natural language - no coding required.

**Example queries:**
- "Get 24h volume for BTC/USDT on Binance"
- "Show me order book depth for ETH across top 5 exchanges"
- "Compare funding rates for BTC perpetuals on Binance and Deribit"
- "Fetch daily OHLCV for SOL/USDT since January 2024"

## Features

- **12 API Tools**: Complete access to QuantXData's market data endpoints
- **AI-Native**: Query crypto data using natural language via Claude, ChatGPT, or any MCP-compatible tool
- **Institutional Grade**: Full tick history, sub-millisecond timestamps, 120+ exchanges
- **Zero Code**: No API integration required - just ask your AI assistant

## Supported Data

- **Trades**: Historical trade executions with microsecond precision
- **Order Books**: L1 top-of-book and L2 snapshots
- **OHLCV**: Aggregated candlestick data (1m, 15m, 1h, 1d)
- **Options**: Greeks (delta, gamma, vega, theta) and implied volatility
- **Multi-Exchange**: Consolidated data across 120+ venues
- **Real-Time**: WebSocket-style streams (polling-based)

## Installation

### Prerequisites

- Node.js 18+ 
- QuantXData API credentials (email + signing key)

### Quick Start with Claude Desktop

1. **Install the server:**
```bash
npx -y @quantxdata/mcp-server
```

2. **Configure Claude Desktop:**

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "quantxdata": {
      "command": "npx",
      "args": ["-y", "@quantxdata/mcp-server"],
      "env": {
        "QUANTXDATA_EMAIL": "your-email@example.com",
        "QUANTXDATA_SIGNING_KEY": "your-signing-key-here"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Test it:**

Ask Claude: _"Use QuantXData to get the last 10 BTC/USDT trades from Binance"_

## API Credentials

Get your API credentials at [quantxdata.ai](https://quantxdata.ai):

1. Sign up for a free account
2. Generate your API signing key
3. Add your email and key to the MCP config

## Available Tools

### 1. `get_instruments`
List all supported exchanges and trading pairs (no auth required)

### 2. `get_trades`
Get historical trade executions
- Parameters: `exchange`, `instrument`, `from`, `to`, `limit`
- Example: "Get BTC/USDT trades from Binance for the last hour"

### 3. `get_orderbooks`
Get L1/L2 order book snapshots
- Parameters: `exchange`, `instrument`, `from`, `limit`
- Example: "Show order book depth for ETH/USD on Coinbase"

### 4. `get_ohlcv`
Get aggregated OHLCV candlestick data
- Parameters: `exchange`, `instrument`, `aggregation` (1m/15m/1h/1d), `from`, `to`, `limit`
- Example: "Get hourly candles for SOL/USDT on Binance"

### 5. `get_multi_trades`
Get consolidated trades across multiple exchanges
- Parameters: `exchanges`, `base_currencies`, `quote_currencies`, `from`, `to`, `limit`
- Example: "Compare BTC volume across Binance, Coinbase, and Kraken"

### 6. `get_option_quotes`
Get options Greeks and implied volatility
- Parameters: `exchange`, `instrument`, `from`, `to`
- Example: "Get BTC options data from Deribit"

### 7-9. `get_histoday` / `get_histohour` / `get_histominute`
Get historical OHLCV data (CryptoCompare-compatible format)
- Parameters: `fsym`, `tsym`, `e` (exchange), `aggregate`, `toTs`, `limit`

### 10. `get_ob_l1_top`
Get L1 order book top-of-book (best bid/ask)

### 11. `get_ob_l2_snapshot`
Get L2 order book snapshot with configurable depth

### 12. `stream_realtime`
Get real-time market data (polling-based)
- Parameters: `exchange`, `instrument`, `stream_time` (1-120 seconds)

## VS Code / Cursor / Cline

Add to your MCP settings:

```json
{
  "mcpServers": {
    "quantxdata": {
      "command": "npx",
      "args": ["-y", "@quantxdata/mcp-server"],
      "env": {
        "QUANTXDATA_EMAIL": "your-email@example.com",
        "QUANTXDATA_SIGNING_KEY": "your-signing-key-here"
      }
    }
  }
}
```

## Authentication

The MCP server uses HMAC-SHA256 signing (same as QuantXData REST API):
- Requests are signed with your email + signing key
- Signatures are automatically generated for each API call
- No manual token management required

## Pricing

- **Free Tier**: 1,000 API calls/month
- **Starter**: $99/month, 100,000 calls
- **Pro**: $499/month, 1M calls
- **Enterprise**: Custom pricing, unlimited

See [quantxdata.ai/pricing](https://quantxdata.ai/pricing)

## Response Format

All tools return data in the same format as the QuantXData REST API:
- Trades: space-delimited format for efficiency
- OHLCV: JSON with open/high/low/close/volume
- Order books: bids/asks arrays with price/quantity
- Options: Greeks + IV in structured JSON

## Examples

### Cross-Exchange Volume Comparison
_"Compare 24h BTC/USDT volume across Binance, Coinbase, and Kraken"_

### Funding Rate Analysis
_"Get BTC perpetual funding rates from Binance and Deribit for the last 7 days"_

### Order Book Depth
_"Show me L2 order book for ETH/USDT on Binance with 20 levels"_

### Options Analysis
_"Get delta and IV for BTC options expiring this week on Deribit"_

## Troubleshooting

### "Authentication failed"
- Verify your email and signing key in the config
- Check that your QuantXData account is active

### "Rate limit exceeded"
- Check your plan limits at quantxdata.ai/pricing
- Upgrade your plan if needed

### "Tool not found"
- Restart your MCP client (Claude Desktop, VS Code, etc.)
- Verify the server is running: check logs in the MCP client

## Development

```bash
# Clone the repo
git clone https://github.com/appydam/quantxdata-mcp
cd quantxdata-mcp

# Install dependencies
npm install

# Build
npm run build

# Test locally
npm link
```

## Support

- **Documentation**: [quantxdata.ai/docs](https://quantxdata.ai/docs)
- **Email**: sales@quantxdata.ai
- **GitHub**: [github.com/appydam/quantxdata-mcp](https://github.com/appydam/quantxdata-mcp)

## License

MIT

---

**Built for:** Quant traders, algo developers, AI researchers  
**Maintained by:** QuantXData  
**Learn more:** [quantxdata.ai](https://quantxdata.ai)
