import { describe, expect, test } from 'vitest';
import { pluginHookImport } from '../src';

describe('exporter-curl', () => {
  test('Exports GET with params', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        urlParameters: [
          { name: 'a', value: 'aaa' },
          { name: 'b', value: 'bbb', enabled: true },
          { name: 'c', value: 'ccc', enabled: false },
        ],
      }),
    ).toEqual(
      [`curl 'https://yaak.app'`, `--url-query 'a=aaa'`, `--url-query 'b=bbb'`].join(` \\\n  `),
    );
  });
  test('Exports POST with url form data', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        method: 'POST',
        bodyType: 'application/x-www-form-urlencoded',
        body: {
          form: [
            { name: 'a', value: 'aaa' },
            { name: 'b', value: 'bbb', enabled: true },
            { name: 'c', value: 'ccc', enabled: false },
          ],
        },
      }),
    ).toEqual(
      [`curl -X POST 'https://yaak.app'`, `--data 'a=aaa'`, `--data 'b=bbb'`].join(` \\\n  `),
    );
  });

  test('Exports PUT with multipart form', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        method: 'PUT',
        bodyType: 'multipart/form-data',
        body: {
          form: [
            { name: 'a', value: 'aaa' },
            { name: 'b', value: 'bbb', enabled: true },
            { name: 'c', value: 'ccc', enabled: false },
            { name: 'f', file: '/foo/bar.png', contentType: 'image/png' },
          ],
        },
      }),
    ).toEqual(
      [
        `curl -X PUT 'https://yaak.app'`,
        `--form 'a=aaa'`,
        `--form 'b=bbb'`,
        `--form f=@/foo/bar.png;type=image/png`,
      ].join(` \\\n  `),
    );
  });

  test('Exports JSON body', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        method: 'POST',
        bodyType: 'application/json',
        body: {
          text: `{"foo":"bar's"}`,
        },
        headers: [{ name: 'Content-Type', value: 'application/json' }],
      }),
    ).toEqual(
      [
        `curl -X POST 'https://yaak.app'`,
        `--header 'Content-Type: application/json'`,
        `--data-raw $'{"foo":"bar\\'s"}'`,
      ].join(` \\\n  `),
    );
  });

  test('Exports headers', () => {
    expect(
      pluginHookImport({
        headers: [
          { name: 'a', value: 'aaa' },
          { name: 'b', value: 'bbb', enabled: true },
          { name: 'c', value: 'ccc', enabled: false },
        ],
      }),
    ).toEqual([`curl`, `--header 'a: aaa'`, `--header 'b: bbb'`].join(` \\\n  `));
  });

  test('Basic auth', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        authenticationType: 'basic',
        authentication: {
          username: 'user',
          password: 'pass',
        },
      }),
    ).toEqual([`curl 'https://yaak.app'`, `--user 'user:pass'`].join(` \\\n  `));
  });

  test('Broken basic auth', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        authenticationType: 'basic',
        authentication: {},
      }),
    ).toEqual([`curl 'https://yaak.app'`, `--user ':'`].join(` \\\n  `));
  });

  test('Digest auth', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        authenticationType: 'digest',
        authentication: {
          username: 'user',
          password: 'pass',
        },
      }),
    ).toEqual([`curl 'https://yaak.app'`, `--digest --user 'user:pass'`].join(` \\\n  `));
  });

  test('Bearer auth', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        authenticationType: 'bearer',
        authentication: {
          token: 'tok',
        },
      }),
    ).toEqual([`curl 'https://yaak.app'`, `--header 'Authorization: Bearer tok'`].join(` \\\n  `));
  });

  test('Broken bearer auth', () => {
    expect(
      pluginHookImport({
        url: 'https://yaak.app',
        authenticationType: 'bearer',
        authentication: {
          username: 'user',
          password: 'pass',
        },
      }),
    ).toEqual([`curl 'https://yaak.app'`, `--header 'Authorization: Bearer '`].join(` \\\n  `));
  });
});
