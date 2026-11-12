import { memo } from "react";

import { Championship } from "../app/types";

import { NoSSR } from "./NoSSR";

import {
  fieldLabelClass,
  selectContentClass,
  selectFallbackClass,
  selectItemClass,
  selectTriggerClass,
} from "@/components/ui/field-styles";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChampionshipSelectorProps {
  championships: Championship[];
  selectedChampionshipId: number;
  onChampionshipChange: (championshipId: string) => void;
  loading: boolean;
}

export const ChampionshipSelector = memo(function ChampionshipSelector({
  championships,
  selectedChampionshipId,
  onChampionshipChange,
  loading,
}: ChampionshipSelectorProps) {
  return (
    <div className="min-w-0">
      <Label htmlFor="championship-select" className={fieldLabelClass}>
        Compétition
      </Label>
      <NoSSR
        fallback={
          <div className={selectFallbackClass} aria-hidden="true">
            Chargement…
          </div>
        }
      >
        <Select
          value={selectedChampionshipId.toString()}
          onValueChange={onChampionshipChange}
          disabled={loading || championships.length === 0}
        >
          <SelectTrigger
            id="championship-select"
            name="championship"
            className={selectTriggerClass}
          >
            <SelectValue placeholder="Choisir une compétition" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {championships.map(championship => (
              <SelectItem
                key={`championship-${championship.id}`}
                value={championship.id.toString()}
                className={selectItemClass}
              >
                {championship.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </NoSSR>
    </div>
  );
});
