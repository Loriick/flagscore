/** Repère commun du pad de signature et de son affichage. */
export const SIGNATURE_WIDTH = 600;
export const SIGNATURE_HEIGHT = 220;

/** Affiche un tracé validé côté serveur (attribut `d` seulement). */
export function SignatureSvg({
  path,
  label,
  className,
}: {
  path: string;
  label: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${SIGNATURE_WIDTH} ${SIGNATURE_HEIGHT}`}
      role="img"
      aria-label={label}
      className={className}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
