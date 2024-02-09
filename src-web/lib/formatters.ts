export function tryFormatJson(text: string, pretty = true): string {
  try {
    if (pretty) return JSON.stringify(JSON.parse(text), null, 2);
    else return JSON.stringify(JSON.parse(text));
  } catch (_) {
    return text;
  }
}
