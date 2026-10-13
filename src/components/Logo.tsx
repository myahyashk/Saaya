export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="20" cy="13" r="10" fill="#FF9B3D" />
        <path d="M1 30C5.6 18.3 12.4 12.5 20 12.5S34.4 18.3 39 30C32.8 23 26.7 19.5 20 19.5S7.2 23 1 30Z" fill="#2F86FF" />
        <path d="M3 29C9.2 24.1 14.8 21.8 20 21.8S30.8 24.1 37 29C30.2 26.5 25.1 25.5 20 25.5S9.8 26.5 3 29Z" fill="#0C2C56" />
      </svg>
      {showText && (
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-latin)' }}>
          Saaya
        </span>
      )}
    </div>
  );
}
