/** Hand-drawn dune-line divider used between sections instead of a plain rule. */
export default function DuneDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`dune-divider ${className}`} role="presentation" aria-hidden>
      <svg viewBox="0 0 1200 28" preserveAspectRatio="none">
        <path d="M0 18 Q90 4 180 18 T360 18 T540 18 T720 18 T900 18 T1080 18 T1260 18" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".3" />
        <path d="M0 24 Q120 12 240 24 T480 24 T720 24 T960 24 T1200 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".16" />
      </svg>
    </div>
  );
}
