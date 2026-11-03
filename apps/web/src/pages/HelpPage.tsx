import { Link } from 'react-router-dom';
import { LifeBuoy, Mail, ArrowRight } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { site } from '../config/site';
import { faqSchema } from '../lib/structuredData';
import DuneDivider from '../components/DuneDivider';

const LAST_UPDATED = '3 November 2026';

const faqs: { q: string; a: string }[] = [
  {
    q: 'Who can see which parts of the system?',
    a: 'Access follows your role. Every action is gated by a permission (for example reservations.checkin or folios.settle), and every query is limited to the properties and departments you are assigned to. If a module is missing from your sidebar, your role does not include its read permission — ask an administrator to review it under Users and Roles.'
  },
  {
    q: 'What does property scope mean for me?',
    a: 'Property scope decides which hotels you can see and add records for. Corporate roles see every property in the group; property and department roles are narrowed to the properties on their account. The chip in the top bar always shows your current scope.'
  },
  {
    q: 'How do I record a guest stay from arrival to settlement?',
    a: 'Add the guest under Guests & CRM, then create a Reservation. Check the guest in from the reservation row to assign a room and open the folio. Post charges from Restaurant POS or straight onto the folio, then use Settle to take payment and close the balance. Checking out returns the room to housekeeping automatically.'
  },
  {
    q: 'Why was my room status change rejected?',
    a: 'Room and reservation actions are state-aware. A room must be vacant clean or inspected before a check-in, and a room cannot be taken out of service while a guest is in it. If an action is greyed out or returns an error, the record is not in the state that action expects.'
  },
  {
    q: 'Where do housekeeping and maintenance tasks come from?',
    a: 'Checking a guest out creates a checkout-clean task automatically. Managers can also raise tasks directly in Housekeeping and Maintenance. Completing a cleaning task flips the room back to vacant clean so the front desk can sell it again.'
  },
  {
    q: 'I have forgotten my password. What now?',
    a: 'Passwords are managed by your hotel administrator. Ask them to update your account under Users — they can set a new password without losing your role, properties or history.'
  },
  {
    q: 'How do I export or print a folio or table?',
    a: 'Any table or folio page prints cleanly: use your browser print command and the sidebar, buttons and navigation are removed automatically, leaving just the record on the page.'
  },
  {
    q: `How do I reach support?`,
    a: `Email ${site.email} with the property code, the module and, if you can, the record reference. That gets your question to the right place first time.`
  }
];

export default function HelpPage() {
  useSeo({
    title: `Help & FAQ | ${site.name}`,
    description: 'Answers to common questions about access, reservations, folios, housekeeping, printing and support in Sahara Hospitality Suite.',
    path: '/help',
    jsonLd: faqSchema(faqs)
  });

  return (
    <>
      <p className="public-eyebrow">Help centre</p>
      <h1>How can we help?</h1>
      <p className="lede">
        Short answers to the questions the front desk, housekeeping and finance teams ask most.
        If yours is not here, email <a href={`mailto:${site.email}`}>{site.email}</a> and we will add it.
      </p>

      <DuneDivider />

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="sr-only">Frequently asked questions</h2>
        <div className="faq">
          {faqs.map(faq => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <div className="faq-answer"><p>{faq.a}</p></div>
            </details>
          ))}
        </div>
      </section>

      <p className="updated-note">Last updated: {LAST_UPDATED}</p>

      <DuneDivider />

      <section className="help-cta" aria-labelledby="help-cta-heading">
        <h2 id="help-cta-heading"><LifeBuoy size={18} aria-hidden /> Still stuck?</h2>
        <p>Send us the property code and the record you were working on, and we will pick it up from there.</p>
        <div className="empty-action">
          <a className="button-link" href={`mailto:${site.email}`}><Mail size={16} aria-hidden /> Email support</a>
          <Link className="button-link secondary-link" to="/login"><ArrowRight size={16} aria-hidden /> Back to sign in</Link>
        </div>
      </section>
    </>
  );
}
