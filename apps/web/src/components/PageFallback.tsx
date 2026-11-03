/** Suspense fallback shown while a lazily-loaded route chunk arrives. */
export default function PageFallback() {
  return (
    <div className="page-loader" aria-busy="true">
      <div className="spinner" />
      <span>Loading…</span>
    </div>
  );
}
