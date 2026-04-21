import dict from './hanja-dict.json';

export interface HanjaReading {
  hun: string;
  eum: string;
}

const data = dict as Record<string, HanjaReading[]>;

export function lookupHanja(char: string): HanjaReading[] | null {
  return data[char] ?? null;
}
