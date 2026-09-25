import type { Addon, Choice, OptionGroup, Treatment } from '../data/services';

export type Selection = Record<string, string>;

export interface PriceLine {
  label: string;
  value: string;
  price: number;
}

export interface PriceResult {
  total: number;
  minutes: number;
  lines: PriceLine[];
  addons: Addon[];
}

const matches = (rule: Record<string, string[]> | undefined, sel: Selection) =>
  !rule || Object.entries(rule).every(([key, allowed]) => allowed.includes(sel[key]));

export const isGroupVisible = (group: OptionGroup, sel: Selection) => matches(group.showIf, sel);

export const isChoiceAvailable = (choice: Choice, sel: Selection) => matches(choice.requires, sel);

export const visibleGroups = (t: Treatment, sel: Selection) =>
  t.groups.filter((g) => isGroupVisible(g, sel));

/** Standardauswahl einer Behandlung (inkl. fester Presets für die Visualisierung). */
export function defaultSelection(t: Treatment): Selection {
  const sel: Selection = { ...(t.preset ?? {}) };
  for (const g of t.groups) sel[g.id] = g.default;
  return normalize(t, sel).selection;
}

/**
 * Sorgt dafür, dass alle gewählten Optionen miteinander kompatibel sind. Ist eine Wahl nicht
 * mehr möglich (z. B. Stiletto bei kurzer Länge), wird die nächstmögliche gewählt.
 */
export function normalize(t: Treatment, input: Selection, changedGroup?: string) {
  const selection = { ...input };
  const adjustments: string[] = [];
  for (let pass = 0; pass < 2; pass++) {
    for (const g of t.groups) {
      const current = g.choices.find((c) => c.id === selection[g.id]);
      if (current && isChoiceAvailable(current, selection)) continue;
      if (current && changedGroup === g.id) {
        // Die Nutzerin hat genau diese Option gewählt: stattdessen die Abhängigkeit anpassen.
        for (const [depId, allowed] of Object.entries(current.requires ?? {})) {
          const dep = t.groups.find((x) => x.id === depId);
          const next = dep?.choices.find((c) => allowed.includes(c.id));
          if (dep && next) {
            selection[depId] = next.id;
            adjustments.push(
              `${dep.label} auf «${next.label}» angepasst, damit «${current.label}» möglich ist.`,
            );
          }
        }
        continue;
      }
      const preferred = g.choices.find((c) => c.id === current?.fallback);
      const fallback =
        preferred && isChoiceAvailable(preferred, selection)
          ? preferred
          : g.choices.find((c) => isChoiceAvailable(c, selection));
      if (fallback) {
        if (current)
          adjustments.push(
            `${g.label} auf «${fallback.label}» angepasst – «${current.label}» ist mit deiner Auswahl nicht kombinierbar.`,
          );
        selection[g.id] = fallback.id;
      }
    }
  }
  return { selection, adjustments };
}

export function computePrice(t: Treatment, sel: Selection, addonIds: string[] = []): PriceResult {
  let total = t.price;
  let minutes = t.minutes;
  const lines: PriceLine[] = [];
  for (const g of visibleGroups(t, sel)) {
    const c = g.choices.find((x) => x.id === sel[g.id]);
    if (!c) continue;
    total += c.price ?? 0;
    minutes += c.minutes ?? 0;
    lines.push({ label: g.label, value: c.label, price: c.price ?? 0 });
  }
  const addons = t.addons.filter((a) => addonIds.includes(a.id));
  for (const a of addons) {
    total += a.price;
    minutes += a.minutes;
  }
  return { total, minutes, lines, addons };
}

export const choiceLabel = (t: Treatment, groupId: string, sel: Selection) =>
  t.groups.find((g) => g.id === groupId)?.choices.find((c) => c.id === sel[groupId])?.label;

export const formatCHF = (value: number) => (value === 0 ? 'inklusive' : `CHF ${value}.–`);

export const formatPrice = (value: number) => `CHF ${value}.–`;

export const formatDelta = (value: number) => (value > 0 ? `+ ${value}.–` : 'inkl.');

export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} Min.`;
  return m ? `${h} Std. ${m} Min.` : `${h} Std.`;
}
