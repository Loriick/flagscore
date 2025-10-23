import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Championship } from "../app/types";

interface ChampionshipSelectorProps {
  championships: Championship[];
  selectedChampionshipId: number;
  onChampionshipChange: (championshipId: string) => void;
  loading: boolean;
}

export function ChampionshipSelector({
  championships,
  selectedChampionshipId,
  onChampionshipChange,
  loading,
}: ChampionshipSelectorProps) {
  return (
    <div className="flex-1 space-y-2">
      <Label htmlFor="championship-select" className="text-white/80">
        Compétition
      </Label>
      <Select
        value={selectedChampionshipId.toString()}
        onValueChange={onChampionshipChange}
        disabled={loading || championships.length === 0}
      >
        <SelectTrigger
          id="championship-select"
          name="championship"
          className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <SelectValue
            placeholder={
              loading ? "Chargement..." : "Sélectionner une compétition"
            }
            className="truncate"
          />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {championships.map((championship) => (
            <SelectItem
              key={championship.id}
              value={championship.id.toString()}
              className="text-white hover:bg-gray-700 truncate"
            >
              {championship.label.length > 30
                ? `${championship.label.substring(0, 30)}...`
                : championship.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
