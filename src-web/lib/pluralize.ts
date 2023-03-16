export function pluralize(word: string, count: number): string {
  if (count === 1) {
    return word;
  }
  return `${word}s`;
}
