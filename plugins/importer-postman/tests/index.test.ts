import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { pluginHookImport } from '../src';

let originalRandom = Math.random;

describe('importer-postman', () => {
  beforeEach(() => {
    let i = 0;
    // Psuedo-random number generator to ensure consistent ID generation
    Math.random = vi.fn(() => ((i++ * 1000) % 133) / 100);
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  const p = path.join(__dirname, 'fixtures');
  const fixtures = fs.readdirSync(p);

  for (const fixture of fixtures) {
    test('Imports ' + fixture, () => {
      const contents = fs.readFileSync(path.join(p, fixture), 'utf-8');
      const imported = pluginHookImport(contents);
      expect(imported).toEqual({
        resources: expect.objectContaining({
          folders: expect.arrayContaining([
            expect.objectContaining({
              name: 'Top Folder',
              workspaceId: 'wk_0G3J6M9QcT',
            }),
            expect.objectContaining({
              name: 'Nested Folder',
              workspaceId: 'wk_0G3J6M9QcT',
            }),
          ]),
          httpRequests: expect.arrayContaining([
            expect.objectContaining({
              name: 'Request 1',
              workspaceId: 'wk_0G3J6M9QcT',
              folderId: 'fl_vundefinedyundefinedBundefinedE0H3',
            }),
            expect.objectContaining({
              name: 'Request 2',
              workspaceId: 'wk_0G3J6M9QcT',
              folderId: 'fl_fWiZlundefinedoundefinedrundefined',
            }),
            expect.objectContaining({
              name: 'Request 3',
              workspaceId: 'wk_0G3J6M9QcT',
              folderId: null,
            }),
          ]),
          workspaces: [
            expect.objectContaining({
              name: 'New Collection',
            }),
          ],
        }),
      });
    });
  }
});
