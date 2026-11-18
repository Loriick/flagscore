"use client";

import { useState } from "react";

import type {
  SheetResult,
  SheetStatus,
  Side,
  SignerRole,
} from "@flagscore/core/sheets";
import { ActionForm } from "@flagscore/ui/ActionForm";
import { SignatureSvg } from "@flagscore/ui/SignatureSvg";
import {
  cn,
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionBarClass,
} from "@flagscore/ui/styles";

import { SignaturePad } from "./SignaturePad";

import {
  addInjury,
  removeInjury,
  setResult,
  sign,
} from "@/app/plateau/actions";

export interface SheetView {
  id: string;
  status: SheetStatus;
  result: SheetResult | null;
  teams: Record<Side, string>;
  signatures: Array<{
    side: Side;
    role: SignerRole;
    signerName: string;
    path: string;
  }>;
  injuries: Array<{
    id: string;
    side: Side;
    playerName: string;
    jerseyNumber: string | null;
    moment: string | null;
  }>;
  required: ReadonlyArray<readonly [Side, SignerRole]>;
  roleLabel: Record<SignerRole, string>;
}

const SIDES: Side[] = ["home", "away"];

export function SheetEditor({
  sheet,
  editable,
}: {
  sheet: SheetView;
  editable: boolean;
}) {
  const locked = !editable || sheet.status === "signed";
  return (
    <div className="space-y-10">
      <ResultSection sheet={sheet} locked={locked} />
      <SignatureSection sheet={sheet} locked={locked} />
      <InjurySection sheet={sheet} editable={editable} />
    </div>
  );
}

