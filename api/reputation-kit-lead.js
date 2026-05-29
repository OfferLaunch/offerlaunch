export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.GHL_REPUTATION_KIT_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (!body.email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const firstName = body.first_name || '';
    const lastName = body.last_name || '';

    const payload = {
      stage: body.stage || 'optin',
      source: 'reputation-kit',
      product: "The Reputation Operator's Kit",
      full_name: body.full_name || `${firstName} ${lastName}`.trim(),
      first_name: firstName,
      last_name: lastName,
      email: body.email,
      phone: body.phone || '',
      tags: body.tags || ['reputation-kit-lead'],
    };

    const ghlRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!ghlRes.ok) {
      const text = await ghlRes.text();
      return res.status(502).json({ error: 'GHL webhook rejected the request', detail: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
}
