import crypto from 'crypto';

export interface AuthConfig {
  email: string;
  signingKey: string;
}

export function signRequest(
  method: string,
  path: string,
  timestamp: string,
  email: string,
  signingKey: string
): string {
  const message = `${timestamp}${method}${path}`;
  const hmac = crypto.createHmac('sha256', signingKey);
  hmac.update(message);
  return hmac.digest('hex');
}

export function getAuthHeaders(
  method: string,
  path: string,
  config: AuthConfig
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signRequest(method, path, timestamp, config.email, config.signingKey);
  
  return {
    'signerEmail': config.email,
    'requestTimestamp': timestamp,
    'signature': signature
  };
}
