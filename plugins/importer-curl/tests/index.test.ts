import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpRequest, Model, Workspace } from '../../../src-web/lib/models';
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
    expect(pluginHookImport('curl https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
          }),
        ],
      },
    });
  });

  test('Explicit URL', () => {
    expect(pluginHookImport('curl --url https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
          }),
        ],
      },
    });
  });

  test('Missing URL', () => {
    expect(pluginHookImport('curl -X POST')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            method: 'POST',
          }),
        ],
      },
    });
  });

  test('URL between', () => {
    expect(pluginHookImport('curl -v https://yaak.app -X POST')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
            method: 'POST',
          }),
        ],
      },
    });
  });

  test('Random flags', () => {
    expect(pluginHookImport('curl --random -Z -Y -S --foo https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
          }),
        ],
      },
    });
  });

  test('Imports --request method', () => {
    expect(pluginHookImport('curl --request POST https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
            method: 'POST',
          }),
        ],
      },
    });
  });

  test('Imports -XPOST method', () => {
    expect(pluginHookImport('curl -XPOST --request POST https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
            method: 'POST',
          }),
        ],
      },
    });
  });

  test('Imports multiple requests', () => {
    expect(
      pluginHookImport('curl \\\n  https://yaak.app\necho "foo"\ncurl example.com;curl foo.com'),
    ).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({ url: 'https://yaak.app' }),
          baseRequest({ url: 'example.com' }),
          baseRequest({ url: 'foo.com' }),
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

  test('Imports data params as form url-encoded', () => {
    expect(pluginHookImport('curl -d a -d b -d c=ccc https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            method: 'POST',
            url: 'https://yaak.app',
            bodyType: 'application/x-www-form-urlencoded',
            body: {
              params: [
                { name: 'a', value: '' },
                { name: 'b', value: '' },
                { name: 'c', value: 'ccc' },
              ],
            },
          }),
        ],
      },
    });
  });

  test('Imports data params as text', () => {
    expect(
      pluginHookImport('curl -H Content-Type:text/plain -d a -d b -d c=ccc https://yaak.app'),
    ).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            method: 'POST',
            url: 'https://yaak.app',
            headers: [{ name: 'Content-Type', value: 'text/plain' }],
            bodyType: 'text/plain',
            body: { text: 'a&b&c=ccc' },
          }),
        ],
      },
    });
  });

  test('Imports multiple headers', () => {
    expect(
      pluginHookImport('curl -H Foo:bar --header Name -H AAA:bbb -H :ccc https://yaak.app'),
    ).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
            headers: [
              { name: 'Name', value: '' },
              { name: 'Foo', value: 'bar' },
              { name: 'AAA', value: 'bbb' },
              { name: '', value: 'ccc' },
            ],
          }),
        ],
      },
    });
  });

  test('Imports basic auth', () => {
    expect(pluginHookImport('curl --user user:pass https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
            authenticationType: 'basic',
            authentication: {
              username: 'user',
              password: 'pass',
            },
          }),
        ],
      },
    });
  });

  test('Imports digest auth', () => {
    expect(pluginHookImport('curl --digest --user user:pass https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
            authenticationType: 'digest',
            authentication: {
              username: 'user',
              password: 'pass',
            },
          }),
        ],
      },
    });
  });

  test('Imports cookie as header', () => {
    expect(pluginHookImport('curl --cookie "foo=bar" https://yaak.app')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
            headers: [{ name: 'Cookie', value: 'foo=bar' }],
          }),
        ],
      },
    });
  });

  test('Imports query params from the URL', () => {
    expect(pluginHookImport('curl "https://yaak.app?foo=bar&baz=a%20a"')).toEqual({
      resources: {
        workspaces: [baseWorkspace()],
        httpRequests: [
          baseRequest({
            url: 'https://yaak.app',
            urlParameters: [
              { name: 'foo', value: 'bar' },
              { name: 'baz', value: 'a%20a' },
            ],
          }),
        ],
      },
    });
  });
});

const idCount: Partial<Record<Model['model'], number>> = {};

function baseRequest(mergeWith: Partial<HttpRequest>) {
  idCount.http_request = (idCount.http_request ?? -1) + 1;
  return {
    id: `GENERATE_ID::HTTP_REQUEST_${idCount.http_request}`,
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
    workspaceId: `GENERATE_ID::WORKSPACE_${idCount.workspace}`,
    ...mergeWith,
  };
}

function baseWorkspace(mergeWith: Partial<Workspace> = {}) {
  idCount.workspace = (idCount.workspace ?? -1) + 1;
  return {
    id: `GENERATE_ID::WORKSPACE_${idCount.workspace}`,
    model: 'workspace',
    name: 'Curl Import',
    ...mergeWith,
  };
}
