import { useState, useCallback, useEffect } from 'react';

export interface ExportRecord {
  id: string;
  filename: string;
  formatId: string;
  formatName: string;
  extension: string;
  style: string;
  model: string;
  colorGrade: string;
  sizeBytes: number;
  createdAt: string;
  /** Base-64 encoded content – only stored for project files (XML/EDL etc.), not video blobs */
  content?: string;
}

const STORAGE_KEY = 'akeef_export_history';
const MAX_RECORDS = 50;

function loadRecords(): ExportRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExportRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: ExportRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
}

export function useExportHistory() {
  const [records, setRecords] = useState<ExportRecord[]>(loadRecords);

  // Sync if another tab mutates localStorage
  useEffect(() => {
    const handle = () => setRecords(loadRecords());
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, []);

  const addExport = useCallback((record: Omit<ExportRecord, 'id' | 'createdAt'>) => {
    const entry: ExportRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setRecords(prev => {
      const next = [entry, ...prev].slice(0, MAX_RECORDS);
      saveRecords(next);
      return next;
    });
    return entry;
  }, []);

  const removeExport = useCallback((id: string) => {
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      saveRecords(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const redownload = useCallback((record: ExportRecord) => {
    if (!record.content) return;
    const decoded = atob(record.content);
    const blob = new Blob([decoded], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { records, addExport, removeExport, clearAll, redownload };
}
