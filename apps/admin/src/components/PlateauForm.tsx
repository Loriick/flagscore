"use client";

import { useMemo, useState } from "react";

import {
  poolEvents,
  SOCIAL_CHAMPIONSHIPS,
  socialPools,
} from "@flagscore/core/social/results";
import { inputClass, labelClass } from "@flagscore/ui/styles";

import { ActionForm } from "./ActionForm";

import { savePlateau } from "@/app/plateaux/actions";

export interface PlateauValues {
  id?: string;
  pool_id: number;
  event_key: string;
  date: string;
  venue: string;
  host_club: string | null;
}

/**
 * Création ou modification d'un plateau : journée du calendrier et poule de
 * la saison, date pré-remplie depuis la journée.
 */
export function PlateauForm({ initial }: { initial?: PlateauValues }) {
  const [championshipId, setChampionshipId] = useState(
    initial ? Math.floor(initial.pool_id / 100) : SOCIAL_CHAMPIONSHIPS[0].id
  );
  const pools = useMemo(() => socialPools(championshipId), [championshipId]);
  const [poolId, setPoolId] = useState(initial?.pool_id ?? pools[0]?.id ?? 0);
  const events = useMemo(() => poolEvents(poolId), [poolId]);
  const [eventKey, setEventKey] = useState(
    initial?.event_key ?? events[0]?.key ?? ""
  );
  const [date, setDate] = useState(initial?.date ?? events[0]?.start ?? "");

  const pickEvent = (key: string) => {
    setEventKey(key);
    const event = events.find(e => e.key === key);
    if (event) setDate(event.start);
  };

  return (
    <ActionForm
      action={savePlateau}
      submitLabel={initial ? "Enregistrer" : "Créer le plateau"}
      className="grid gap-4 sm:grid-cols-2"
    >
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="sm:col-span-2">
        <label htmlFor="championship" className={labelClass}>
          Compétition
        </label>
        <select
          id="championship"
          value={championshipId}
          onChange={e => {
            const id = Number(e.target.value);
            setChampionshipId(id);
            const first = socialPools(id)[0]?.id ?? 0;
            setPoolId(first);
            const firstEvent = poolEvents(first)[0];
            setEventKey(firstEvent?.key ?? "");
            setDate(firstEvent?.start ?? "");
          }}
          className={inputClass}
        >
          {SOCIAL_CHAMPIONSHIPS.map(c => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="poolId" className={labelClass}>
          Poule
        </label>
        <select
          id="poolId"
          name="poolId"
          value={poolId}
          onChange={e => {
            const id = Number(e.target.value);
            setPoolId(id);
            if (!poolEvents(id).some(ev => ev.key === eventKey)) {
              const first = poolEvents(id)[0];
              setEventKey(first?.key ?? "");
              setDate(first?.start ?? "");
            }
          }}
          className={inputClass}
        >
          {pools.map(p => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="eventKey" className={labelClass}>
          Journée
        </label>
        <select
          id="eventKey"
          name="eventKey"
          value={eventKey}
          onChange={e => pickEvent(e.target.value)}
          className={inputClass}
        >
          {events.map(e => (
            <option key={e.key} value={e.key}>
              {e.stage} · {e.start}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date" className={labelClass}>
          Date du plateau
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="hostClub" className={labelClass}>
          Club qui reçoit
        </label>
        <input
          id="hostClub"
          name="hostClub"
          defaultValue={initial?.host_club ?? ""}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="venue" className={labelClass}>
          Lieu (gymnase, ville)
        </label>
        <input
          id="venue"
          name="venue"
          required
          defaultValue={initial?.venue ?? ""}
          className={inputClass}
        />
      </div>
    </ActionForm>
  );
}
