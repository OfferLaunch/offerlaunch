(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  function get(k) {
    return (params.get(k) || '').trim();
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

  var firstName = get('name') || get('first_name') || get('firstname');
  var startTime = get('time') || get('start_time') || get('starttime');
  var meetingLink = get('link') || get('meeting_link') || get('meet') || get('zoom');
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

  if (meetingLink) {
    document.querySelectorAll('[data-rk-meeting-link]').forEach(function (el) {
      el.href = meetingLink;
    });
  } else {
    document.querySelectorAll('[data-rk-meeting-link]').forEach(function (el) {
      var fallback = el.getAttribute('data-rk-link-fallback');
      if (fallback) el.href = fallback;
      el.textContent = 'Check your email for the Google Meet link';
      el.removeAttribute('target');
    });
  }

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
