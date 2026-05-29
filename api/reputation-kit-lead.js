/**
 * Proxies lead payloads to your GoHighLevel inbound webhook.
 * Set GHL_REPUTATION_KIT_WEBHOOK_URL in Vercel → Project → Settings → Environment Variables.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const webhookUrl = process.env.GHL_REPUTATION_KIT_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(503).json({
      ok: false,
      error: 'GHL_REPUTATION_KIT_WEBHOOK_URL is not configured on the server',
    });
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return res.status(502).json({
        ok: false,
        error: 'GoHighLevel webhook failed',
        status: upstream.status,
        detail: text.slice(0, 500),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'Failed to reach GoHighLevel webhook',
      message: err && err.message ? err.message : 'Unknown error',
    });
  }
};
