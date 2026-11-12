import { FAKE_DATA } from "@/lib/fake-data";

/** Bandeau affiché en mode démo, pour qu'aucun score fictif ne passe pour vrai. */
export function DemoBanner() {
  if (!FAKE_DATA) return null;
  return (
    <aside
      aria-label="Mode démo"
      className="border-b border-line bg-ink-raised"
    >
      <p className="mx-auto max-w-6xl px-4 py-2 text-xs leading-relaxed text-stone sm:px-6">
        <strong className="font-semibold text-chalk">Démo.</strong> Équipes et
        poules réelles, scores fictifs, sauf la J2 de trois poules
        d&apos;Île-de-France reprise des posts des clubs.
      </p>
    </aside>
  );
}
