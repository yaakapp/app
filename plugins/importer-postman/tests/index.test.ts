import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Model } from '../../../src-web/lib/models';
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
      const folder0 = newId('folder');
      const folder1 = newId('folder');
      expect(imported).toEqual({
        resources: expect.objectContaining({
          workspaces: [
            expect.objectContaining({
              id: newId('workspace'),
              model: 'workspace',
              name: 'New Collection',
            }),
          ],
          folders: expect.arrayContaining([
            expect.objectContaining({
              id: folder0,
              model: 'folder',
              workspaceId: existingId('workspace'),
              name: 'Top Folder',
            }),
            expect.objectContaining({
              folderId: folder0,
              id: folder1,
              model: 'folder',
              workspaceId: existingId('workspace'),
              name: 'Nested Folder',
            }),
          ]),
          httpRequests: expect.arrayContaining([
            expect.objectContaining({
              id: newId('http_request'),
              model: 'http_request',
              name: 'Request 1',
              workspaceId: existingId('workspace'),
              folderId: folder1,
            }),
            expect.objectContaining({
              id: newId('http_request'),
              model: 'http_request',
              name: 'Request 2',
              workspaceId: existingId('workspace'),
              folderId: folder0,
            }),
            expect.objectContaining({
              id: newId('http_request'),
              model: 'http_request',
              name: 'Request 3',
              workspaceId: existingId('workspace'),
              folderId: null,
            }),
          ]),
        }),
      });
    });
  }
});

const idCount: Partial<Record<Model['model'], number>> = {};
function newId(model: Model['model']): string {
  idCount[model] = (idCount[model] ?? -1) + 1;
  return `GENERATE_ID::${model.toUpperCase()}_${idCount[model]}`;
}

function existingId(model: Model['model']): string {
  return `GENERATE_ID::${model.toUpperCase()}_${idCount[model] ?? 0}`;
}
