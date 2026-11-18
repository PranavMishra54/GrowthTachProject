export default function Loader({ label = 'Loading', fullScreen = false }) {
  return (
    <div className={`loader-wrap${fullScreen ? ' loader-full' : ''}`} role="status" aria-label={label}>
      <span className="spinner" />
      <span className="sr-only">{label}...</span>
    </div>
  );
}
