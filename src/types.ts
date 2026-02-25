declare const __wordId: unique symbol;

/** Branded numeric hash — prevents accidental use of raw numbers as word IDs. */
export type WordId = number & { readonly [__wordId]: true };

/** FNV-1a 32-bit hash of (day, kanji, hira, mean). */
export function wordId(
  day: string,
  kanji: string,
  hira: string,
  mean: string,
): WordId {
  const raw = `${day}\0${kanji}\0${hira}\0${mean}`;
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
