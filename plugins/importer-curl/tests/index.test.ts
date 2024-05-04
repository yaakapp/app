import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpRequest } from '../../../src-web/lib/models';
import { pluginHookImport } from '../src';

let originalRandom = Math.random;

describe('importer-curl', () => {
  beforeEach(() => {
    let i = 0;
    // Psuedo-random number generator to ensure consistent ID generation
    Math.random = vi.fn(() => ((i++ * 1000) % 133) / 100);
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  test('Imports basic GET', () => {
    expect(pluginHookImport('curl https://yaak.app')).toEqual(
      baseRequest({
        url: 'https://yaak.app',
      }),
    );
  });

  test('Imports simple POST', () => {
    expect(pluginHookImport('curl -X POST -d "data" https://yaak.app')).toEqual(
      baseRequest({
        method: 'POST',
        url: 'https://yaak.app',
        bodyType: 'text/plain',
        body: {
          text: 'data',
        },
      }),
    );
  });

  test('Imports form data', () => {
    expect(
      pluginHookImport('curl -X POST -F "a=aaa" -F b=bbb" -F f=@filepath https://yaak.app'),
    ).toEqual(
      baseRequest({
        method: 'POST',
        url: 'https://yaak.app',
        bodyType: 'multipart/form-data',
        body: {
          form: [
            { enabled: true, name: 'a', value: 'aaa' },
            { enabled: true, name: 'b', value: 'bbb' },
            { enabled: true, name: 'f', file: 'filepath' },
          ],
        },
      }),
    );
  });
});

function baseRequest(mergeWith: Partial<HttpRequest>) {
  return {
    id: 'rq_0G3J6M9QcT',
    model: 'http_request',
    authentication: {},
    authenticationType: null,
    body: {},
    bodyType: null,
    folderId: null,
    headers: [],
    method: 'GET',
    name: '',
    sortPriority: 0,
    url: '',
    urlParameters: [],
    workspaceId: 'WORKSPACE_ID',
    ...mergeWith,
  };
}
