import { site, hasAddress, hasPhone } from '../config/site';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    logo: `${site.url}/brand/sahara-logo-full.png`,
    email: site.email,
    sameAs: [site.social.website, site.social.github, site.social.linkedin, site.social.x, site.social.instagram].filter(Boolean)
  };
}

export function softwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: site.description,
    url: site.url,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  };
}

/** Only emitted when the operator has set a real address and/or phone — never invented. */
export function localBusinessSchema() {
  if (!hasAddress && !hasPhone) return null;
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'LodgingBusiness'],
    name: site.name,
    url: site.url,
    email: site.email,
    ...(hasPhone ? { telephone: site.phone } : {}),
    ...(hasAddress ? {
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.locality,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country
      }
    } : {})
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: site.url + item.path
    }))
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a }
    }))
  };
}
