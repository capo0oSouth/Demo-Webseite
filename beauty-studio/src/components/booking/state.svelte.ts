import {
  categories,
  treatmentById,
  treatments,
  type CategoryId,
  type Treatment,
} from '../../data/services';
import type { StaffId } from '../../data/team';
import { computePrice, defaultSelection, normalize, type Selection } from '../../lib/booking';
import { fromISO, slotsFor } from '../../lib/availability';
import { validateCustomer } from '../../lib/validation';

export const steps = [
  { id: 'kategorie', label: 'Kategorie', title: 'Worauf freust du dich?' },
  { id: 'behandlung', label: 'Behandlung', title: 'Wähle deine Behandlung' },
  { id: 'gestalten', label: 'Gestalten', title: 'Gestalte deinen Look' },
  { id: 'team', label: 'Artist', title: 'Wer soll dich verwöhnen?' },
  { id: 'termin', label: 'Termin', title: 'Wann passt es dir?' },
  { id: 'angaben', label: 'Angaben', title: 'Deine Kontaktdaten' },
  { id: 'uebersicht', label: 'Übersicht', title: 'Alles richtig so?' },
] as const;

export type StaffChoice = StaffId | 'any';

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  visit: 'new' | 'returning';
  notes: string;
  reminder: boolean;
  terms: boolean;
}

export class BookingState {
  step = $state(0);
  category = $state<CategoryId | null>(null);
  treatmentId = $state<string | null>(null);
  selection = $state<Selection>({});
  addons = $state<string[]>([]);
  staff = $state<StaffChoice>('any');
  date = $state<string | null>(null);
  time = $state<string | null>(null);
  assignedStaff = $state<StaffId | null>(null);
  customer = $state<CustomerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    visit: 'new',
    notes: '',
    reminder: true,
    terms: false,
  });
  notice = $state<string | null>(null);
  /** Hinweis im Terminschritt, wenn eine gewählte Uhrzeit wegen neuer Dauer entfernt wurde. */
  slotNotice = $state<string | null>(null);
  confirmed = $state<{ code: string } | null>(null);

  treatment: Treatment | null = $derived(this.treatmentId ? treatmentById[this.treatmentId] : null);
  categoryInfo = $derived(categories.find((c) => c.id === this.category) ?? null);
  errors = $derived(validateCustomer(this.customer));
  price = $derived(
    this.treatment ? computePrice(this.treatment, this.selection, this.addons) : null,
  );
  staffPool: StaffId[] = $derived(
    this.treatment ? (this.staff === 'any' ? this.treatment.staff : [this.staff]) : [],
  );

  chooseCategory(id: CategoryId) {
    if (this.category !== id) {
      this.category = id;
      this.treatmentId = null;
      this.selection = {};
      this.addons = [];
      this.clearSlot();
    }
  }

  chooseTreatment(id: string) {
    if (this.treatmentId === id) return;
    const t = treatmentById[id];
    if (!t) return;
    this.category = t.category;
    this.treatmentId = id;
    this.selection = defaultSelection(t);
    this.addons = [];
    if (this.staff !== 'any' && !t.staff.includes(this.staff)) this.staff = 'any';
    this.revalidateSlot();
  }

  choose(groupId: string, choiceId: string) {
    if (!this.treatment) return;
    const { selection, adjustments } = normalize(
      this.treatment,
      { ...this.selection, [groupId]: choiceId },
      groupId,
    );
    this.selection = selection;
    this.notice = adjustments[0] ?? null;
    this.revalidateSlot();
  }

  toggleAddon(id: string) {
    this.addons = this.addons.includes(id)
      ? this.addons.filter((a) => a !== id)
      : [...this.addons, id];
    this.revalidateSlot();
  }

  chooseStaff(id: StaffChoice) {
    this.staff = id;
    this.revalidateSlot();
  }

  clearSlot() {
    this.date = null;
    this.time = null;
    this.assignedStaff = null;
  }

  /** Prüft nach jeder Änderung, ob der gewählte Termin noch zur Dauer passt. */
  revalidateSlot() {
    if (!this.date || !this.time || !this.price) return;
    const slots = slotsFor(this.staffPool, fromISO(this.date), this.price.minutes);
    const slot = slots.find((s) => s.time === this.time);
    if (!slot) {
      const old = this.time;
      this.time = null;
      this.assignedStaff = null;
      this.notice = 'Die Behandlungsdauer hat sich geändert – bitte wähle deine Uhrzeit neu.';
      this.slotNotice = `Deine bisherige Zeit (${old} Uhr) passt nicht mehr zur neuen Behandlungsdauer. Bitte wähle eine neue Uhrzeit.`;
    } else if (this.assignedStaff && !slot.staff.includes(this.assignedStaff)) {
      this.assignedStaff = slot.staff[0];
    }
  }

  canContinue(step = this.step): boolean {
    switch (step) {
      case 0:
        return !!this.category;
      case 1:
        return !!this.treatment;
      case 2:
        return !!this.treatment;
      case 3:
        return !!this.staff;
      case 4:
        return !!this.date && !!this.time;
      case 5:
        return Object.keys(this.errors).length === 0;
      default:
        return true;
    }
  }

  /** Höchster Schritt, der aktuell erreichbar ist. */
  furthest = $derived.by(() => {
    let s = 0;
    while (s < steps.length - 1 && this.canContinue(s)) s++;
    return s;
  });

  reset() {
    this.step = 0;
    this.category = null;
    this.treatmentId = null;
    this.selection = {};
    this.addons = [];
    this.staff = 'any';
    this.clearSlot();
    this.customer = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      visit: 'new',
      notes: '',
      reminder: true,
      terms: false,
    };
    this.notice = null;
    this.slotNotice = null;
    this.confirmed = null;
  }
}

export const allTreatments = treatments;
