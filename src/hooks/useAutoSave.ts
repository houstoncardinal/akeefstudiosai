import { useEffect, useCallback, useState, useRef } from 'react';

const STORAGE_KEY = 'akeef_studio_draft';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

export interface DraftData<T> {
  config: T;
  savedAt: number;
  fileName?: string;
}

interface UseAutoSaveOptions<T> {
  enabled?: boolean;
  data: T;
  fileName?: string;
  onRestore?: (data: T) => void;
}

export function useAutoSave<T>({ enabled = true, data, fileName, onRestore }: UseAutoSaveOptions<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ savedAt: number; fileName?: string } | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const lastSaveRef = useRef<number>(0);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DraftData<T> = JSON.parse(saved);
        // Only show recovery if draft is less than 24 hours old
        const ageMs = Date.now() - parsed.savedAt;
        if (ageMs < 24 * 60 * 60 * 1000) {
          setHasDraft(true);
          setDraftInfo({ savedAt: parsed.savedAt, fileName: parsed.fileName });
          setShowRecoveryBanner(true);
        } else {
          // Clear old draft
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Auto-save at interval
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      saveDraft();
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [enabled, data, fileName]);

  const saveDraft = useCallback(() => {
    try {
      const draft: DraftData<T> = {
        config: data,
        savedAt: Date.now(),
        fileName,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      lastSaveRef.current = Date.now();
    } catch (e) {
      console.warn('Failed to save draft:', e);
    }
  }, [data, fileName]);

  const restoreDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DraftData<T> = JSON.parse(saved);
        onRestore?.(parsed.config);
        setShowRecoveryBanner(false);
      }
    } catch {
      // Ignore
    }
  }, [onRestore]);

  const discardDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
    setDraftInfo(null);
    setShowRecoveryBanner(false);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
    setDraftInfo(null);
  }, []);

  return {
    hasDraft,
    draftInfo,
    showRecoveryBanner,
    saveDraft,
    restoreDraft,
    discardDraft,
    clearDraft,
    dismissBanner: () => setShowRecoveryBanner(false),
  };
}

export function formatDraftAge(savedAt: number): string {
  const ageMs = Date.now() - savedAt;
  const mins = Math.floor(ageMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'yesterday';
}
