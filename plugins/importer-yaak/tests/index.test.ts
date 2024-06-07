import { describe, expect, test } from 'vitest';
import { pluginHookImport } from '../src';

const ctx = {};

describe('importer-yaak', () => {
  test('Skips invalid imports', () => {
    expect(pluginHookImport(ctx, 'not JSON')).toBeUndefined();
    expect(pluginHookImport(ctx, '[]')).toBeUndefined();
    expect(pluginHookImport(ctx, JSON.stringify({ resources: {} }))).toBeUndefined();
  });

  test('converts schema 1 to 2', () => {
    const imported = pluginHookImport(
      ctx,
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
