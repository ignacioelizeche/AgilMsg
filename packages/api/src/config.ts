export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',

  // Base path when behind reverse proxy at /agilmsg/
  basePath: process.env.BASE_PATH || '/agilmsg',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: '7d',
  },

  meta: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    verifyToken: process.env.META_VERIFY_TOKEN || '',
    systemUserId: process.env.META_SYSTEM_USER_ID || '',
    systemUserToken: process.env.META_SYSTEM_USER_TOKEN || '',
    embeddedSignupConfigId: process.env.EMBEDDED_SIGNUP_CONFIG_ID || '',
    graphVersion: process.env.GRAPH_API_VERSION || 'v25.0',
  },

  app: {
    url: process.env.APP_URL || 'https://agilapps.com/agilmsg',
    apiUrl: process.env.API_URL || 'https://agilapps.com/agilmsg/api',
    webhookUrl: process.env.WEBHOOK_URL || 'https://agilapps.com/agilmsg/webhook/whatsapp',
  },
};
