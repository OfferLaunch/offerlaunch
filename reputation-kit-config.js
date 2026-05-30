/**
 * Reputation Kit funnel: paste your IDs here after setup.
 *
 * GHL: Automation → Workflow → Trigger "Inbound Webhook" → copy URL into Vercel env
 *      GHL_REPUTATION_KIT_WEBHOOK_URL (do not put the webhook URL in this file).
 *
 * Whop: plan ID from your product checkout embed settings.
 * Typeform: live embed ID for the post-purchase booking form (same one GHL already ingests).
 */
window.REPUTATION_KIT_CONFIG = {
  leadApi: '/api/reputation-kit-lead',
  whopPlanId: 'plan_0w9AIb6oT7nFR',
  typeformLiveId: '01KSV0JD52GQYSR6972X91M6D8',
  bookPath: '/reputation-kit-book',
  checkoutPath: '/reputation-kit-checkout',
  funnelPath: '/reputation-kit#funnel-checkout',
  productName: "The Reputation Operator's Kit",
  kitValueDisplay: '$1,499',
  priceDisplay: '$197',
  compareAtDisplay: '$497',
  saveDisplay: '$300',
};
