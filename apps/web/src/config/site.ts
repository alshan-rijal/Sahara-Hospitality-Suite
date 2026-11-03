/**
 * Single source of truth for site-wide identity and public contact details.
 * Placeholder values (empty strings) are intentionally blank — fill them in and
 * features that depend on them (LocalBusiness JSON-LD, phone/WhatsApp/contact
 * buttons) turn themselves on automatically. Never hardcode a made-up address.
 */
export const site = {
  name: 'Sahara Hospitality Suite',
  shortName: 'Sahara',
  /** Public base URL. Set VITE_SITE_URL at build time to override. */
  url: (import.meta.env.VITE_SITE_URL?.replace(/\/+$/, '') as string | undefined) || 'https://sahara.alshanrijal.com.np',
  description:
    'Multi-property hotel management software for front office, housekeeping, restaurants, finance, procurement, maintenance, HR and security — one connected system from reservation to settlement.',
  author: 'Alshan Rijal',
  email: 'contact@alshanrijal.com.np',
  /** Fill in to enable phone-based features. Leave empty to hide them. */
  phone: '',
  /** Fill in (international format, digits only, e.g. 9779800000000) to enable WhatsApp. */
  whatsapp: '',
  /** Fill in to enable the LocalBusiness structured-data block and footer address. */
  address: {
    street: '',
    locality: '',
    region: '',
    postalCode: '',
    country: ''
  },
  social: {
    website: 'https://alshanrijal.com.np',
    github: 'https://github.com/alshan-rijal',
    linkedin: '',
    x: '',
    instagram: ''
  }
} as const;

/** True only when the operator has supplied a complete real address. */
export const hasAddress = Boolean(site.address.street && site.address.locality && site.address.country);
/** True only when the operator has supplied a real phone number. */
export const hasPhone = Boolean(site.phone);
