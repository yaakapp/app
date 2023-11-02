/**
 * Import an Insomnia request object.
 * @param {Object} r - The request object to import.
 * @param {number} sortPriority - The sort priority to use for the request.
 */
export function importRequest(r, sortPriority = 0) {
  console.log('IMPORTING REQUEST', r._id, r.name, JSON.stringify(r, null, 2));
  return {
    id: r._id,
    createdAt: new Date(r.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(r.updated ?? Date.now()).toISOString().replace('Z', ''),
    workspaceId: r.parentId,
    model: 'http_request',
    sortPriority,
    name: r.name,
    url: r.url,
    body: null,
    bodyType: null,
    authentication: {},
    authenticationType: null,
    method: r.method,
    headers: (r.headers ?? []).map(({ name, value, disabled }) => ({
      enabled: !disabled,
      name,
      value,
    })),
  };
}
