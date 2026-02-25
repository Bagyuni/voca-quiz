import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Word, WordId } from './types';
import { loadCache, loadFromSheet, saveCache } from './words';

const SHEET_ID = '1Moj1MM-s7BO_UBmvZNQIBXbxfWCUVWS0D77lX2rEPWg';
const GID = '734089437';
const STORAGE_KEY = 'jp_vocab_dynamic_hard_v3';

export interface StoreContextValue {
  allWords: Word[];
  currentDay: string;
  daysAvailable: string[];
  currentMode: 'study' | 'quiz';
  hardWords: Set<WordId>;
  loading: boolean;
  error: string | null;
  syncing: boolean;
  syncStatus: 'idle' | 'done' | 'fail';
  syncDiff: number;
  setMode: (mode: 'study' | 'quiz') => void;
  setDay: (day: string) => void;
  toggleHard: (id: WordId) => void;
  getFilteredWords: () => Word[];
  syncFromSheet: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [currentDay, setCurrentDay] = useState('all');
  const [currentMode, setCurrentMode] = useState<'study' | 'quiz'>('study');
  const [hardWords, setHardWords] = useState<Set<WordId>>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? new Set<WordId>(JSON.parse(data)) : new Set<WordId>();
    } catch {
      return new Set<WordId>();
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'done' | 'fail'>(
    'idle',
  );
  const [syncDiff, setSyncDiff] = useState(0);

  const daysAvailable = useMemo(() => {
    const days = Array.from(new Set(allWords.map((w) => w.day)));
    return days.sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (Number.isNaN(numA) || Number.isNaN(numB)) return a > b ? 1 : -1;
      return numA - numB;
    });
  }, [allWords]);

  const getFilteredWords = useCallback(() => {
    if (currentDay === 'all') return allWords;
    return allWords.filter((w) => String(w.day) === String(currentDay));
  }, [allWords, currentDay]);

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setAllWords(cached);
      setLoading(false);
    }

    setSyncing(true);
    loadFromSheet(SHEET_ID, GID)
      .then((words) => {
        setAllWords(words);
        saveCache(words);
        if (!cached) setLoading(false);
      })
      .catch(() => {
        if (!cached) setError('인터넷 연결을 확인해주세요.');
        if (!cached) setLoading(false);
      })
      .finally(() => setSyncing(false));
  }, []);

  const toggleHard = useCallback((id: WordId) => {
    setHardWords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const setMode = useCallback((mode: 'study' | 'quiz') => {
    setCurrentMode(mode);
  }, []);

  const setDay = useCallback((day: string) => {
    setCurrentDay(day);
  }, []);

  const syncFromSheet = useCallback(() => {
    setSyncing(true);
    setSyncStatus('idle');
    const prevCount = allWords.length;

    loadFromSheet(SHEET_ID, GID)
      .then((words) => {
        setAllWords(words);
        saveCache(words);
        setSyncDiff(words.length - prevCount);
        setSyncStatus('done');
      })
      .catch(() => {
        setSyncStatus('fail');
      })
      .finally(() => {
        setSyncing(false);
        setTimeout(() => setSyncStatus('idle'), 3000);
      });
  }, [allWords.length]);

  const value: StoreContextValue = {
    allWords,
    currentDay,
    daysAvailable,
    currentMode,
    hardWords,
    loading,
    error,
    syncing,
    syncStatus,
    syncDiff,
    setMode,
    setDay,
    toggleHard,
    getFilteredWords,
    syncFromSheet,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
