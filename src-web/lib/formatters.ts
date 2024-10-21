import xmlFormat from 'xml-formatter';
import { invokeCmd } from './tauri';

const INDENT = '  ';

export async function tryFormatJson(text: string): Promise<string> {
  if (text === '') return text;
  return invokeCmd('cmd_format_json', { text });
}

export async function tryFormatXml(text: string): Promise<string> {
  if (text === '') return text;

  try {
    return xmlFormat(text, { throwOnFailure: true, strictMode: false, indentation: INDENT });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return text;
  }
}
