(function (global) {
  'use strict';

  var STORAGE_KEY = 'rk_lead_v1';

  function config() {
    return global.REPUTATION_KIT_CONFIG || {};
  }

  function parseFullName(full) {
    var trimmed = (full || '').trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      return { first_name: '', last_name: '', full_name: '' };
    }
    var space = trimmed.indexOf(' ');
    if (space === -1) {
      return { first_name: trimmed, last_name: '', full_name: trimmed };
    }
    return {
      first_name: trimmed.slice(0, space),
      last_name: trimmed.slice(space + 1).trim(),
      full_name: trimmed,
    };
  }

  function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
  }

  function saveLead(lead) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
    } catch (e) { /* ignore */ }
  }

  function loadLead() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function paramsFromUrl() {
    var params = new URLSearchParams(global.location.search);
    var fullName = params.get('name') || params.get('full_name') || '';
    var email = params.get('email') || '';
    if (!fullName && !email) return null;
    var parts = parseFullName(fullName);
    return {
      full_name: parts.full_name,
      first_name: parts.first_name,
      last_name: parts.last_name,
      email: normalizeEmail(email),
      phone: params.get('phone') || '',
    };
  }

  function resolveLead() {
    var fromUrl = paramsFromUrl();
    if (fromUrl && fromUrl.email) {
      saveLead(fromUrl);
      return fromUrl;
    }
    return loadLead();
  }

  function buildQuery(lead, extra) {
    var q = new URLSearchParams();
    if (lead.full_name) q.set('name', lead.full_name);
    if (lead.email) q.set('email', lead.email);
    if (lead.phone) q.set('phone', lead.phone);
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        if (extra[key] != null && extra[key] !== '') q.set(key, String(extra[key]));
      });
    }
    return q.toString();
  }

  function pathWithQuery(basePath, lead, extra) {
    var qs = buildQuery(lead, extra);
    return basePath + (qs ? '?' + qs : '');
  }

  function buildPayload(stage, lead) {
    var cfg = config();
    return {
      stage: stage,
      source: 'reputation-kit',
      product: cfg.productName || "The Reputation Operator's Kit",
      full_name: lead.full_name || '',
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      tags: stage === 'purchase_complete' ? ['reputation-kit-customer'] : ['reputation-kit-lead'],
    };
  }

  async function sendToGhl(stage, lead, timeoutMs) {
    var cfg = config();
    var endpoint = cfg.leadApi || '/api/reputation-kit-lead';
    var payload = buildPayload(stage, lead);
    var ms = timeoutMs || 15000;
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, ms);

    try {
      var res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        var errBody = null;
        try {
          errBody = await res.json();
        } catch (e) { /* ignore */ }
        var message = (errBody && errBody.error) || 'Could not save your information. Please try again.';
        throw new Error(message);
      }

      return true;
    } catch (err) {
      if (err && err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again or continue to checkout.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function applyWhopPrefill(lead) {
    var embed = document.getElementById('whop-checkout-embed');
    if (!embed || !lead) return;

    var email = lead.email || '';
    var name = lead.full_name || '';

    if (email) {
      embed.setAttribute('data-whop-checkout-prefill-email', email);
    }
    if (name) {
      embed.setAttribute('data-whop-checkout-prefill-name', name);
    }

    // wco.setEmail(embedId, email) — first arg is the div id, NOT the email
    var embedId = embed.id;
    if (embedId && email && global.wco && typeof global.wco.setEmail === 'function') {
      try {
        global.wco.setEmail(embedId, email);
      } catch (e) { /* prefill attributes are enough */ }
    }
  }

  function trackInitiateCheckout() {
    if (global.fbq) {
      global.fbq('track', 'InitiateCheckout');
    }
  }

  function trackLead() {
    if (global.fbq) {
      global.fbq('track', 'Lead');
    }
  }

  function normalizePhone(value) {
    var digits = (value || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits : '';
  }

  function configureWhopEmbed(lead) {
    var cfg = config();
    var embed = document.getElementById('whop-checkout-embed');
    if (!embed) return;

    var planId = cfg.whopPlanId;
    if (!planId || planId.indexOf('plan_') !== 0) {
      embed.innerHTML = '<p style="margin:0;font-size:0.8125rem;color:rgba(26,26,26,0.65);">Add your Whop plan ID in reputation-kit-config.js</p>';
      return;
    }

    var bookPath = cfg.bookPath || '/reputation-kit-book';
    var returnUrl = new URL(bookPath, global.location.origin);
    returnUrl.search = buildQuery(lead);

    embed.setAttribute('data-whop-checkout-plan-id', planId);
    embed.setAttribute('data-whop-checkout-return-url', returnUrl.toString());
    embed.setAttribute('data-whop-checkout-theme', 'light');
    embed.setAttribute('data-whop-checkout-hide-price', 'true');
    applyWhopPrefill(lead);
  }

  function initHeroLeadForm() {
    var form = document.getElementById('funnel-lead-form');
    if (!form) return;

    var errorEl = document.getElementById('funnel-lead-error');
    var submitBtn = document.getElementById('funnel-lead-submit');
    var cfg = config();
    var checkoutPath = cfg.checkoutPath || '/reputation-kit-checkout';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = '';
      }

      var fullName = document.getElementById('funnel-full-name').value.trim();
      var email = normalizeEmail(document.getElementById('funnel-email').value);
      var phoneRaw = document.getElementById('funnel-phone').value.trim();
      var phoneDigits = normalizePhone(phoneRaw);

      if (!fullName || fullName.length < 2) {
        if (errorEl) {
          errorEl.textContent = 'Please enter your full name.';
          errorEl.hidden = false;
        }
        return;
      }
      if (!email || email.indexOf('@') === -1) {
        if (errorEl) {
          errorEl.textContent = 'Please enter a valid email address.';
          errorEl.hidden = false;
        }
        return;
      }
      if (!phoneDigits) {
        if (errorEl) {
          errorEl.textContent = 'Please enter a valid phone number (at least 10 digits).';
          errorEl.hidden = false;
        }
        return;
      }

      var parts = parseFullName(fullName);
      var lead = {
        full_name: parts.full_name,
        first_name: parts.first_name,
        last_name: parts.last_name,
        email: email,
        phone: phoneRaw,
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';

      try {
        await sendToGhl('optin', lead);
        saveLead(lead);
        trackLead();
        trackInitiateCheckout();
        global.location.href = pathWithQuery(checkoutPath, lead);
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = (err && err.message)
            ? err.message
            : 'Something went wrong. Please try again.';
          errorEl.hidden = false;
        }
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continue to checkout';
      }
    });
  }

  function initCheckoutPage() {
    var cfg = config();
    var funnelPath = cfg.funnelPath || '/reputation-kit#funnel-checkout';
    var lead = resolveLead();

    if (!lead || !lead.email) {
      global.location.replace(funnelPath);
      return;
    }

    var summary = document.getElementById('rk-checkout-summary');
    var nameEl = document.getElementById('rk-checkout-name');
    var emailEl = document.getElementById('rk-checkout-email');

    if (summary && nameEl && emailEl) {
      nameEl.textContent = lead.full_name || 'Your order';
      emailEl.textContent = lead.email;
      summary.hidden = false;
    }

    configureWhopEmbed(lead);
    trackInitiateCheckout();
  }

  global.ReputationKitFunnel = {
    parseFullName: parseFullName,
    normalizeEmail: normalizeEmail,
    saveLead: saveLead,
    loadLead: loadLead,
    paramsFromUrl: paramsFromUrl,
    resolveLead: resolveLead,
    pathWithQuery: pathWithQuery,
    sendToGhl: sendToGhl,
    applyWhopPrefill: applyWhopPrefill,
    trackInitiateCheckout: trackInitiateCheckout,
    trackLead: trackLead,
    normalizePhone: normalizePhone,
    configureWhopEmbed: configureWhopEmbed,
    initHeroLeadForm: initHeroLeadForm,
    initCheckoutPage: initCheckoutPage,
    buildQuery: buildQuery,
    config: config,
  };
})(window);
