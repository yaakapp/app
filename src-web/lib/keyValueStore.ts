import type { KeyValue } from './models';
import { invokeCmd } from './tauri';

export async function setKeyValue<T>({
  namespace = 'global',
  key,
  value,
}: {
  namespace?: string;
  key: string | string[];
  value: T;
}): Promise<void> {
  await invokeCmd('cmd_set_key_value', {
    namespace,
    key: buildKeyValueKey(key),
    value: JSON.stringify(value),
  });
}

export async function getKeyValue<T>({
  namespace = 'global',
  key,
  fallback,
}: {
  namespace?: string;
  key: string | string[];
  fallback: T;
}) {
  const kv = (await invokeCmd('cmd_get_key_value', {
    namespace,
    key: buildKeyValueKey(key),
  })) as KeyValue | null;
  return extractKeyValueOrFallback(kv, fallback);
}

function extractKeyValue<T>(kv: KeyValue | null): T | undefined {
  if (kv === null) return undefined;
  try {
    return JSON.parse(kv.value) as T;
  } catch (err) {
    return undefined;
  }
}

function extractKeyValueOrFallback<T>(kv: KeyValue | null, fallback: T): T {
  const v = extractKeyValue<T>(kv);
  if (v === undefined) return fallback;
  return v;
}

export function buildKeyValueKey(key: string | string[]): string {
  if (typeof key === 'string') return key;
  return key.join('::');
}
