import { memo } from "react";

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

interface SeasonSelectorProps {
  seasons: number[];
  currentSeason: number;
  onSeasonChange: (season: string) => void;
}

export const SeasonSelector = memo(function SeasonSelector({
  seasons,
  currentSeason,
  onSeasonChange,
}: SeasonSelectorProps) {
  return (
    <div className="min-w-0">
      <Label htmlFor="season-select" className={fieldLabelClass}>
        Saison
      </Label>
      <NoSSR
        fallback={
          <div className={selectFallbackClass} aria-hidden="true">
            Chargement…
          </div>
        }
      >
        <Select value={currentSeason.toString()} onValueChange={onSeasonChange}>
          <SelectTrigger
            id="season-select"
            name="season"
            className={selectTriggerClass}
          >
            <SelectValue placeholder="Choisir une saison" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {seasons.map(season => (
              <SelectItem
                key={`season-${season}`}
                value={season.toString()}
                className={selectItemClass}
              >
                {season}–{season + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </NoSSR>
    </div>
  );
});
