/**
 * Builds src/hanja-dict.json from myungcheol/hanja's hanja.txt.
 *
 * Source format (per line):
 *   한자=훈 음, [extra Korean notes,] english defs (strokes)
 * Sections like `[가]` group entries by 음.
 *
 * We extract the first comma-separated chunk after `=` as "훈 음",
 * splitting on whitespace: last token is 음, rest joined is 훈.
 * The same kanji can appear in multiple 음 sections — we collect all
 * (훈, 음) pairs per kanji and dedupe.
 *
 * Run with: bun run scripts/build-hanja-dict.ts
 */

const SOURCE_URL =
  'https://raw.githubusercontent.com/myungcheol/hanja/master/hanja.txt';
const OUTPUT_PATH = `${import.meta.dir}/../src/hanja-dict.json`;

type Entry = { hun: string; eum: string };

const text = await fetch(SOURCE_URL).then((r) => r.text());
const dict: Record<string, Entry[]> = {};

let entries = 0;
let chars = 0;
for (const line of text.split('\n')) {
  // Match `<single char>=<rest>`. CJK kanji are single BMP code points.
  const eq = line.indexOf('=');
  if (eq !== 1) continue;
  const kanji = line[0];
  // Skip non-CJK (section headers like `[가]` already filtered by eq===1)
  const code = kanji.codePointAt(0) ?? 0;
  const isCjk =
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff);
  if (!isCjk) continue;

  const rest = line.slice(eq + 1);
  const firstChunk = rest.split(',')[0]?.trim() ?? '';
  const tokens = firstChunk.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) continue;

  const eum = tokens[tokens.length - 1];
  const hun = tokens.slice(0, -1).join(' ');
  if (!hun || !eum) continue;

  const list = dict[kanji] ?? [];
  if (!list.some((e) => e.hun === hun && e.eum === eum)) {
    list.push({ hun, eum });
    entries++;
  }
  if (!dict[kanji]) {
    dict[kanji] = list;
    chars++;
  }
}

await Bun.write(OUTPUT_PATH, `${JSON.stringify(dict)}\n`);
console.log(`Wrote ${chars} kanji, ${entries} readings → ${OUTPUT_PATH}`);
