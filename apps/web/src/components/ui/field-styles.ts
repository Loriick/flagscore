/** Styles partagés des champs de sélection (direction « Score final »). */

export const fieldLabelClass =
  "mb-1.5 block text-xs font-semibold tracking-wide text-stone";

export const selectTriggerClass =
  "h-11 w-full cursor-pointer rounded-[4px] border-line bg-ink-raised px-3 text-left text-sm font-medium text-chalk transition-colors hover:bg-ink-hover data-[placeholder]:text-stone focus-visible:ring-0 [&_svg]:text-stone [&>span]:truncate";

export const selectContentClass = "border-line bg-ink-raised text-chalk";

export const selectItemClass =
  "min-h-10 cursor-pointer text-chalk focus:bg-ink-hover focus:text-chalk data-[state=checked]:text-flag";

export const selectFallbackClass =
  "flex h-11 w-full items-center rounded-[4px] border border-line bg-ink-raised px-3 text-sm text-stone";
