/** Small inline spinner for buttons and inline loading states. */
export default function Spinner({ size = 16 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size, borderWidth: 2 }} aria-hidden />;
}
