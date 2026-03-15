import { config } from './config.js';

interface RequestOptions {
  params?: Record<string, string | number | undefined>;
  timeout?: number;
}

function buildUrl(base: string, path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function goApiFetch(path: string, options: RequestOptions = {}): Promise<Response> {
  const url = buildUrl(config.apiUrl, path, options.params);
  const headers: Record<string, string> = {};
  if (config.apiKey) {
    headers['x-api-key'] = config.apiKey;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function goApiJson<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await goApiFetch(path, options);
  let text = await response.text();
  // Some Go endpoints prepend debug comments like "# running on hostname..."
  // Strip lines starting with # before parsing JSON
  const lines = text.split('\n');
  const jsonStart = lines.findIndex(l => l.trimStart().startsWith('[') || l.trimStart().startsWith('{'));
  if (jsonStart > 0) {
    text = lines.slice(jsonStart).join('\n');
  }
  return JSON.parse(text) as T;
}

export async function goApiText(path: string, options: RequestOptions = {}): Promise<string> {
  const response = await goApiFetch(path, options);
  return response.text();
}

export async function collectSSEEvents(
  path: string,
  params: Record<string, string | number | undefined>,
  durationMs: number,
): Promise<string[]> {
  const url = buildUrl(config.apiUrl, path, params);
  const headers: Record<string, string> = {};
  if (config.apiKey) {
    headers['x-api-key'] = config.apiKey;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), durationMs + 5000);

  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Stream error ${response.status}`);
    }
    const events: string[] = [];
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    const startTime = Date.now();

    while (Date.now() - startTime < durationMs) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('data: '));
      // Also handle SSE format where lines start with "data: "
      const dataLines = text.split('\n')
        .map(l => l.startsWith('data: ') ? l.slice(6) : l)
        .filter(l => l.trim());
      events.push(...dataLines);
    }
    reader.cancel();
    return events;
  } finally {
    clearTimeout(timeout);
  }
}

export async function portalApiFetch(path: string): Promise<unknown> {
  if (!config.portalUrl || !config.portalJwt) {
    throw new Error('Portal URL and JWT are required for user management operations. Set QUANTXDATA_PORTAL_URL and QUANTXDATA_PORTAL_JWT.');
  }
  const url = `${config.portalUrl}${path}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.portalJwt}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Portal API error ${response.status}: ${text}`);
  }
  return response.json();
}
