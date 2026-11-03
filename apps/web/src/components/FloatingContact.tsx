import { Mail, MessageCircle } from 'lucide-react';
import { site } from '../config/site';

/** WhatsApp + email shortcuts for public pages; each hides itself when unset. */
export default function FloatingContact() {
  if (!site.whatsapp && !site.email) return null;
  return (
    <div className="floating-contact no-print">
      {site.whatsapp && (
        <a className="wa" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
          <MessageCircle size={20} aria-hidden />
        </a>
      )}
      {site.email && (
        <a className="mail" href={`mailto:${site.email}`} aria-label={`Email ${site.email}`}>
          <Mail size={20} aria-hidden />
        </a>
      )}
    </div>
  );
}