function ResultSection({
  sheet,
  locked,
}: {
  sheet: SheetView;
  locked: boolean;
}) {
  const [mode, setMode] = useState<SheetResult["kind"]>(
    sheet.result?.kind ?? "score"
  );
  const initial =
    sheet.result?.kind === "score"
      ? { home: sheet.result.home, away: sheet.result.away }
      : { home: 0, away: 0 };
  const [scores, setScores] = useState<Record<Side, number>>(initial);

  if (locked) {
    return (
      <section>
        <h2 className={sectionBarClass}>Résultat</h2>
        {SIDES.map(side => (
          <div
            key={side}
            className="flex items-center justify-between border-b border-line py-3"
          >
            <span className="font-score text-2xl font-bold text-chalk">
              {sheet.teams[side]}
            </span>
            <span className="font-score text-4xl font-black text-chalk">
              {sheet.result?.kind === "score"
                ? sheet.result[side]
                : sheet.result?.side === side
                  ? "Forfait"
                  : ""}
            </span>
          </div>
        ))}
        {!sheet.result && (
          <p className="py-3 text-sm text-stone">Aucun résultat saisi.</p>
        )}
      </section>
    );
  }

  const signed = sheet.signatures.length;
  return (
    <section>
      <h2 className={sectionBarClass}>Résultat</h2>
      <div role="tablist" className="mt-3 flex gap-6 border-b border-line">
        {(
          [
            ["score", "Score"],
            ["forfeit", "Forfait"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={cn(
              "font-score -mb-px min-h-11 border-b-[3px] text-xl font-bold",
              mode === value
                ? "border-flag text-chalk"
                : "border-transparent text-stone"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <ActionForm
        action={setResult}
        submitLabel="Enregistrer le résultat"
        buttonClass={cn(primaryButtonClass, "mt-4 w-full")}
        confirmMessage={
          signed
            ? `Modifier le résultat efface ${signed === 1 ? "la signature déjà posée" : `les ${signed} signatures déjà posées`}. Continuer ?`
            : undefined
        }
      >
        <input type="hidden" name="sheetId" value={sheet.id} />
        <input type="hidden" name="kind" value={mode} />
        {mode === "score" ? (
          SIDES.map(side => (
            <div
              key={side}
              className="flex items-center justify-between gap-3 border-b border-line py-3"
            >
              <label
                htmlFor={`score-${side}`}
                className="font-score min-w-0 text-2xl leading-tight font-bold text-chalk"
              >
                {sheet.teams[side]}
              </label>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={`Retirer un point à ${sheet.teams[side]}`}
                  onClick={() =>
                    setScores(s => ({ ...s, [side]: Math.max(0, s[side] - 1) }))
                  }
                  className="font-score size-12 rounded-[4px] border border-line text-3xl font-black text-chalk active:bg-ink-hover"
                >
                  −
                </button>
                <input
                  id={`score-${side}`}
                  name={side}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={300}
                  value={scores[side]}
                  onChange={e =>
                    setScores(s => ({
                      ...s,
                      [side]: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="font-score h-14 w-20 rounded-[4px] border border-line bg-ink-raised text-center text-4xl font-black text-chalk focus:border-flag focus:outline-none"
                />
                <button
                  type="button"
                  aria-label={`Ajouter un point à ${sheet.teams[side]}`}
                  onClick={() =>
                    setScores(s => ({
                      ...s,
                      [side]: Math.min(300, s[side] + 1),
                    }))
                  }
                  className="font-score size-12 rounded-[4px] bg-flag text-3xl font-black text-ink active:bg-flag-deep"
                >
                  +
                </button>
              </div>
            </div>
          ))
        ) : (
          <fieldset className="mt-3 space-y-2">
            <legend className={labelClass}>Équipe forfait</legend>
            {SIDES.map(side => (
              <label
                key={side}
                className="flex min-h-12 items-center gap-3 rounded-[4px] border border-line px-3 has-[:checked]:border-flag"
              >
                <input
                  type="radio"
                  name="side"
                  value={side}
                  required
                  defaultChecked={
                    sheet.result?.kind === "forfeit" &&
                    sheet.result.side === side
                  }
                  className="size-5 accent-[var(--fs-flag)]"
                />
                <span className="font-score text-xl font-bold text-chalk">
                  {sheet.teams[side]}
                </span>
              </label>
            ))}
            <p className="text-xs text-stone">
              Aucun score n&apos;est inventé : le site affiche « forfait ».
            </p>
          </fieldset>
        )}
      </ActionForm>
    </section>
  );
}

function SignatureSection({
  sheet,
  locked,
}: {
  sheet: SheetView;
  locked: boolean;
}) {
  const count = sheet.signatures.length;
  const total = sheet.required.length;
  return (
    <section>
      <h2 className={cn(sectionBarClass, "flex justify-between")}>
        <span>Signatures</span>
        <span className="tabular">
          {count}/{total}
        </span>
      </h2>
      {sheet.status === "signed" ? (
        <p className="py-3 text-sm text-chalk">
          Feuille signée par les deux équipes. Seul un admin peut la rouvrir.
        </p>
      ) : !sheet.result ? (
        <p className="py-3 text-sm text-stone">
          Enregistre le résultat avant de faire signer.
        </p>
      ) : (
        <p className="py-3 text-sm text-stone">
          Les deux coachs et les deux capitaines signent sur ce téléphone. Le
          score est publié à la quatrième signature.
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2">
        {sheet.required.map(([side, role]) => {
          const existing = sheet.signatures.find(
            s => s.side === side && s.role === role
          );
          return (
            <li key={`${side}-${role}`}>
              <SignatureCard
                sheet={sheet}
                side={side}
                role={role}
                existing={existing}
                canSign={!locked && !!sheet.result}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SignatureCard({
  sheet,
  side,
  role,
  existing,
  canSign,
}: {
  sheet: SheetView;
  side: Side;
  role: SignerRole;
  existing?: SheetView["signatures"][number];
  canSign: boolean;
}) {
  const [redo, setRedo] = useState(false);
  const title = `${sheet.roleLabel[role]} · ${sheet.teams[side]}`;
  const id = `${side}-${role}`;

  if (existing && !redo) {
    return (
      <div className="border-t-[3px] border-flag pt-2">
        <p className="text-xs font-semibold tracking-wide text-stone">
          {title}
        </p>
        <SignatureSvg
          path={existing.path}
          label={`Signature de ${existing.signerName}`}
          className="h-20 w-full text-chalk"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-chalk">
            {existing.signerName}
          </p>
          {canSign && (
            <button
              type="button"
              onClick={() => setRedo(true)}
              className="min-h-11 px-2 text-xs font-semibold text-stone underline underline-offset-2"
            >
              Refaire
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t-[3px] border-line pt-2">
      <p className="text-xs font-semibold tracking-wide text-stone">{title}</p>
      {canSign ? (
        <ActionForm
          action={sign}
          submitLabel="Valider la signature"
          buttonClass={cn(primaryButtonClass, "mt-2 w-full")}
          className="mt-2 space-y-2"
        >
          <input type="hidden" name="sheetId" value={sheet.id} />
          <input type="hidden" name="side" value={side} />
          <input type="hidden" name="role" value={role} />
          <div>
            <label htmlFor={`name-${id}`} className={labelClass}>
              Nom et prénom
            </label>
            <input
              id={`name-${id}`}
              name="signerName"
              required
              autoComplete="off"
              defaultValue={existing?.signerName}
              className={inputClass}
            />
          </div>
          <SignaturePad name="path" label={`Signature, ${title}`} />
        </ActionForm>
      ) : (
        <p className="py-2 text-sm text-stone">Pas encore signé.</p>
      )}
    </div>
  );
}

function InjurySection({
  sheet,
  editable,
}: {
  sheet: SheetView;
  editable: boolean;
}) {
  return (
    <section>
      <h2 className={sectionBarClass}>Blessés</h2>
      <p className="py-3 text-sm text-stone">
        Qui, et à quel moment. Ne décris pas la blessure.
      </p>
      {sheet.injuries.length > 0 && (
        <ul>
          {sheet.injuries.map(i => (
            <li
              key={i.id}
              className="flex items-center justify-between gap-3 border-b border-line py-3"
            >
              <div>
                <p className="font-semibold text-chalk">
                  {i.playerName}
                  {i.jerseyNumber && ` · n° ${i.jerseyNumber}`}
                </p>
                <p className="text-sm text-stone">
                  {sheet.teams[i.side]}
                  {i.moment && ` · ${i.moment}`}
                </p>
              </div>
              {editable && (
                <ActionForm
                  action={removeInjury}
                  submitLabel="Retirer"
                  buttonClass={dangerButtonClass}
                  confirmMessage={`Retirer ${i.playerName} des blessés ?`}
                >
                  <input type="hidden" name="sheetId" value={sheet.id} />
                  <input type="hidden" name="injuryId" value={i.id} />
                </ActionForm>
              )}
            </li>
          ))}
        </ul>
      )}
      {editable && (
        <ActionForm
          action={addInjury}
          submitLabel="Ajouter le blessé"
          buttonClass={cn(secondaryButtonClass, "w-full")}
          className="mt-4 space-y-3"
        >
          <input type="hidden" name="sheetId" value={sheet.id} />
          <fieldset>
            <legend className={labelClass}>Équipe</legend>
            <div className="grid grid-cols-2 gap-2">
              {SIDES.map(side => (
                <label
                  key={side}
                  className="flex min-h-11 items-center gap-2 rounded-[4px] border border-line px-3 text-sm font-semibold text-chalk has-[:checked]:border-flag"
                >
                  <input
                    type="radio"
                    name="side"
                    value={side}
                    required
                    className="accent-[var(--fs-flag)]"
                  />
                  {sheet.teams[side]}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-[1fr_6rem] gap-2">
            <div>
              <label htmlFor="playerName" className={labelClass}>
                Joueur ou joueuse
              </label>
              <input
                id="playerName"
                name="playerName"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="jerseyNumber" className={labelClass}>
                N° maillot
              </label>
              <input
                id="jerseyNumber"
                name="jerseyNumber"
                inputMode="numeric"
                maxLength={4}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="moment" className={labelClass}>
              Moment (facultatif)
            </label>
            <input
              id="moment"
              name="moment"
              placeholder="2e mi-temps, 12e min"
              className={inputClass}
            />
          </div>
        </ActionForm>
      )}
    </section>
  );
}
