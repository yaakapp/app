import { ControlOperator, parse, ParseEntry } from 'shell-quote';
import { URL } from 'url';
import {
  Environment,
  Folder,
  HttpRequest,
  HttpUrlParameter,
  Workspace,
} from '../../../src-web/lib/models';

type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

interface ExportResources {
  workspaces: AtLeast<Workspace, 'name' | 'id' | 'model'>[];
  environments: AtLeast<Environment, 'name' | 'id' | 'model' | 'workspaceId'>[];
  httpRequests: AtLeast<HttpRequest, 'name' | 'id' | 'model' | 'workspaceId'>[];
  folders: AtLeast<Folder, 'name' | 'id' | 'model' | 'workspaceId'>[];
}

export const id = 'curl';
export const name = 'cURL';
export const description = 'cURL command line tool';

let requestCount = 1;

const SUPPORTED_ARGS = [
  'url',
  'u',
  'user',
  'header',
  'H',
  'cookie',
  'b',
  'get',
  'G',
  'd',
  'data',
  'data-raw',
  'data-urlencode',
  'data-binary',
  'data-ascii',
  'form',
  'F',
  'request',
  'X',
];

type Pair = string | boolean;

type PairsByName = Record<string, Pair[]>;

export function pluginHookImport(contents: string) {
  const parseEntries = parse(contents);

  // ~~~~~~~~~~~~~~~~~~~~~ //
  // Collect all the flags //
  // ~~~~~~~~~~~~~~~~~~~~~ //
  const pairsByName: PairsByName = {};
  const singletons: ParseEntry[] = [];

  // Start at 1 so we can skip the ^curl part
  for (let i = 1; i < parseEntries.length; i++) {
    let parseEntry = parseEntries[i];
    // trim leading spaces between parsed entries
    // regex won't match otherwise (e.g.    -H 'Content-Type: application/json')
    if (typeof parseEntry === 'string') {
      parseEntry = parseEntry.trim();
    }

    if (typeof parseEntry === 'string' && parseEntry.match(/^-{1,2}[\w-]+/)) {
      const isSingleDash = parseEntry[0] === '-' && parseEntry[1] !== '-';
      let name = parseEntry.replace(/^-{1,2}/, '');

      if (!SUPPORTED_ARGS.includes(name)) {
        continue;
      }

      let value;
      const nextEntry = parseEntries[i + 1];
      if (isSingleDash && name.length > 1) {
        // Handle squished arguments like -XPOST
        value = name.slice(1);
        name = name.slice(0, 1);
      } else if (typeof nextEntry === 'string' && !nextEntry.startsWith('-')) {
        // Next arg is not a flag, so assign it as the value
        value = nextEntry;
        i++; // Skip next one
      } else {
        value = true;
      }

      pairsByName[name] = pairsByName[name] || [];
      pairsByName[name]!.push(value);
    } else if (parseEntry) {
      singletons.push(parseEntry);
    }
  }

  // ~~~~~~~~~~~~~~~~~ //
  // Build the request //
  // ~~~~~~~~~~~~~~~~~ //

  /// /////// Url & parameters //////////
  let parameters: HttpUrlParameter[] = [];
  let url = '';

  try {
    const urlValue = getPairValue(pairsByName, (singletons[0] as string) || '', ['url']);
    const { searchParams, href, search } = new URL(urlValue);
    parameters = Array.from(searchParams.entries()).map(([name, value]) => ({
      name,
      value,
      disabled: false,
    }));

    url = href.replace(search, '').replace(/\/$/, '');
  } catch (error) {}

  /// /////// Authentication //////////
  const [username, password] = getPairValue(pairsByName, '', ['u', 'user']).split(/:(.*)$/);

  const authentication = username
    ? {
        username: username.trim(),
        password: (password ?? '').trim(),
      }
    : {};

  /// /////// Headers //////////
  const headers = [
    ...((pairsByName.header as string[] | undefined) || []),
    ...((pairsByName.H as string[] | undefined) || []),
  ].map((header) => {
    const [name, value] = header.split(/:(.*)$/);
    // remove final colon from header name if present
    if (!value) {
      return {
        name: (name ?? '').trim().replace(/;$/, ''),
        value: '',
      };
    }
    return {
      name: (name ?? '').trim(),
      value: value.trim(),
    };
  });

  /// /////// Cookies //////////
  const cookieHeaderValue = [
    ...((pairsByName.cookie as string[] | undefined) || []),
    ...((pairsByName.b as string[] | undefined) || []),
  ]
    .map((str) => {
      const name = str.split('=', 1)[0];
      const value = str.replace(`${name}=`, '');
      return `${name}=${value}`;
    })
    .join('; ');

  // Convert cookie value to header
  const existingCookieHeader = headers.find((header) => header.name.toLowerCase() === 'cookie');

  if (cookieHeaderValue && existingCookieHeader) {
    // Has existing cookie header, so let's update it
    existingCookieHeader.value += `; ${cookieHeaderValue}`;
  } else if (cookieHeaderValue) {
    // No existing cookie header, so let's make a new one
    headers.push({
      name: 'Cookie',
      value: cookieHeaderValue,
    });
  }

  /// /////// Body (Text or Blob) //////////
  const dataParameters = pairsToDataParameters(pairsByName);
  const contentTypeHeader = headers.find((header) => header.name.toLowerCase() === 'content-type');
  const mimeType = contentTypeHeader ? contentTypeHeader.value.split(';')[0] : null;

  /// /////// Body (Multipart Form Data) //////////
  const formDataParams = [
    ...((pairsByName.form as string[] | undefined) || []),
    ...((pairsByName.F as string[] | undefined) || []),
  ].map((str) => {
    const parts = str.split('=');
    const name = parts[0] ?? '';
    const value = parts[1] ?? '';
    const item: { name: string; value?: string; file?: string; enabled: boolean } = {
      name,
      enabled: true,
    };

    if (value.indexOf('@') === 0) {
      item.file = value.slice(1);
    } else {
      item.value = value;
    }

    return item;
  });

  /// /////// Body //////////
  let body = {};
  let bodyType: string | null = null;
  const bodyAsGET = getPairValue(pairsByName, false, ['G', 'get']);

  if (dataParameters.length !== 0 && bodyAsGET) {
    parameters.push(...dataParameters);
  } else if (dataParameters && mimeType === 'application/x-www-form-urlencoded') {
    bodyType = mimeType;
    body = {
      params: dataParameters.map((parameter) => ({
        ...parameter,
        name: decodeURIComponent(parameter.name || ''),
        value: decodeURIComponent(parameter.value || ''),
      })),
    };
  } else if (dataParameters.length !== 0) {
    bodyType = mimeType ?? 'text/plain';
    body = {
      text: dataParameters.map((parameter) => `${parameter.name}${parameter.value}`).join('&'),
    };
  } else if (formDataParams.length) {
    bodyType = mimeType ?? 'multipart/form-data';
    body = {
      form: formDataParams,
    };
  }

  /// /////// Method //////////
  let method = getPairValue(pairsByName, '__UNSET__', ['X', 'request']).toUpperCase();

  if (method === '__UNSET__' && body) {
    method = 'text' in body || 'params' in body ? 'POST' : 'GET';
  }

  const request: ExportResources['httpRequests'][0] = {
    id: generateId('rq'),
    model: 'http_request',
    name: '',
    urlParameters: parameters,
    url,
    method,
    headers,
    authentication,
    body,
    bodyType,
    workspaceId: 'WORKSPACE_ID',
    authenticationType: null,
    folderId: null,
    sortPriority: 0,
  };

  return request;
}

