import { describe, expect, test } from 'vitest';
import { pluginHookImport } from '../src';

describe('importer-yaak', () => {
  test('Skips invalid imports', () => {
    expect(pluginHookImport('not JSON')).toBeUndefined();
    expect(pluginHookImport('[]')).toBeUndefined();
    expect(pluginHookImport(JSON.stringify({ resources: {} }))).toBeUndefined();
  });

  test('converts schema 1 to 2', () => {
    const imported = pluginHookImport(
      JSON.stringify({
        yaakSchema: 1,
        resources: {
          requests: [],
        },
      }),
    );

    expect(imported).toEqual(
      expect.objectContaining({
        resources: {
          httpRequests: [],
        },
      }),
    );
  });
});
