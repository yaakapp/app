import jp from 'jsonpath';

export function pluginHookResponseFilter(ctx, filter, text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return;
  }
  const filtered = jp.query(parsed, filter);
  return { filtered: JSON.stringify(filtered, null, 2) };
}
