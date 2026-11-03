import { organizationSchema, softwareApplicationSchema, localBusinessSchema } from '../lib/structuredData';
import JsonLd from './JsonLd';

/** Site-wide structured data for public pages. LocalBusiness only appears when real details are set. */
export default function SiteJsonLd() {
  const local = localBusinessSchema();
  return (
    <>
      <JsonLd id="ld-organization" data={organizationSchema()} />
      <JsonLd id="ld-software" data={softwareApplicationSchema()} />
      {local && <JsonLd id="ld-local" data={local} />}
    </>
  );
}
