import React from 'react';

type BrandLogoProps = {
  isDarkMode: boolean;
  className?: string;
  compact?: boolean;
};

const BrandMark = ({ isDarkMode, className = '' }: { isDarkMode: boolean; className?: string }) => {
  const bg = isDarkMode ? '#0f1720' : '#f8fafb';
  const stroke = isDarkMode ? '#254f66' : '#1F475B';
  const accent = '#E35E1C';
  const subtle = isDarkMode ? '#d9e3ea' : '#4b6574';

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="60" height="60" rx="18" fill={bg} />
      <rect x="10" y="16" width="44" height="30" rx="10" fill={stroke} opacity="0.14" />
      <rect x="10" y="16" width="44" height="30" rx="10" stroke={stroke} strokeWidth="3" />
      <path d="M18 12V20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 12V18" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 12V20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 24H20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 30H18" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 36H20" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M24 37L31.5 29.5L36 34L44 26"
        stroke={subtle}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M39.5 26H44V30.5" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="48" r="4" fill={accent} />
    </svg>
  );
};

export const BrandLogo = ({ isDarkMode, className = '', compact = false }: BrandLogoProps) => {
  const titleColor = isDarkMode ? 'text-zinc-50' : 'text-woodsmoke';
  const subtitleColor = isDarkMode ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-[1.25rem] bg-trinidad/15 blur-xl" />
        <BrandMark isDarkMode={isDarkMode} className="relative h-12 w-12" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className={`text-xl font-black tracking-[-0.04em] ${titleColor}`}>MatScale</div>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${subtitleColor}`}>
            Precision Desk Mat Fit
          </div>
        </div>
      )}
    </div>
  );
};

