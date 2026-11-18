import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const labelClass =
  "mb-1.5 block text-xs font-semibold tracking-wide text-stone";

export const inputClass =
  "h-11 w-full rounded-[4px] border border-line bg-ink-raised px-3 text-base text-chalk placeholder:text-stone/70 focus:border-flag focus:outline-none disabled:opacity-60";

export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-[4px] bg-flag px-4 text-sm font-bold text-ink transition-colors hover:bg-flag-deep disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-[4px] border border-line px-4 text-sm font-semibold text-chalk transition-colors hover:border-chalk disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-[4px] border border-alert/60 px-4 text-sm font-semibold text-alert transition-colors hover:border-alert disabled:opacity-50";

export const pageTitleClass =
  "font-score text-4xl leading-none font-black text-chalk sm:text-5xl";

/** Bandeau jaune des sections, comme la barre « Score final ». */
export const sectionBarClass =
  "font-score rounded-[4px] bg-flag px-4 py-2 text-xl font-black text-ink";
