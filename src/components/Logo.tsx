export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Sun */}
        <circle cx="11" cy="11" r="5" fill="#FBBF24" />
        {/* Shade/umbrella */}
        <path d="M16 14 C16 9, 20 6, 25 6 C27 6, 28 8, 28 11 L28 14 Z" fill="#2563EB" />
        <path d="M22 14 L22 26" stroke="#1E3A8A" strokeWidth="2" stroke-linecap="round" />
        <path d="M18 26 Q22 23, 26 26" fill="none" stroke="#1E3A8A" strokeWidth="2" stroke-linecap="round" />
      </svg>
      {showText && (
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-latin)' }}>
          Saaya
        </span>
      )}
    </div>
  );
}
