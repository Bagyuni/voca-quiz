import type { Word } from './types';

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

  return { id: `w_${kanji}_${hira}`, day, kanji, hira, mean, ex, exKr };
}

export function parseTSV(text: string): Word[] {
  const lines = text.trim().split('\n');
  return lines
    .slice(1)
    .map((line) => {
      const [day, kanji, hira, mean, ex, exKr] = line.split('\t');
      if (!day || day === 'Day' || day === 'DAY') return null;
      return normalizeWord(
        day,
        kanji || '',
        hira || '',
        mean || '',
        ex || '',
        exKr || '',
      );
    })
    .filter((w): w is Word => w !== null);
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

const TSV_HEADER = 'Day\t한자\t히라가나\t뜻\t예문\t예문 해석';

export function toTSV(words: Word[]): string {
  const lines = words.map(
    (w) =>
      `${w.day}\t${w.kanji}\t${w.hira || '-'}\t${w.mean}\t${w.ex}\t${w.exKr}`,
  );
  return `${TSV_HEADER}\n${lines.join('\n')}\n`;
}

export async function loadTSV(): Promise<Word[]> {
  const res = await fetch('/words.tsv');
  if (!res.ok) throw new Error('Failed to load words.tsv');
  return parseTSV(await res.text());
}

export async function saveTSV(words: Word[]): Promise<void> {
  const res = await fetch('/words.tsv', {
    method: 'PUT',
    headers: { 'Content-Type': 'text/tab-separated-values' },
    body: toTSV(words),
  });
  if (!res.ok) throw new Error('Failed to save words.tsv');
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
