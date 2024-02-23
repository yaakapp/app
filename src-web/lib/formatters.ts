import xmlFormat from 'xml-formatter';

const INDENT = '  ';

export function tryFormatJson(text: string, pretty = true): string {
  if (text === '') return text;

  try {
    if (pretty) return JSON.stringify(JSON.parse(text), null, INDENT);
    else return JSON.stringify(JSON.parse(text));
  } catch (_) {
    return text;
  }
}

export function tryFormatXml(text: string): string {
  if (text === '') return text;

  try {
    return xmlFormat(text, { throwOnFailure: true, strictMode: false, indentation: INDENT });
  } catch (_) {
    return text;
  }
}
