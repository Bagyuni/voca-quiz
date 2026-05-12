declare const __wordId: unique symbol;

/** Branded numeric hash — prevents accidental use of raw numbers as word IDs. */
export type WordId = number & { readonly [__wordId]: true };

/** FNV-1a 32-bit hash of (kanji, hira) — stable across edits to day/mean/ex. */
export function wordId(kanji: string, hira: string): WordId {
  const raw = `${kanji}\0${hira}`;
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }
  return (h >>> 0) as WordId;
}

export interface Word {
  id: WordId;
  day: string;
  kanji: string;
  hira: string;
  mean: string;
  ex: string;
  exKr: string;
}
