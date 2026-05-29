/**
 * Reputation Kit funnel — paste your IDs here after setup.
 *
 * GHL: Automation → Workflow → Trigger "Inbound Webhook" → copy URL into Vercel env
 *      GHL_REPUTATION_KIT_WEBHOOK_URL (do not put the webhook URL in this file).
 *
 * Whop: plan ID from your product checkout embed settings.
 * Typeform: live embed ID for the post-purchase booking form (same one GHL already ingests).
 */
window.REPUTATION_KIT_CONFIG = {
  leadApi: '/api/reputation-kit-lead',
  whopPlanId: 'plan_REPLACE_WITH_YOUR_WHOP_PLAN_ID',
  typeformLiveId: 'REPLACE_WITH_YOUR_TYPEFORM_LIVE_ID',
  bookPath: '/reputation-kit-book',
  checkoutPath: '/reputation-kit-checkout',
  funnelPath: '/reputation-kit#funnel-checkout',
  productName: "The Reputation Operator's Kit",
  priceDisplay: '$197',
};
