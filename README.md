# QuantXData MCP Server

Access real-time crypto market data from **123+ exchanges** and **47,000+ instruments** via the Model Context Protocol (MCP).

Works with Claude Desktop, Claude Code, Cursor, and any MCP-compatible AI agent.

## Quick Start

```bash
npx quantxdata-mcp
```

## Setup with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "quantxdata": {
      "command": "npx",
      "args": ["-y", "quantxdata-mcp"],
      "env": {
        "QUANTXDATA_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Setup with Claude Code

```bash
claude mcp add quantxdata -- npx -y quantxdata-mcp
```

## Available Tools (18)

### Market Data
| Tool | Description |
|------|-------------|
| `list_exchanges` | List 123+ crypto exchanges |
| `list_instruments` | Browse 47,000+ trading pairs |
| `get_trades` | Historical trade executions |
| `get_aggregated_trades` | OHLCV candlestick data |
| `get_multi_trades` | Cross-exchange trade comparison |
| `get_orderbook` | L2 orderbook snapshots (5,000+ levels) |
| `get_option_quotes` | Options Greeks, IV, prices |
| `list_options_exchanges` | Options-enabled exchanges |
| `list_options_instruments` | 3,500+ options contracts |
| `get_latest_tick` | Real-time latest price |
| `get_data_quality` | Exchange health monitoring |
| `stream_live_data` | Recent trade stream |

### User Management
| Tool | Description |
|------|-------------|
| `get_user_profile` | User account info |
| `get_balance` | Account balance |
| `get_transactions` | Transaction history |
| `get_usage_summary` | API usage stats |
| `list_api_keys` | Manage API keys |
| `create_api_key` | Generate new API key |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `QUANTXDATA_API_KEY` | Yes | Your API key for authenticated endpoints |
| `QUANTXDATA_API_URL` | No | API URL (default: `https://api.algohouse.ai`) |
| `QUANTXDATA_PORTAL_URL` | No | Portal URL for user management |
| `QUANTXDATA_PORTAL_JWT` | No | JWT for user management tools |

## Example Usage with Claude

> "What's the current BTC price across exchanges?"

Claude will call `get_latest_tick` and `list_exchanges` to give you real-time data.

> "Show me the last hour of ETH trades on Binance"

Claude will call `get_aggregated_trades` with the right parameters.

## Get an API Key

Visit [quantxdata.ai](https://quantxdata.ai) to get your API key.

## License

MIT
