#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { QuantXDataClient } from './client.js';

// Get credentials from environment variables
const email = process.env.QUANTXDATA_EMAIL;
const signingKey = process.env.QUANTXDATA_SIGNING_KEY;

if (!email || !signingKey) {
  console.error('Error: QUANTXDATA_EMAIL and QUANTXDATA_SIGNING_KEY environment variables are required');
  process.exit(1);
}

const client = new QuantXDataClient(email, signingKey);

// Create MCP server
const server = new Server(
  {
    name: 'quantxdata-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all 12 tools
const tools = [
  {
    name: 'get_instruments',
    description: 'List all supported exchanges and trading pairs. No authentication required.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_trades',
    description: 'Get historical trade executions from an exchange',
    inputSchema: {
      type: 'object',
      properties: {
        exchange: {
          type: 'string',
          description: 'Exchange name (e.g., binance, coinbase, kraken)',
        },
        instrument: {
          type: 'string',
          description: 'Trading pair (e.g., BTC/USDT, ETH/USD)',
        },
        from: {
          type: 'string',
          description: 'Start timestamp (ISO 8601 format, optional)',
        },
        to: {
          type: 'string',
          description: 'End timestamp (ISO 8601 format, optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 100)',
        },
      },
      required: ['exchange', 'instrument'],
    },
  },
  {
    name: 'get_orderbooks',
    description: 'Get historical order book snapshots (L1 top-of-book or L2 depth)',
    inputSchema: {
      type: 'object',
      properties: {
        exchange: {
          type: 'string',
          description: 'Exchange name',
        },
        instrument: {
          type: 'string',
          description: 'Trading pair',
        },
        from: {
          type: 'string',
          description: 'Start timestamp (ISO 8601)',
        },
        limit: {
          type: 'number',
          description: 'Max results (default: 100)',
        },
      },
      required: ['exchange', 'instrument'],
    },
  },
  {
    name: 'get_ohlcv',
    description: 'Get aggregated OHLCV candlestick data (1m, 15m, 1h, 1d intervals)',
    inputSchema: {
      type: 'object',
      properties: {
        exchange: {
          type: 'string',
          description: 'Exchange name',
        },
        instrument: {
          type: 'string',
          description: 'Trading pair',
        },
        from: {
          type: 'string',
          description: 'Start timestamp',
        },
        to: {
          type: 'string',
          description: 'End timestamp',
        },
        aggregation: {
          type: 'string',
          description: 'Interval: 1m, 15m, 1h, or 1d',
          enum: ['1m', '15m', '1h', '1d'],
        },
        limit: {
          type: 'number',
          description: 'Max results',
        },
      },
      required: ['exchange', 'instrument', 'aggregation'],
    },
  },
  {
    name: 'get_multi_trades',
    description: 'Get consolidated trade data across multiple exchanges',
    inputSchema: {
      type: 'object',
      properties: {
        exchanges: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of exchange names',
        },
        base_currencies: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of base currencies (e.g., ["BTC", "ETH"])',
        },
        quote_currencies: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of quote currencies (e.g., ["USDT", "USD"])',
        },
        from: {
          type: 'string',
          description: 'Start timestamp',
        },
        to: {
          type: 'string',
          description: 'End timestamp',
        },
        limit: {
          type: 'number',
          description: 'Max results',
        },
      },
      required: ['exchanges'],
    },
  },
  {
    name: 'get_option_quotes',
    description: 'Get options market data including Greeks (delta, gamma, vega, theta) and implied volatility',
    inputSchema: {
      type: 'object',
      properties: {
        exchange: {
          type: 'string',
          description: 'Exchange name (e.g., binance/o, deribit)',
        },
        instrument: {
          type: 'string',
          description: 'Option instrument (e.g., BTC-24FEB23-14000-P)',
        },
        from: {
          type: 'string',
          description: 'Start timestamp',
        },
        to: {
          type: 'string',
          description: 'End timestamp',
        },
      },
      required: ['exchange', 'instrument'],
    },
  },
  {
    name: 'get_histoday',
    description: 'Get daily OHLCV data (CryptoCompare-compatible format)',
    inputSchema: {
      type: 'object',
      properties: {
        fsym: {
          type: 'string',
          description: 'From symbol (e.g., BTC)',
        },
        tsym: {
          type: 'string',
          description: 'To symbol (e.g., USDT)',
        },
        e: {
          type: 'string',
          description: 'Exchange name',
        },
        aggregate: {
          type: 'number',
          description: 'Aggregation period (default: 1)',
        },
        toTs: {
          type: 'number',
          description: 'End timestamp (Unix)',
        },
        limit: {
          type: 'number',
          description: 'Max results (default: 30)',
        },
      },
      required: ['fsym', 'tsym', 'e'],
    },
  },
  {
    name: 'get_histohour',
    description: 'Get hourly OHLCV data (CryptoCompare-compatible format)',
    inputSchema: {
      type: 'object',
      properties: {
        fsym: {
          type: 'string',
          description: 'From symbol',
        },
        tsym: {
          type: 'string',
          description: 'To symbol',
        },
        e: {
          type: 'string',
          description: 'Exchange name',
        },
        aggregate: {
          type: 'number',
          description: 'Aggregation period',
        },
        toTs: {
          type: 'number',
          description: 'End timestamp (Unix)',
        },
        limit: {
          type: 'number',
          description: 'Max results',
        },
      },
      required: ['fsym', 'tsym', 'e'],
    },
  },
  {
    name: 'get_histominute',
    description: 'Get minute-level OHLCV data (CryptoCompare-compatible format)',
    inputSchema: {
      type: 'object',
      properties: {
        fsym: {
          type: 'string',
          description: 'From symbol',
        },
        tsym: {
          type: 'string',
          description: 'To symbol',
        },
        e: {
          type: 'string',
          description: 'Exchange name',
        },
        aggregate: {
          type: 'number',
          description: 'Aggregation period',
        },
        toTs: {
          type: 'number',
          description: 'End timestamp (Unix)',
        },
        limit: {
          type: 'number',
          description: 'Max results',
        },
      },
      required: ['fsym', 'tsym', 'e'],
    },
  },
  {
    name: 'get_ob_l1_top',
    description: 'Get L1 order book top-of-book (best bid/ask)',
    inputSchema: {
      type: 'object',
      properties: {
        fsym: {
          type: 'string',
          description: 'From symbol',
        },
        tsym: {
          type: 'string',
          description: 'To symbol',
        },
        e: {
          type: 'string',
          description: 'Exchange name',
        },
        toTs: {
          type: 'number',
          description: 'End timestamp (Unix)',
        },
        limit: {
          type: 'number',
          description: 'Max results',
        },
      },
      required: ['fsym', 'tsym', 'e'],
    },
  },
  {
    name: 'get_ob_l2_snapshot',
    description: 'Get L2 order book snapshot with configurable depth',
    inputSchema: {
      type: 'object',
      properties: {
        fsym: {
          type: 'string',
          description: 'From symbol',
        },
        tsym: {
          type: 'string',
          description: 'To symbol',
        },
        e: {
          type: 'string',
          description: 'Exchange name',
        },
        toTs: {
          type: 'number',
          description: 'End timestamp (Unix)',
        },
        limit: {
          type: 'number',
          description: 'Depth (number of price levels, default: 10)',
        },
      },
      required: ['fsym', 'tsym', 'e'],
    },
  },
  {
    name: 'stream_realtime',
    description: 'Get real-time market data stream (polling-based, returns recent data)',
    inputSchema: {
      type: 'object',
      properties: {
        exchange: {
          type: 'string',
          description: 'Exchange name',
        },
        instrument: {
          type: 'string',
          description: 'Trading pair',
        },
        stream_time: {
          type: 'number',
          description: 'Time window in seconds (1-120)',
        },
      },
      required: ['exchange', 'instrument'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Type guard for args
  if (!args) {
    return {
      content: [{ type: 'text', text: 'Error: No arguments provided' }],
      isError: true,
    };
  }

  try {
    let result;

    switch (name) {
      case 'get_instruments':
        result = await client.getPublic('/instruments');
        break;

      case 'get_trades':
        result = await client.get('/trades', {
          ex: args.exchange,
          ins: args.instrument,
          from: args.from,
          to: args.to,
          limit: args.limit || 100,
        });
        break;

      case 'get_orderbooks':
        result = await client.get('/orderbooks', {
          ex: args.exchange,
          ins: args.instrument,
          from: args.from,
          limit: args.limit || 100,
        });
        break;

      case 'get_ohlcv':
        result = await client.get('/trades_aggregated', {
          ex: args.exchange,
          ins: args.instrument,
          from: args.from,
          to: args.to,
          aggregation: args.aggregation,
          limit: args.limit || 100,
        });
        break;

      case 'get_multi_trades':
        result = await client.get('/multi/trades', {
          exchanges: Array.isArray(args.exchanges) ? args.exchanges.join(',') : args.exchanges,
          base_currencies: Array.isArray(args.base_currencies) ? args.base_currencies.join(',') : args.base_currencies,
          quote_currencies: Array.isArray(args.quote_currencies) ? args.quote_currencies.join(',') : args.quote_currencies,
          from: args.from,
          to: args.to,
          limit: args.limit || 100,
        });
        break;

      case 'get_option_quotes':
        result = await client.get('/option_quotes', {
          ex: args.exchange,
          ins: args.instrument,
          from: args.from,
          to: args.to,
        });
        break;

      case 'get_histoday':
        result = await client.get('/data/v2/histoday', {
          fsym: args.fsym,
          tsym: args.tsym,
          e: args.e,
          aggregate: args.aggregate || 1,
          toTs: args.toTs,
          limit: args.limit || 30,
        });
        break;

      case 'get_histohour':
        result = await client.get('/data/v2/histohour', {
          fsym: args.fsym,
          tsym: args.tsym,
          e: args.e,
          aggregate: args.aggregate || 1,
          toTs: args.toTs,
          limit: args.limit || 24,
        });
        break;

      case 'get_histominute':
        result = await client.get('/data/v2/histominute', {
          fsym: args.fsym,
          tsym: args.tsym,
          e: args.e,
          aggregate: args.aggregate || 1,
          toTs: args.toTs,
          limit: args.limit || 60,
        });
        break;

      case 'get_ob_l1_top':
        result = await client.get('/data/ob/l1/top', {
          fsym: args.fsym,
          tsym: args.tsym,
          e: args.e,
          toTs: args.toTs,
          limit: args.limit || 100,
        });
        break;

      case 'get_ob_l2_snapshot':
        result = await client.get('/data/v2/ob/l2/snapshot', {
          fsym: args.fsym,
          tsym: args.tsym,
          e: args.e,
          toTs: args.toTs,
          limit: args.limit || 10,
        });
        break;

      case 'stream_realtime':
        // For streaming, use the /trades endpoint with recent data
        const streamTime = typeof args.stream_time === 'number' ? args.stream_time : 60;
        const toTime = new Date().toISOString();
        const fromTime = new Date(Date.now() - streamTime * 1000).toISOString();
        
        result = await client.get('/trades', {
          ex: args.exchange,
          ins: args.instrument,
          from: fromTime,
          to: toTime,
          limit: 1000,
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('QuantXData MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
