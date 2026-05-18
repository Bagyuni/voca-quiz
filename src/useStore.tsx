import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Word, WordId } from './types';
import { loadCache, loadFromSheet, saveCache } from './words';

const SHEET_ID = '1Moj1MM-s7BO_UBmvZNQIBXbxfWCUVWS0D77lX2rEPWg';
const GID = '734089437';
const STORAGE_KEY = 'jp_vocab_dynamic_hard_v4';

export interface DayRange {
  start: string;
  end: string;
}

export interface StoreContextValue {
  allWords: Word[];
  currentDay: string;
  dayRange: DayRange | null;
  daysAvailable: string[];
  currentMode: 'study' | 'quiz' | 'table';
  hardWords: Set<WordId>;
  loading: boolean;
  error: string | null;
  syncing: boolean;
  syncStatus: 'idle' | 'done' | 'fail';
  syncDiff: number;
  setMode: (mode: 'study' | 'quiz' | 'table') => void;
  setDay: (day: string) => void;
  setDayRange: (range: DayRange) => void;
  toggleHard: (id: WordId) => void;
  getFilteredWords: () => Word[];
  syncFromSheet: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [currentDay, setCurrentDay] = useState('all');
  const [dayRange, setDayRangeState] = useState<DayRange | null>(null);
  const [currentMode, setCurrentMode] = useState<'study' | 'quiz' | 'table'>(
    'study',
  );
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

  // 최초 로드 시에만 마지막 day를 기본 선택
  const initialDaySet = useRef(false);
  useEffect(() => {
    if (!initialDaySet.current && daysAvailable.length > 0) {
      initialDaySet.current = true;
      setCurrentDay(daysAvailable[daysAvailable.length - 1]);
    }
  }, [daysAvailable]);

  const getFilteredWords = useCallback(() => {
    if (currentDay === 'all') return allWords;
    if (currentDay === 'range' && dayRange) {
      const startIdx = daysAvailable.indexOf(dayRange.start);
      const endIdx = daysAvailable.indexOf(dayRange.end);
      if (startIdx === -1 || endIdx === -1) return allWords;
      const [lo, hi] =
        startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
      const included = new Set(daysAvailable.slice(lo, hi + 1));
      return allWords.filter((w) => included.has(String(w.day)));
    }
    return allWords.filter((w) => String(w.day) === String(currentDay));
  }, [allWords, currentDay, dayRange, daysAvailable]);

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

  const setMode = useCallback((mode: 'study' | 'quiz' | 'table') => {
    setCurrentMode(mode);
  }, []);

  const setDay = useCallback((day: string) => {
    setCurrentDay(day);
  }, []);

  const setDayRange = useCallback((range: DayRange) => {
    setDayRangeState(range);
    setCurrentDay('range');
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
    dayRange,
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
    setDayRange,
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
