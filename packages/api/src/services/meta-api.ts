import { config } from '../config';

const BASE = `https://graph.facebook.com/${config.meta.graphVersion}`;

interface RequestOptions {
  method?: string;
  body?: any;
  accessToken: string;
}

async function metaFetch<T = any>(path: string, options: RequestOptions): Promise<T> {
  const url = `${BASE}${path}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${options.accessToken}`,
  };

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json();

  if (!res.ok) {
    const errMsg = data?.error?.message || res.statusText;
    throw new Error(`Meta API Error (${res.status}): ${errMsg}`);
  }

  return data as T;
}

// ─── Token Exchange ────────────────────────────────────────

export async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    client_id: config.meta.appId,
    client_secret: config.meta.appSecret,
    code,
  });

  const data = await metaFetch<any>(`/oauth/access_token?${params}`, {
    accessToken: config.meta.systemUserToken,
  });

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

export async function debugToken(accessToken: string) {
  const params = new URLSearchParams({
    input_token: accessToken,
    access_token: `${config.meta.appId}|${config.meta.appSecret}`,
  });

  return metaFetch<any>(`/debug_token?${params}`);
}

// ─── WABA Management ───────────────────────────────────────

export async function assignSystemUserToWaba(wabaId: string, accessToken: string) {
  return metaFetch<any>(`/${wabaId}/assigned_users`, {
    method: 'POST',
    body: {
      user: config.meta.systemUserId,
      tasks: ['MANAGE', 'DEVELOP'],
    },
    accessToken,
  });
}

export async function subscribeAppToWaba(wabaId: string, accessToken: string) {
  return metaFetch<any>(`/${wabaId}/subscribed_apps`, {
    method: 'POST',
    body: {},
    accessToken,
  });
}

export async function getWabaPhoneNumbers(wabaId: string, accessToken: string) {
  return metaFetch<any>(`/${wabaId}/phone_numbers`, {
    accessToken,
  });
}

// ─── Send Messages ─────────────────────────────────────────

export async function sendTextMessage(phoneNumberId: string, to: string, text: string, accessToken: string) {
  return metaFetch<any>(`/${phoneNumberId}/messages`, {
    method: 'POST',
    body: {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    },
    accessToken,
  });
}

export async function sendTemplateMessage(
  phoneNumberId: string,
  to: string,
  templateName: string,
  languageCode: string,
  components: any[],
  accessToken: string,
) {
  return metaFetch<any>(`/${phoneNumberId}/messages`, {
    method: 'POST',
    body: {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    },
    accessToken,
  });
}

// ─── Templates ─────────────────────────────────────────────

export async function getTemplates(wabaId: string, accessToken: string) {
  return metaFetch<any>(`/${wabaId}/message_templates`, {
    accessToken,
  });
}

export async function createTemplate(
  wabaId: string,
  template: {
    name: string;
    category: string;
    language: string;
    components: any[];
  },
  accessToken: string,
) {
  return metaFetch<any>(`/${wabaId}/message_templates`, {
    method: 'POST',
    body: template,
    accessToken,
  });
}

// ─── Phone Number Management ───────────────────────────────

export async function getPhoneNumberDetails(phoneNumberId: string, accessToken: string) {
  return metaFetch<any>(`/${phoneNumberId}?fields=display_phone_number,quality_rating,verified_name,status`, {
    accessToken,
  });
}

// ─── Webhook Subscription ──────────────────────────────────

export async function subscribeToWebhooks(wabaId: string, callbackUrl: string, verifyToken: string, accessToken: string) {
  return metaFetch<any>(`/${wabaId}/subscribed_apps`, {
    method: 'POST',
    body: {
      callback_url: callbackUrl,
      verify_token: verifyToken,
    },
    accessToken,
  });
}
