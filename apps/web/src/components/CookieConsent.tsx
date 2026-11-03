import { useState } from 'react';
import { Cookie } from 'lucide-react';
import { saveConsent, useConsent } from '../lib/tracking';

/** Consent banner. Nothing optional loads until the visitor says yes. */
export default function CookieConsent() {
  const consent = useConsent();
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  if (consent) return null;

  const decide = (allowAnalytics: boolean) => saveConsent(allowAnalytics);

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie consent">
      <p>
        <b><Cookie size={13} aria-hidden /> Cookies on this site</b>
        We use a strictly necessary cookie to keep you signed in. With your consent we also measure anonymous usage to improve the product.
      </p>
      {showPrefs ? (
        <div className="cookie-actions">
          <label className="check-inline">
            <input type="checkbox" checked disabled /> Necessary
          </label>
          <label className="check-inline">
            <input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} /> Analytics
          </label>
          <button type="button" className="secondary" onClick={() => setShowPrefs(false)}>Back</button>
          <button type="button" onClick={() => decide(analytics)}>Save choices</button>
        </div>
      ) : (
        <div className="cookie-actions">
          <button type="button" className="secondary" onClick={() => setShowPrefs(true)}>Preferences</button>
          <button type="button" className="secondary" onClick={() => decide(false)}>Reject</button>
          <button type="button" onClick={() => decide(true)}>Accept all</button>
        </div>
      )}
    </div>
  );
}
