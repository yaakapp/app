import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpRequest, Workspace } from '../../../src-web/lib/models';
import { pluginHookImport } from '../src';
import { XORShift } from 'random-seedable';

let originalRandom = Math.random;

describe('importer-curl', () => {
  beforeEach(() => {
    const rand = new XORShift(123456789);
    Math.random = vi.fn(() => {
      return rand.float();
    });
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  test('Imports basic GET', () => {
    expect(pluginHookImport('curl https://yaak.app').resources).toEqual({
      workspaces: [baseWorkspace()],
      httpRequests: [
        baseRequest({
          url: 'https://yaak.app',
        }),
      ],
    });
  });

  test('Imports simple POST', () => {
    expect(pluginHookImport('curl -X POST -d "data" https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            method: 'POST',
            url: 'https://yaak.app',
            bodyType: 'text/plain',
            body: {
              text: 'data',
            },
          }),
        ],
      },
    });
  });

  test('Imports form data', () => {
    expect(
      pluginHookImport('curl -X POST -F "a=aaa" -F b=bbb" -F f=@filepath https://yaak.app'),
    ).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
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
        ],
      },
    });
  });
});

function baseRequest(mergeWith: Partial<HttpRequest>) {
  return {
    id: 'rq_ehhfr4FaEw',
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
    workspaceId: 'wk_DwiTJRJQZM',
    ...mergeWith,
  };
}

function baseWorkspace(mergeWith: Partial<Workspace> = {}) {
  return {
    id: 'wk_DwiTJRJQZM',
    model: 'workspace',
    name: 'Curl Import',
    ...mergeWith,
  };
}
