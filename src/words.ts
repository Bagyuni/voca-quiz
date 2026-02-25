import { type Word, wordId } from './types';

const WORDS_CACHE_KEY = 'jp_vocab_words_cache';

function normalizeWord(
  day: string,
  kanjiRaw: string,
  hiraRaw: string,
  mean: string,
  ex: string,
  exKr: string,
): Word {
  let kanji = kanjiRaw;
  let hira = hiraRaw;

  if (kanji === '-' || kanji === '') {
    kanji = hira;
    hira = '';
  } else if (hira === '-') {
    hira = '';
  }

  return {
    id: wordId(day, kanji, hira, mean),
    day,
    kanji,
    hira,
    mean,
    ex,
    exKr,
  };
}

interface GvizCell {
  v: string | number | null;
}
interface GvizRow {
  c: (GvizCell | null)[];
}
interface GvizResponse {
  table: { rows: GvizRow[] };
}

export function parseSheetResponse(response: GvizResponse): Word[] {
  const rows = response.table.rows;
  const words: Word[] = [];

  for (const row of rows) {
    const c = row.c;
    if (!c || !c[0]) continue;

    const dayVal = c[0].v != null ? String(c[0].v) : '';
    if (dayVal === 'Day' || dayVal === 'DAY' || dayVal === '') continue;

    const cell = (i: number) => (c[i] && c[i].v != null ? String(c[i].v) : '');
    words.push(
      normalizeWord(dayVal, cell(1), cell(2), cell(3), cell(4), cell(5)),
    );
  }

  return words;
}

export function loadCache(): Word[] | null {
  try {
    const data = localStorage.getItem(WORDS_CACHE_KEY);
    if (!data) return null;
    const words = JSON.parse(data) as Word[];
    return words.length > 0 ? words : null;
  } catch {
    return null;
  }
}

export function saveCache(words: Word[]): void {
  localStorage.setItem(WORDS_CACHE_KEY, JSON.stringify(words));
}

export function loadFromSheet(sheetId: string, gid: string): Promise<Word[]> {
  return new Promise((resolve, reject) => {
    const win = window as unknown as Record<string, unknown>;
    const callbackName = `_sheetCb_${Date.now()}`;

    win[callbackName] = (response: unknown) => {
      delete win[callbackName];
      try {
        resolve(parseSheetResponse(response as GvizResponse));
      } catch (err) {
        reject(err);
      }
    };

    const script = document.createElement('script');
    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json;responseHandler:${callbackName}&gid=${gid}`;
    script.onerror = () => {
      delete win[callbackName];
      reject(new Error('Failed to load from Google Sheets'));
    };
    document.body.appendChild(script);
  });
}
