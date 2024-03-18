import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';
import { pluginHookImport } from '../src';

let originalRandom = Math.random;

describe('importer-postman', () => {
  beforeEach(() => {
    let i = 0;
    const mocked = vi.fn(() => ((i++ * 1000) % 133) / 100);
    Math.random = mocked;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  const p = path.join(__dirname, 'fixtures');
  const fixtures = fs.readdirSync(p);

  console.log('FIXTURES', fixtures);
  for (const fixture of fixtures) {
    test('Imports ' + fixture, () => {
      const contents = fs.readFileSync(path.join(p, fixture), 'utf-8');
      const imported = pluginHookImport(contents);
      expect(imported).toEqual({
        resources: {
          environments: [],
          requests: [],
        },
      });
    });
  }
});
