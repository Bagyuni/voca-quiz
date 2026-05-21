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
const QUIZ_LIMIT_KEY = 'jp_vocab_quiz_limit_v1';
const THEME_KEY = 'jp_vocab_theme_v1';
const FONT_KEY = 'jp_vocab_font_v1';

export type QuizLimit = number | 'all';
export type Theme = 'dark' | 'light';
export type Font = 'serif' | 'sans';

// 초기 렌더 전에 적용해 플래시 방지
try {
  const t = localStorage.getItem(THEME_KEY);
  const f = localStorage.getItem(FONT_KEY);
  document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.font = f === 'sans' ? 'sans' : 'serif';
} catch {}

export interface StoreContextValue {
  allWords: Word[];
  selectedDays: Set<string>;
  daysAvailable: string[];
  currentMode: 'study' | 'quiz' | 'table';
  hardWords: Set<WordId>;
  loading: boolean;
  error: string | null;
  syncing: boolean;
  syncStatus: 'idle' | 'done' | 'fail';
  syncDiff: number;
  quizLimit: QuizLimit;
  setQuizLimit: (limit: QuizLimit) => void;
  theme: Theme;
  font: Font;
  setTheme: (theme: Theme) => void;
  setFont: (font: Font) => void;
  setMode: (mode: 'study' | 'quiz' | 'table') => void;
  toggleDay: (day: string) => void;
  clearDays: () => void;
  toggleHard: (id: WordId) => void;
  getFilteredWords: () => Word[];
  syncFromSheet: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [selectedDays, setSelectedDaysState] = useState<Set<string>>(new Set());
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
  const [quizLimit, setQuizLimitState] = useState<QuizLimit>(() => {
    try {
      const raw = localStorage.getItem(QUIZ_LIMIT_KEY);
      if (raw === null) return 'all';
      if (raw === 'all') return 'all';
      const n = parseInt(raw, 10);
      return Number.isFinite(n) && n > 0 ? n : 'all';
    } catch {
      return 'all';
    }
  });

  const setQuizLimit = useCallback((limit: QuizLimit) => {
    setQuizLimitState(limit);
    try {
      localStorage.setItem(QUIZ_LIMIT_KEY, String(limit));
    } catch {}
  }, []);

  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [font, setFontState] = useState<Font>(() => {
    try {
      return localStorage.getItem(FONT_KEY) === 'sans' ? 'sans' : 'serif';
    } catch {
      return 'serif';
    }
  });

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }, []);

  const setFont = useCallback((next: Font) => {
    setFontState(next);
    document.documentElement.dataset.font = next;
    try {
      localStorage.setItem(FONT_KEY, next);
    } catch {}
  }, []);

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
      setSelectedDaysState(new Set([daysAvailable[daysAvailable.length - 1]]));
    }
  }, [daysAvailable]);

  const getFilteredWords = useCallback(() => {
    if (selectedDays.size === 0) return allWords;
    return allWords.filter((w) => selectedDays.has(String(w.day)));
  }, [allWords, selectedDays]);

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

  const toggleDay = useCallback((day: string) => {
    setSelectedDaysState((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const clearDays = useCallback(() => {
    setSelectedDaysState(new Set());
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
    selectedDays,
    daysAvailable,
    currentMode,
    hardWords,
    loading,
    error,
    syncing,
    syncStatus,
    syncDiff,
    quizLimit,
    setQuizLimit,
    theme,
    font,
    setTheme,
    setFont,
    setMode,
    toggleDay,
    clearDays,
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
