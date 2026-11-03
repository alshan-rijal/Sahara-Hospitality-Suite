import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
  // Fallback for non-secure origins where the async Clipboard API is unavailable.
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

/** Copies a value and confirms with a brief "Copied" state. */
export default function CopyButton({ value, label = 'Copy', className = '' }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await writeClipboard(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={`copy-button ${className}`}
      onClick={copy}
      aria-label={copied ? 'Copied' : `${label} ${value}`}
      title={copied ? 'Copied' : label}
    >
      {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
      {copied && <span className="copy-confirm">Copied</span>}
    </button>
  );
}
