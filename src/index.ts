#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { goApiJson, goApiText, collectSSEEvents, portalApiFetch } from './http-client.js';

const server = new McpServer({
  name: 'quantxdata',
  version: '1.0.0',
});

// ─── Market Data Tools (Go API) ────────────────────────────

server.tool(
  'list_exchanges',
  'List all whitelisted exchanges available on QuantXData',
  {},
  async () => {
    const data = await goApiJson<{ exchanges: string[] }>('/whitelisted-exchanges.json');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'list_instruments',
  'List all trading instruments. Returns exchange, symbol, type, base, quote, and data availability. ~88K instruments total.',
  { exchange: z.string().optional().describe('Filter by exchange name (e.g., "coinbase", "binance2")') },
  async ({ exchange }) => {
    const text = await goApiText('/instruments');
    let lines = text.trim().split('\n').filter(Boolean);
    if (exchange) {
      lines = lines.filter(l => l.startsWith(exchange + ' '));
    }
    // Limit output to prevent overwhelming context
    const total = lines.length;
    const sample = lines.slice(0, 200);
    const header = 'exchange instrument type base quote decimals has_trades has_orderbook has_futures has_options';
    const result = [header, ...sample].join('\n');
    return {
      content: [{
        type: 'text',
        text: `Total: ${total} instruments${exchange ? ` for ${exchange}` : ''}\n\n${result}${total > 200 ? `\n\n... and ${total - 200} more` : ''}`,
      }],
    };
  },
);

server.tool(
  'get_trades',
  'Get historical individual trade executions for a specific exchange and instrument. Requires API key.',
  {
    ex: z.string().describe('Exchange name (e.g., "coinbase")'),
    ins: z.string().describe('Instrument name (e.g., "BTC-USD")'),
    from: z.string().describe('Start time ISO 8601 (e.g., "2024-01-10T00:00:00")'),
    to: z.string().describe('End time ISO 8601 (e.g., "2024-01-10T06:00:00")'),
    limit: z.number().optional().default(100).describe('Max records (1-10000)'),
  },
  async ({ ex, ins, from, to, limit }) => {
    const data = await goApiJson('/trades.json', { params: { ex, ins, from, to, limit } });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'get_aggregated_trades',
  'Get OHLCV candlestick data for a specific exchange and instrument. Requires API key.',
  {
    ex: z.string().describe('Exchange name'),
    ins: z.string().describe('Instrument name'),
    from: z.string().describe('Start time ISO 8601'),
    to: z.string().describe('End time ISO 8601'),
    aggregation: z.enum(['1m', '15m', '1h', '1d']).describe('Candle interval'),
    limit: z.number().optional().default(200).describe('Max candles'),
  },
  async ({ ex, ins, from, to, aggregation, limit }) => {
    const data = await goApiJson('/trades_aggregated.json', {
      params: { ex, ins, from, to, agg: aggregation, limit },
    });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'get_multi_trades',
  'Get trades across multiple exchanges filtered by currency pairs. Requires API key.',
  {
    exchanges: z.string().describe('Comma-separated exchanges (e.g., "coinbase,binance2")'),
    baseCurrencies: z.string().describe('Comma-separated base currencies (e.g., "BTC")'),
    quoteCurrencies: z.string().describe('Comma-separated quote currencies (e.g., "USD,USDT")'),
    from: z.string().describe('Start time ISO 8601'),
    to: z.string().describe('End time ISO 8601'),
    limit: z.number().optional().default(100),
  },
  async ({ exchanges, baseCurrencies, quoteCurrencies, from, to, limit }) => {
    const data = await goApiJson('/multi/trades.json', {
      params: { exchanges, base_currencies: baseCurrencies, quote_currencies: quoteCurrencies, from, to, limit },
    });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'get_orderbook',
  'Get historical order book data (deltas/snapshots) for a specific exchange and instrument. Requires API key.',
  {
    ex: z.string().describe('Exchange name'),
    ins: z.string().describe('Instrument name'),
    from: z.string().describe('Start time ISO 8601'),
    limit: z.number().optional().default(100),
  },
  async ({ ex, ins, from, limit }) => {
    const data = await goApiJson('/orderbooks.json', { params: { ex, ins, from, limit } });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'get_option_quotes',
  'Get options quotes with Greeks, IV, and prices. Requires API key. Only deribit/o exchange currently.',
  {
    ex: z.string().default('deribit/o').describe('Options exchange'),
    ins: z.string().describe('Options instrument (e.g., "BTC-28MAR25-100000-C")'),
    from: z.string().describe('Start time ISO 8601'),
    to: z.string().describe('End time ISO 8601'),
  },
  async ({ ex, ins, from, to }) => {
    const data = await goApiJson('/option_quotes.json', { params: { ex, ins, from, to } });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'list_options_exchanges',
  'List exchanges that support options data',
  {},
  async () => {
    const data = await goApiJson('/options-exchanges.json');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'list_options_instruments',
  'List all available options instruments',
  {},
  async () => {
    const data = await goApiJson('/options-instruments.json');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'get_latest_tick',
  'Get the latest tick for a specific exchange and instrument. Requires API key.',
  {
    ex: z.string().describe('Exchange name'),
    ins: z.string().describe('Instrument name'),
  },
  async ({ ex, ins }) => {
    const data = await goApiText('/latest_tick', { params: { ex, ins } });
    return { content: [{ type: 'text', text: data }] };
  },
);

server.tool(
  'get_data_quality',
  'Get data quality status showing exchanges with issues (gaps, volume drops, stale data)',
  {},
  async () => {
    const data = await goApiJson('/data-quality-status.json');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'stream_live_data',
  'Get recent trades for an instrument. Returns the most recent trades available (up to limit).',
  {
    ex: z.string().describe('Exchange name (e.g., "binance2", "coinbase")'),
    ins: z.string().describe('Instrument name (e.g., "BTCUSDT", "BTC-USD")'),
    limit: z.number().default(50).describe('Number of trades to return (1-200)'),
  },
  async ({ ex, ins, limit }) => {
    // Fetch recent trades from the last 6 hours of available data
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);
    end.setUTCHours(23, 59, 59, 0);
    const start = new Date(end.getTime() - 6 * 3600000);
    const lim = Math.min(200, Math.max(1, limit));

    const data = await goApiJson<unknown[]>('/trades.json', {
      params: { ex, ins, from: start.toISOString().slice(0, 19), to: end.toISOString().slice(0, 19), limit: lim },
    });
    return {
      content: [{
        type: 'text',
        text: `${data.length} recent trades for ${ins} on ${ex}:\n\n${JSON.stringify(data, null, 2)}`,
      }],
    };
  },
);

// ─── User Management Tools (Customer Portal) ───────────────

server.tool(
  'get_user_profile',
  'Get the authenticated user\'s profile from QuantXData customer portal',
  {},
  async () => {
    const data = await portalApiFetch('/profile');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'get_balance',
  'Get the user\'s current balance',
  {},
  async () => {
    const data = await portalApiFetch('/current_balance');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'get_transactions',
  'Get the user\'s transaction history',
  {},
  async () => {
    const data = await portalApiFetch('/transactions');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'get_usage_summary',
  'Get the user\'s monthly data usage cost summary',
  {},
  async () => {
    const data = await portalApiFetch('/usage-summary');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'list_api_keys',
  'List the user\'s API keys',
  {},
  async () => {
    const data = await portalApiFetch('/api-keys');
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'create_api_key',
  'Create a new API key for the user',
  {},
  async () => {
    if (!process.env.QUANTXDATA_PORTAL_URL || !process.env.QUANTXDATA_PORTAL_JWT) {
      return {
        content: [{ type: 'text', text: 'Error: Portal URL and JWT required. Set QUANTXDATA_PORTAL_URL and QUANTXDATA_PORTAL_JWT.' }],
        isError: true,
      };
    }
    const url = `${process.env.QUANTXDATA_PORTAL_URL}/api-keys/create`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QUANTXDATA_PORTAL_JWT}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ─── Start Server ───────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('MCP server error:', error);
  process.exit(1);
});
