/**
 * Reputation Kit funnel: paste your IDs here after setup.
 *
 * GHL: Automation → Workflow → Trigger "Inbound Webhook" → copy URL into Vercel env
 *      GHL_REPUTATION_KIT_WEBHOOK_URL (do not put the webhook URL in this file).
 *
 * Whop: plan ID from your product checkout embed settings.
 * Typeform: live embed ID for the post-purchase booking form (same one GHL already ingests).
 *   Hidden fields passed from funnel: email, phone, name, first_name, last_name (see prepareBookTypeformEmbed).
 *   In Typeform: add matching Hidden fields + skip logic on Q7 when those are filled, OR remove duplicate contact questions.
 *
 * GHL Calendar → Confirmation → External thank-you URL (use merge picker; do NOT use start_time_formatted):
 *   https://offerlaunch.ai/thank-you?name={{contact.first_name}}&time={{appointment.start_time}}&link={{appointment.meeting_location}}&reschedule={{appointment.reschedule_link}}
 *   Calendar must use Google Meet (or custom link) as meeting location so {{appointment.meeting_location}} is a URL.
 *
 * Typeform → Endings → Redirect to URL (pick @ variables in the builder; do not type @ literally if UI offers picker):
 *   https://offerlaunch.ai/reputation-kit-schedule?first_name=@first_name&last_name=@last_name&email=@email&phone=@phone_number&phone_number=@phone_number&utm_source=reputation-kit&utm_medium=typeform&utm_campaign=application
 */
window.REPUTATION_KIT_CONFIG = {
  leadApi: '/api/reputation-kit-lead',
  whopPlanId: 'plan_0w9AIb6oT7nFR',
  typeformLiveId: '01KSV0JD52GQYSR6972X91M6D8',
  bookPath: '/reputation-kit-book',
  schedulePath: '/reputation-kit-schedule',
  thankYouPath: '/thank-you',
  ghlThankYouRedirectUrl:
    'https://offerlaunch.ai/thank-you?name={{contact.first_name}}&time={{appointment.start_time}}&link={{appointment.meeting_location}}&reschedule={{appointment.reschedule_link}}',
  ghlBookingEmbedUrl: 'https://api.leadconnectorhq.com/widget/booking/vyKdc1ieqm0lUMnAph82',
  typeformScheduleRedirectUrl:
    'https://offerlaunch.ai/reputation-kit-schedule?first_name=@first_name&last_name=@last_name&email=@email&phone=@phone_number&phone_number=@phone_number&utm_source=reputation-kit&utm_medium=typeform&utm_campaign=application',
  checkoutPath: '/reputation-kit-checkout',
  funnelPath: '/reputation-kit#funnel-checkout',
  productName: "The Reputation Operator's Kit",
  kitValueDisplay: '$1,499',
  priceDisplay: '$197',
  compareAtDisplay: '$497',
  saveDisplay: '$300',
};
