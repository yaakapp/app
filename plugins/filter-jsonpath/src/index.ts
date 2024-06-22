import jp from 'jsonpath';

export function pluginHookResponseFilter(_ctx: any, filter: string, text: string) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return;
  }
  const filtered = jp.query(parsed, filter);
  return { filtered: JSON.stringify(filtered, null, 2) };
}
