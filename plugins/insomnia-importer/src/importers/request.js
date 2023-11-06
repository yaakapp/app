import { convertSyntax } from '../helpers/variables.js';

/**
 * Import an Insomnia request object.
 * @param {Object} r - The request object to import.
 * @param workspaceId - The workspace ID to use for the request.
 * @param {number} sortPriority - The sort priority to use for the request.
 */
export function importRequest(r, workspaceId, sortPriority = 0) {
  console.log('IMPORTING REQUEST', r._id, r.name, JSON.stringify(r, null, 2));

  let bodyType = null;
  let body = null;
  if (r.body?.mimeType === 'application/graphql') {
    bodyType = 'graphql';
    body = convertSyntax(r.body.text);
  } else if (r.body?.mimeType === 'application/json') {
    bodyType = 'application/json';
    body = convertSyntax(r.body.text);
  }

  let authenticationType = null;
  let authentication = {};
  if (r.authentication.type === 'bearer') {
    authenticationType = 'bearer';
    authentication = {
      token: convertSyntax(r.authentication.token),
    };
  } else if (r.authentication.type === 'basic') {
    authenticationType = 'basic';
    authentication = {
      username: convertSyntax(r.authentication.username),
      password: convertSyntax(r.authentication.password),
    };
  }

  return {
    id: r._id,
    createdAt: new Date(r.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(r.updated ?? Date.now()).toISOString().replace('Z', ''),
    workspaceId,
    folderId: r.parentId === workspaceId ? null : r.parentId,
    model: 'http_request',
    sortPriority,
    name: r.name,
    url: convertSyntax(r.url),
    body,
    bodyType,
    authentication,
    authenticationType,
    method: r.method,
    headers: (r.headers ?? []).map(({ name, value, disabled }) => ({
      enabled: !disabled,
      name,
      value,
    })),
  };
}