/**
 * cURL supported -d, and --date[suffix] flags.
 */
const dataFlags = [
  /**
   * https://curl.se/docs/manpage.html#-d
   */
  'd',
  'data',

  /**
   * https://curl.se/docs/manpage.html#--data-raw
   */
  'data-raw',

  /**
   * https://curl.se/docs/manpage.html#--data-urlencode
   */
  'data-urlencode',

  /**
   * https://curl.se/docs/manpage.html#--data-binary
   */
  'data-binary',

  /**
   * https://curl.se/docs/manpage.html#--data-ascii
   */
  'data-ascii',
];

/**
 * Parses pairs supporting only flags dictated by {@link dataFlags}
 *
 * @param keyedPairs pairs with cURL flags as keys.
 */
const pairsToDataParameters = (keyedPairs: PairsByName) => {
  let dataParameters: {
    enabled: boolean;
    name: string;
    value: string;
    contentType?: string;
    file?: string;
  }[] = [];

  for (const flagName of dataFlags) {
    const pairs = keyedPairs[flagName];

    if (!pairs || pairs.length === 0) {
      continue;
    }

    switch (flagName) {
      case 'd':
      case 'data':
      case 'data-ascii':
      case 'data-binary':
        dataParameters = dataParameters.concat(
          pairs.flatMap((pair) => pairToParameters(pair, true)),
        );
        break;
      case 'data-raw':
        dataParameters = dataParameters.concat(pairs.flatMap((pair) => pairToParameters(pair)));
        break;
      case 'data-urlencode':
        dataParameters = dataParameters.concat(
          pairs
            .flatMap((pair) => pairToParameters(pair, true))
            .map((parameter) => {
              if (parameter.type === 'file') {
                return parameter;
              }

              return {
                ...parameter,
                value: encodeURIComponent(parameter.value ?? ''),
              };
            }),
        );
        break;
      default:
        throw new Error(`unhandled data flag ${flagName}`);
    }
  }

  return dataParameters;
};

