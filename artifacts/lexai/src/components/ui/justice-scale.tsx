import { useId } from "react";

export function JusticeScaleSVG({ size = 28, className = "" }: { size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `jsg-${uid}`;
  const glowId = `jsgw-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0c94a" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#a07c1e" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x="22.5" y="6" width="3" height="32" rx="1.5" fill={`url(#${gradId})`} filter={`url(#${glowId})`} />
      <rect x="13" y="38" width="22" height="3.5" rx="1.75" fill={`url(#${gradId})`} />
      <rect x="10" y="41.5" width="28" height="2.5" rx="1.25" fill={`url(#${gradId})`} opacity="0.7" />
      <rect x="8" y="13.5" width="32" height="2.5" rx="1.25" fill={`url(#${gradId})`} filter={`url(#${glowId})`} />
      <line x1="12" y1="16" x2="12" y2="24" stroke={`url(#${gradId})`} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="36" y1="16" x2="36" y2="24" stroke={`url(#${gradId})`} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 24 Q12 27 18 24" stroke={`url(#${gradId})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${glowId})`} />
      <path d="M30 24 Q36 27 42 24" stroke={`url(#${gradId})`} strokeWidth="2" strokeLinecap="round" fill="none" filter={`url(#${glowId})`} />
      <circle cx="24" cy="8.5" r="2.8" fill={`url(#${gradId})`} filter={`url(#${glowId})`} />
    </svg>
  );
}
