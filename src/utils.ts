/** Join class names, filtering out falsy values. */
export function cn(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(' ');
}

/** Fisher-Yates shuffle (returns new array). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