/**
 * Converts pairs (that could include multiple via `&`) into {@link Parameter}s. This
 * method supports both `@filename` and `name@filename`.
 *
 * @param pair command line value
 * @param allowFiles whether to allow the `@` to support include files
 */
const pairToParameters = (pair: Pair, allowFiles = false): Parameter[] => {
  if (typeof pair === 'boolean') {
    return [{ name: '', value: pair.toString() }];
  }

  return pair.split('&').map((pair) => {
    if (pair.includes('@') && allowFiles) {
      const [name, file] = pair.split('@');
      return { name, file, type: 'file' };
    }

    const [name, value] = pair.split('=');
    if (!value && !pair.includes('=')) {
      return { name: '', value: pair };
    }

    return { name, value };
  });
};

const getPairValue = <T extends string | boolean>(
  pairsByName: PairsByName,
  defaultValue: T,
  names: string[],
) => {
  for (const name of names) {
    if (pairsByName[name] && pairsByName[name]!.length) {
      return pairsByName[name]![0] as T;
    }
  }

  return defaultValue;
};

export const convert = (rawData: string) => {
  requestCount = 1;

  if (!rawData.match(/^\s*curl /)) {
    return null;
  }

  // Parse the whole thing into one big tokenized list
  const parseEntries = parse(rawData.replace(/\n/g, ' '));

  // ~~~~~~~~~~~~~~~~~~~~~~ //
  // Aggregate the commands //
  // ~~~~~~~~~~~~~~~~~~~~~~ //
  const commands: ParseEntry[][] = [];

  let currentCommand: ParseEntry[] = [];

  for (const parseEntry of parseEntries) {
    if (typeof parseEntry === 'string') {
      if (parseEntry.startsWith('$')) {
        currentCommand.push(parseEntry.slice(1, Infinity));
      } else {
        currentCommand.push(parseEntry);
      }
      continue;
    }

    if ((parseEntry as { comment: string }).comment) {
      continue;
    }

    const { op } = parseEntry as { op: 'glob'; pattern: string } | { op: ControlOperator };

    // `;` separates commands
    if (op === ';') {
      commands.push(currentCommand);
      currentCommand = [];
      continue;
    }

    if (op?.startsWith('$')) {
      // Handle the case where literal like -H $'Header: \'Some Quoted Thing\''
      const str = op.slice(2, op.length - 1).replace(/\\'/g, "'");

      currentCommand.push(str);
      continue;
    }

    if (op === 'glob') {
      currentCommand.push((parseEntry as { op: 'glob'; pattern: string }).pattern);
    }

    // Not sure what else this could be, so just keep going
  }

  // Push the last unfinished command
  commands.push(currentCommand);

  const requests: ImportRequest[] = commands
    .filter((command) => command[0] === 'curl')
    .map(importCommand);

  return requests;
};

export function generateId(prefix: 'wk' | 'rq' | 'fl'): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = `${prefix}_`;
  for (let i = 0; i < 10; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}