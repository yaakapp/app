import { convertSyntax } from '../helpers/variables.js';

/**
 * Import an Insomnia request object.
 * @param {Object} r - The request object to import.
 * @param workspaceId - The workspace ID to use for the request.
 * @param {number} sortPriority - The sort priority to use for the request.
 */
export function importHttpRequest(r, workspaceId, sortPriority = 0) {
  let bodyType = null;
  let body = {};
  if (r.body.mimeType === 'application/octet-stream') {
    bodyType = 'binary';
    body = { filePath: r.body.fileName ?? '' };
  } else if (r.body?.mimeType === 'application/x-www-form-urlencoded') {
    bodyType = 'application/x-www-form-urlencoded';
    body = {
      form: (r.body.params ?? []).map((p) => ({
        enabled: !p.disabled,
        name: p.name ?? '',
        value: p.value ?? '',
      })),
    };
  } else if (r.body?.mimeType === 'multipart/form-data') {
    bodyType = 'multipart/form-data';
    body = {
      form: (r.body.params ?? []).map((p) => ({
        enabled: !p.disabled,
        name: p.name,
        value: p.value,
        file: p.fileName ?? null,
      })),
    };
  } else if (r.body?.mimeType === 'application/graphql') {
    bodyType = 'graphql';
    body = { text: convertSyntax(r.body.text ?? '') };
  } else if (r.body?.mimeType === 'application/json') {
    bodyType = 'application/json';
    body = { text: convertSyntax(r.body.text ?? '') };
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
    headers: (r.headers ?? [])
      .map(({ name, value, disabled }) => ({
        enabled: !disabled,
        name,
        value,
      }))
      .filter(({ name, value }) => name !== '' || value !== ''),
  };
}
