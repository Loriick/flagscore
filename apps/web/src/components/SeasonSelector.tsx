import { memo } from "react";

import { NoSSR } from "./NoSSR";

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
    <div className="w-24 sm:w-36 space-y-2">
      <Label htmlFor="season-select" className="text-white/80">
        Saison
      </Label>
      <NoSSR
        fallback={
          <div className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md flex items-center px-3 text-white">
            Chargement...
          </div>
        }
      >
        <Select value={currentSeason.toString()} onValueChange={onSeasonChange}>
          <SelectTrigger
            id="season-select"
            name="season"
            className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <SelectValue placeholder="Sélectionner une saison" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {seasons.map(season => (
              <SelectItem
                key={`season-${season}`}
                value={season.toString()}
                className="text-white hover:bg-gray-700"
              >
                {season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </NoSSR>
    </div>
  );
});
