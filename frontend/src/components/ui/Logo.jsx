export function Logo({ className = "w-10 h-10" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={`shrink-0 ${className}`} aria-label="bruteForce Logo">
      <defs>
        <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>
      <rect width="100" height="100" rx="22" fill="#326742" />
      <g filter="url(#logo-shadow)" fill="none" stroke="#ffffff" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 38 22 Q 24 22 24 35 Q 24 47 16 50 Q 24 53 24 65 Q 24 78 38 78" />
        <line x1="57" y1="20" x2="43" y2="80" />
        <path d="M 62 22 Q 76 22 76 35 Q 76 47 84 50 Q 76 53 76 65 Q 76 78 62 78" />
      </g>
    </svg>
  );
}
