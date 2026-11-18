"use client";

import { useRef, useState } from "react";

import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH } from "@flagscore/ui/SignatureSvg";

/**
 * Pad de signature au doigt : les points sont ramenés dans le repère
 * 600 × 220 et écrits directement en attribut `d` d'un `<path>` SVG
 * (commandes M et L entières), seul format accepté par le serveur.
 */
export function SignaturePad({ name, label }: { name: string; label: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  const [path, setPath] = useState("");

  const point = (e: React.PointerEvent) => {
    const box = svg.current!.getBoundingClientRect();
    const x = Math.round(
      ((e.clientX - box.left) / box.width) * SIGNATURE_WIDTH
    );
    const y = Math.round(
      ((e.clientY - box.top) / box.height) * SIGNATURE_HEIGHT
    );
    return `${x} ${y}`;
  };

  return (
    <div>
      <svg
        ref={svg}
        viewBox={`0 0 ${SIGNATURE_WIDTH} ${SIGNATURE_HEIGHT}`}
        role="img"
        aria-label={label}
        className="h-36 w-full touch-none rounded-[4px] border border-line bg-ink-raised text-chalk"
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          const p = point(e);
          setPath(d => `${d}M${p}L${p}`);
        }}
        onPointerMove={e => {
          if (drawing.current) setPath(d => `${d}L${point(e)}`);
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      >
        <line
          x1={24}
          x2={SIGNATURE_WIDTH - 24}
          y1={SIGNATURE_HEIGHT - 40}
          y2={SIGNATURE_HEIGHT - 40}
          stroke="var(--fs-line)"
          strokeWidth={2}
        />
        <path
          d={path || "M0 0"}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <input type="hidden" name={name} value={path} />
      <div className="mt-1 flex justify-between text-xs text-stone">
        <span>Signe avec le doigt dans le cadre.</span>
        <button
          type="button"
          onClick={() => setPath("")}
          className="min-h-11 px-2 font-semibold text-chalk underline underline-offset-2"
        >
          Effacer
        </button>
      </div>
    </div>
  );
}
