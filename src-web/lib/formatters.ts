import xmlFormat from 'xml-formatter';

export function tryFormatJson(text: string, pretty = true): string {
  try {
    if (pretty) return JSON.stringify(JSON.parse(text), null, 2);
    else return JSON.stringify(JSON.parse(text));
  } catch (_) {
    return text;
  }
}

export function tryFormatXml(text: string): string {
  try {
    return xmlFormat(text, { throwOnFailure: true, strictMode: false });
  } catch (_) {
    return text;
  }
}
