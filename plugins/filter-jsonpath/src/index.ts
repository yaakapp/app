import jp from 'jsonpath';

export function pluginHookResponseFilter(
  _ctx: any,
  { filter, body }: { filter: string; body: string },
) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (e) {
    return;
  }
  const filtered = jp.query(parsed, filter);
  return JSON.stringify(filtered, null, 2);
}
