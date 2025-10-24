import { memo } from "react";

import { Pool } from "../app/types";

import { NoSSR } from "./NoSSR";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PoolSelectorProps {
  pools: Pool[];
  selectedPoolId: number;
  onPoolChange: (poolId: string) => void;
  loading: boolean;
}

export const PoolSelector = memo(function PoolSelector({
  pools,
  selectedPoolId,
  onPoolChange,
  loading,
}: PoolSelectorProps) {
  if (pools.length === 0) return null;

  return (
    <div className="mb-6 w-full sm:w-64" data-testid="pool-selector">
      <Label htmlFor="pool-select" className="text-white/80 mb-2 block">
        Poule
      </Label>
      <NoSSR
        fallback={
          <div className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md flex items-center px-3 text-white">
            Chargement...
          </div>
        }
      >
        <Select
          onValueChange={onPoolChange}
          value={selectedPoolId.toString()}
          disabled={loading}
        >
          <SelectTrigger
            id="pool-select"
            name="pool"
            className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <SelectValue placeholder="Sélectionner une pool" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {pools.map(pool => (
              <SelectItem
                key={`pool-${pool.id}`}
                value={pool.id.toString()}
                className="text-white hover:bg-gray-700 truncate"
              >
                {pool.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </NoSSR>
    </div>
  );
});
