import { memo } from "react";

import { Pool } from "../app/types";

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
  return (
    <div className="min-w-0" data-testid="pool-selector">
      <Label htmlFor="pool-select" className={fieldLabelClass}>
        Poule
      </Label>
      <NoSSR
        fallback={
          <div className={selectFallbackClass} aria-hidden="true">
            Chargement…
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
            className={selectTriggerClass}
          >
            <SelectValue
              placeholder={
                loading
                  ? ""
                  : pools.length === 0
                    ? "Aucune poule disponible"
                    : "Choisir une poule"
              }
            />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            {pools.map(pool => (
              <SelectItem
                key={`pool-${pool.id}`}
                value={pool.id.toString()}
                className={selectItemClass}
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
