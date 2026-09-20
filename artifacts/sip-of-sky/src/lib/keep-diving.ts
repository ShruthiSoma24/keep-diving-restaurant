export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const formatDateLong = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export type LocalReservation = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  partySize: number;
  status: "pending" | "confirmed" | "cancelled";
  tableName?: string;
  preOrder?: string;
  createdAt: string;
};

export const RESERVATION_STORAGE_KEY = "keep-diving-reservations";

export function readLocalReservations(): LocalReservation[] {
  try {
    return JSON.parse(localStorage.getItem(RESERVATION_STORAGE_KEY) || "[]") as LocalReservation[];
  } catch {
    return [];
  }
}

export function saveLocalReservation(reservation: LocalReservation) {
  const next = [reservation, ...readLocalReservations()];
  localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(next));
  return next;
}