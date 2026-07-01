import prisma from '../../../database/src/client';
import { config } from '../config';
import {
  exchangeCodeForToken,
  debugToken,
  subscribeAppToWaba,
  getWabaPhoneNumbers,
  getPhoneNumberDetails,
  subscribeToWebhooks,
} from './meta-api';

export async function handleEmbeddedSignup(
  code: string,
  organizationId: string,
) {
  // 1. Exchange code for business token
  const tokenResult = await exchangeCodeForToken(code);
  const businessToken = tokenResult.accessToken;

  // 2. Debug token to get WABA IDs
  const debugResult = await debugToken(businessToken);
  const targetIds = debugResult.data?.target_ids || [];

  // Find the WABA ID (starts with the pattern for WABAs)
  const wabaId = targetIds.find((id: string) => id.length > 10) || targetIds[0];

  if (!wabaId) {
    throw new Error('No WABA ID found in token response');
  }

  // 3. Subscribe our app to the WABA
  try {
    await subscribeAppToWaba(wabaId, businessToken);
  } catch (err: any) {
    // May already be subscribed, log but continue
    console.log('subscribeAppToWaba:', err.message);
  }

  // 4. Subscribe webhooks
  try {
    await subscribeToWebhooks(
      wabaId,
      config.app.webhookUrl,
      config.meta.verifyToken,
      businessToken,
    );
  } catch (err: any) {
    console.log('subscribeToWebhooks:', err.message);
  }

  // 5. Get phone numbers for this WABA
  const phoneData = await getWabaPhoneNumbers(wabaId, businessToken);

  // 6. Store or update WABA
  const waba = await prisma.whatsAppBusinessAccount.upsert({
    where: { wabaId },
    create: {
      wabaId,
      businessToken,
      organizationId,
      status: 'active',
    },
    update: {
      businessToken,
      status: 'active',
    },
  });

  // 7. Store phone numbers
  const phoneNumbers = phoneData.data || [];
  for (const phone of phoneNumbers) {
    const details = await getPhoneNumberDetails(phone.id, businessToken).catch(() => null);

    await prisma.phoneNumber.upsert({
      where: { phoneNumberId: phone.id },
      create: {
        phoneNumberId: phone.id,
        wabaId: waba.id,
        displayNumber: details?.display_phone_number || phone.display_phone_number || '',
        displayName: details?.verified_name || phone.verified_name || '',
        qualityRating: details?.quality_rating || 'Unknown',
        status: details?.status || 'CONNECTED',
      },
      update: {
        displayNumber: details?.display_phone_number || phone.display_phone_number || '',
        displayName: details?.verified_name || phone.verified_name || '',
        qualityRating: details?.quality_rating || 'Unknown',
        status: details?.status || 'CONNECTED',
      },
    });
  }

  return {
    wabaId: waba.wabaId,
    phoneCount: phoneNumbers.length,
  };
}
