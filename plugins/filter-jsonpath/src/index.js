import jp from 'jsonpath';

export function pluginHookResponseFilter({ text, filter }) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return;
  }
  const filtered = jp.query(parsed, filter);

  return { filtered };
}
