/**
 * Stores appointment details from a GHL workflow (Appointment Booked trigger)
 * so /thank-you can poll by email when the calendar redirect omits appointment merge fields.
 *
 * GHL workflow → Custom Webhook GET:
 * https://offerlaunch.ai/api/reputation-kit-booking-confirm?name={{contact.first_name}}&email={{contact.email}}&time={{appointment.start_time}}&link={{appointment.meeting_location}}&reschedule={{appointment.reschedule_link}}
 */

const STORE = globalThis.__rkBookingConfirmStore || (globalThis.__rkBookingConfirmStore = new Map());
const TTL_MS = 2 * 60 * 60 * 1000;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isPlaceholder(value) {
  const v = String(value || '').trim();
  if (!v) return true;
  if (/^\{\{[^}]+\}\}$/.test(v)) return true;
  if (v.includes('{{') && v.includes('}}')) return true;
  return false;
}

function pickField(query, keys) {
  for (const key of keys) {
    const raw = query[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value == null) continue;
    const trimmed = String(value).trim();
    if (trimmed && !isPlaceholder(trimmed)) return trimmed;
  }
  return '';
}

function pruneStore() {
  const now = Date.now();
  for (const [key, entry] of STORE.entries()) {
    if (!entry || now - entry.savedAt > TTL_MS) STORE.delete(key);
  }
}

function saveBooking(query) {
  const email = normalizeEmail(pickField(query, ['email', 'contact_email']));
  if (!email) return null;

  const record = {
    name: pickField(query, ['name', 'first_name', 'firstname', 'contact_first_name']),
    time: pickField(query, [
      'time',
      'start_time',
      'appointment_time',
      'appointment_start_time',
      'start_time_formatted',
    ]),
    link: pickField(query, [
      'link',
      'meeting_link',
      'meeting_location',
      'appointment_meeting_location',
      'meet',
    ]),
    reschedule: pickField(query, ['reschedule', 'reschedule_link', 'appointment_reschedule_link']),
    savedAt: Date.now(),
  };

  pruneStore();
  STORE.set(email, record);
  return { email, record };
}

function getBooking(email) {
  pruneStore();
  const key = normalizeEmail(email);
  if (!key) return null;
  return STORE.get(key) || null;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (origin === 'https://offerlaunch.ai' || origin === 'https://www.offerlaunch.ai') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = req.query || {};

  if (req.method === 'GET' && query.poll === '1') {
    const email = normalizeEmail(query.email);
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    const record = getBooking(email);
    if (!record) {
      return res.status(404).json({ ok: false, found: false });
    }
    return res.status(200).json({ ok: true, found: true, booking: record });
  }

  if (req.method === 'GET' || req.method === 'POST') {
    let payload = query;
    if (req.method === 'POST') {
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        payload = { ...query, ...body };
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const saved = saveBooking(payload);
    if (!saved) {
      return res.status(400).json({ error: 'email is required' });
    }

    return res.status(200).json({
      ok: true,
      email: saved.email,
      stored: Boolean(saved.record.time || saved.record.link),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
