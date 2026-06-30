export interface JwtPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
}

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MetaDebugTokenResponse {
  data: {
    app_id: string;
    type: string;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
    target_ids?: string[];
  };
}

export interface EmbeddedSignupResult {
  code: string;
  wabaId: string;
  phoneNumberId: string;
}

export interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  text?: { body: string };
  image?: { id: string; caption?: string };
  document?: { id: string; caption?: string; filename?: string };
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
}

export interface WebhookEntry {
  id: string;
  changes: {
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: any[];
      messages?: any[];
      statuses?: any[];
    };
    field: string;
  }[];
}

export interface WebhookBody {
  object: string;
  entry: WebhookEntry[];
}
