import { useEffect } from 'react';

/** Injects a JSON-LD <script> into <head> for the lifetime of the component. */
export default function JsonLd({ id, data }: { id: string; data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data);
  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    el.textContent = json;
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, [id, json]);
  return null;
}
