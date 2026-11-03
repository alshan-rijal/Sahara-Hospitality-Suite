import { useEffect, useState } from 'react';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const UTM_STORE = 'sahara_utm';
const CONSENT_STORE = 'sahara_consent';
const CONSENT_EVENT = 'sahara:consent';

export type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export interface Consent {
  necessary: true;
  analytics: boolean;
  decidedAt: string;
}

/** Reads UTM parameters from the URL on first visit and keeps them for the session. */
export function captureUtm() {
  try {
    if (sessionStorage.getItem(UTM_STORE)) return;
    const params = new URLSearchParams(window.location.search);
    const found: Utm = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) found[key] = value;
    }
    if (Object.keys(found).length) sessionStorage.setItem(UTM_STORE, JSON.stringify(found));
  } catch {
    /* storage unavailable (private mode) — tracking simply stays off */
  }
}

export function getUtm(): Utm {
  try { return JSON.parse(sessionStorage.getItem(UTM_STORE) || '{}') as Utm; } catch { return {}; }
}

export function getConsent(): Consent | null {
  try { return JSON.parse(localStorage.getItem(CONSENT_STORE) || 'null') as Consent | null; } catch { return null; }
}

export function saveConsent(analytics: boolean): Consent {
  const consent: Consent = { necessary: true, analytics, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_STORE, JSON.stringify(consent));
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    /* ignore */
  }
  return consent;
}

/** Sends an analytics event only when the visitor consented and an endpoint is configured. */
export function track(event: string, props: Record<string, unknown> = {}) {
  const consent = getConsent();
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
  if (!consent?.analytics || !endpoint) return;
  const body = JSON.stringify({ event, props: { ...props, ...getUtm() }, path: window.location.pathname, ts: Date.now() });
  try {
    const beacon = navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }));
    if (!beacon) void fetch(endpoint, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } });
  } catch {
    /* never let analytics break the app */
  }
}

/** Live view of the consent choice, shared across components. */
export function useConsent() {
  const [consent, setConsent] = useState<Consent | null>(() => getConsent());
  useEffect(() => {
    const sync = () => setConsent(getConsent());
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return consent;
}
