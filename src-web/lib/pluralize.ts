export function pluralize(word: string, count: number): string {
  if (count === 1) {
    return word;
  }
  return `${word}s`;
}

export function count(word: string, count: number): string {
  return `${count} ${pluralize(word, count)}`;
}
