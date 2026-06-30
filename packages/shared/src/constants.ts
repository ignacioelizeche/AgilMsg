export const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v25.0';
export const META_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

export const MESSAGE_CATEGORIES = ['marketing', 'utility', 'authentication', 'service'] as const;
export type MessageCategory = typeof MESSAGE_CATEGORIES[number];

export const TEMPLATE_STATUSES = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'] as const;

export const QUALITY_RATINGS = ['Green', 'Yellow', 'Red', 'Unknown'] as const;

// Meta per-message pricing categories (USD, approximate)
// These are illustrative — real rates vary by country
export const BASE_RATES: Record<MessageCategory, number> = {
  marketing: 0.0795,
  utility: 0.0200,
  authentication: 0.0300,
  service: 0.0,
};
