export function DeflagLoader({ size = 120 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="Chargement…"
      style={{ width: size, height: size, display: "inline-block" }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <rect x="30" y="50" width="140" height="16" rx="4" fill="#e6e6e9" />

        <rect x="40" y="66" width="14" height="55" rx="2" fill="#e6e6e9" />

        <rect
          x="150"
          y="66"
          width="14"
          height="55"
          rx="2"
          fill="#e6e6e9"
          className="flag"
        />

        <style>{`
            .flag {
              transform-origin: 127px 66px; /* point d’attache en haut */
              animation: deflagDown 1.8s ease-in-out infinite;
            }
  
            @keyframes deflagDown {
              0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
              20%  { transform: translateY(4px) rotate(-5deg); }
              40%  { transform: translateY(0) rotate(0deg); }
              60%  { transform: translateY(30px) rotate(8deg); opacity: 1; }
              80%  { transform: translateY(70px) rotate(15deg); opacity: .9; }
              100% { transform: translateY(120px) rotate(25deg); opacity: 0; }
            }
          `}</style>
      </svg>
    </div>
  );
}
