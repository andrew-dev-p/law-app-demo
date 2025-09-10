export type ReminderStatus = "pending" | "sent" | "completed" | "failed" | "canceled";

export type IncidentReminders = {
  enabled: boolean;
  createdAt: number; // ms epoch
  sms: { scheduledAt: number; sentAt?: number; status: ReminderStatus };
  call: { scheduledAt: number; completedAt?: number; status: ReminderStatus };
  canceledAt?: number;
  completedAt?: number;
  lastUpdated: number;
};

const KEY = "incident-reminders";

// Demo delays (ms)
const SMS_DELAY = 3_000; // 3s
const CALL_DELAY = 6_000; // 6s

export function getIncidentReminders(): IncidentReminders | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as IncidentReminders) : null;
  } catch {
    return null;
  }
}

export function setIncidentReminders(v: IncidentReminders) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify({ ...v, lastUpdated: Date.now() }));
}

export function clearIncidentReminders() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function ensureIncidentRemindersScheduled(): IncidentReminders | null {
  if (typeof window === "undefined") return null;
  const existing = getIncidentReminders();
  if (existing && existing.enabled) return materializeIncidentReminders(existing);
  const now = Date.now();
  const next: IncidentReminders = {
    enabled: true,
    createdAt: now,
    sms: { scheduledAt: now + SMS_DELAY, status: "pending" },
    call: { scheduledAt: now + CALL_DELAY, status: "pending" },
    lastUpdated: now,
  } as IncidentReminders;
  setIncidentReminders(next);
  return next;
}

export function cancelIncidentReminders(reason: "canceled" | "completed" = "completed") {
  const r = getIncidentReminders();
  if (!r) return;
  const now = Date.now();
  const updated: IncidentReminders = {
    ...r,
    enabled: false,
    canceledAt: reason === "canceled" ? now : r.canceledAt,
    completedAt: reason === "completed" ? now : r.completedAt,
    sms: { ...r.sms, status: reason },
    call: { ...r.call, status: reason },
    lastUpdated: now,
  };
  setIncidentReminders(updated);
}

export function materializeIncidentReminders(r?: IncidentReminders | null): IncidentReminders | null {
  const curr = r ?? getIncidentReminders();
  if (!curr) return null;
  const now = Date.now();
  let changed = false;
  const next: IncidentReminders = { ...curr };
  if (next.enabled && next.sms.status === "pending" && now >= next.sms.scheduledAt) {
    next.sms = { ...next.sms, status: "sent", sentAt: now };
    changed = true;
  }
  if (next.enabled && next.call.status === "pending" && now >= next.call.scheduledAt) {
    next.call = { ...next.call, status: "completed", completedAt: now };
    changed = true;
  }
  if (changed) setIncidentReminders(next);
  return next;
}
