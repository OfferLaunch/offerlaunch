(function () {
  'use strict';

  var BOOKING_STORAGE_KEY = 'rk_booking_confirm_v1';
  var params = new URLSearchParams(window.location.search);

  function decodeParam(value) {
    if (!value) return '';
    try {
      return decodeURIComponent(String(value).replace(/\+/g, ' ')).trim();
    } catch (e) {
      return String(value).trim();
    }
  }

  function get(k) {
    return decodeParam(params.get(k) || '');
  }

  function isMergePlaceholder(value) {
    if (!value) return true;
    var v = String(value).trim();
    if (!v) return true;
    if (/^\{\{[^}]+\}\}$/.test(v)) return true;
    if (v.indexOf('{{') !== -1 && v.indexOf('}}') !== -1) return true;
    return false;
  }

  function firstValid(values) {
    for (var i = 0; i < values.length; i++) {
      var v = values[i];
      if (v && !isMergePlaceholder(v)) return v;
    }
    return '';
  }

  function loadStoredBooking() {
    try {
      var raw = sessionStorage.getItem(BOOKING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function pickFromObject(obj, keys) {
    if (!obj || typeof obj !== 'object') return '';
    for (var i = 0; i < keys.length; i++) {
      var v = obj[keys[i]];
      if (v != null && String(v).trim() && !isMergePlaceholder(String(v))) {
        return String(v).trim();
      }
    }
    return '';
  }

  function formatAppointmentTime(raw) {
    if (!raw) return '';
    var trimmed = raw.trim();
    var parsed = Date.parse(trimmed);
    if (!isNaN(parsed) && (/^\d{4}-\d{2}-\d{2}/.test(trimmed) || trimmed.indexOf('T') !== -1)) {
      return new Date(parsed).toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    }
    return trimmed;
  }

  function isHttpUrl(value) {
    return /^https?:\/\//i.test(value);
  }

  var stored = loadStoredBooking();
  var storedLead = stored && stored.lead;
  var storedBooking = stored && stored.booking;
  var storedInputs = stored && stored.inputs;

  var firstName = firstValid([
    get('name'),
    get('first_name'),
    get('firstname'),
    storedLead && storedLead.first_name,
    storedInputs && pickFromObject(storedInputs, ['first_name', 'firstname', 'firstName']),
  ]);

  var startTime = firstValid([
    get('time'),
    get('start_time'),
    get('starttime'),
    get('appointment_time'),
    get('appointment_start_time'),
    get('start_time_formatted'),
    storedBooking && pickFromObject(storedBooking, [
      'startTime',
      'start_time',
      'appointmentStartTime',
      'appointment_start_time',
      'selectedSlot',
      'selected_time',
      'time',
    ]),
    storedInputs && pickFromObject(storedInputs, ['start_time', 'appointment_time', 'time']),
  ]);

  var meetingLink = firstValid([
    get('link'),
    get('meeting_link'),
    get('meet'),
    get('zoom'),
    get('meeting_location'),
    get('appointment_meeting_location'),
    storedBooking && pickFromObject(storedBooking, [
      'meetingLocation',
      'meeting_location',
      'meetingLink',
      'meeting_link',
      'location',
      'link',
    ]),
    storedInputs && pickFromObject(storedInputs, ['meeting_location', 'meeting_link', 'link']),
  ]);

  var rescheduleLink = firstValid([
    get('reschedule'),
    get('reschedule_link'),
    get('appointment_reschedule_link'),
    storedBooking && pickFromObject(storedBooking, [
      'rescheduleLink',
      'reschedule_link',
      'rescheduleUrl',
    ]),
  ]);

  if (firstName) {
    document.querySelectorAll('[data-rk-firstname]').forEach(function (el) {
      el.textContent = firstName;
    });
  } else {
    document.querySelectorAll('[data-rk-firstname-suffix]').forEach(function (el) {
      el.classList.add('is-empty');
    });
  }

  if (startTime) {
    var timeDisplay = formatAppointmentTime(startTime);
    document.querySelectorAll('[data-rk-time-full]').forEach(function (el) {
      el.textContent = timeDisplay;
    });
  }

  document.querySelectorAll('[data-rk-meeting-link]').forEach(function (el) {
    if (meetingLink && isHttpUrl(meetingLink)) {
      el.href = meetingLink;
      el.textContent = 'Join Google Meet →';
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
      return;
    }

    if (meetingLink) {
      el.textContent = meetingLink;
      el.removeAttribute('href');
      el.removeAttribute('target');
      return;
    }

    var fallback = el.getAttribute('data-rk-link-fallback');
    if (fallback) el.href = fallback;
    el.textContent = 'Check your email for the Google Meet link';
    el.removeAttribute('target');
  });

  document.querySelectorAll('[data-rk-reschedule]').forEach(function (el) {
    var wrap = el.closest('.rk-confirm-note__reschedule-wrap');
    if (rescheduleLink && isHttpUrl(rescheduleLink)) {
      el.href = rescheduleLink;
      el.hidden = false;
      if (wrap) wrap.hidden = false;
    } else if (wrap) {
      wrap.hidden = true;
    }
  });

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'Schedule');
    } catch (e) { /* ignore */ }
  }

  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'consultation_booked', { event_category: 'engagement' });
    } catch (e) { /* ignore */ }
  }
})();
