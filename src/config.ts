export const config = {
  apiKey: process.env.QUANTXDATA_API_KEY || '',
  apiUrl: process.env.QUANTXDATA_API_URL || 'https://api.algohouse.ai',
  portalUrl: process.env.QUANTXDATA_PORTAL_URL || '',
  portalJwt: process.env.QUANTXDATA_PORTAL_JWT || '',
};
