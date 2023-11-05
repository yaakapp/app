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
    body = r.body.text;
  }
  let authenticationType = null;
  let authentication = {};
  if (r.authentication.type === 'bearer') {
    authenticationType = 'bearer';
    authentication = {
      token: r.authentication.token,
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
    url: r.url,
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
