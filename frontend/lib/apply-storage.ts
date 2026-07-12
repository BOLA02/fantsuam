// lib/apply-storage.ts
// NEW FILE

const STORAGE_KEY = 'mf_apply_progress';

interface SavedProgress {
  customerId: string;
  applicationId?: string;
  guarantorId?: string;
  firstName?: string;
  savedAt: string;
}

export function saveApplyProgress(data: Partial<SavedProgress> & { customerId: string }) {
  try {
    const existing = getApplyProgress();
    const merged: SavedProgress = {
      ...existing,
      ...data,
      savedAt: new Date().toISOString(),
    } as SavedProgress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage unavailable — silently no-op, resume just won't auto-detect
  }
}

export function getApplyProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearApplyProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}