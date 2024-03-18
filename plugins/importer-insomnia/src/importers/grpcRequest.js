import { convertSyntax } from '../helpers/variables.js';

/**
 * Import an Insomnia GRPC request object.
 * @param {Object} r - The request object to import.
 * @param workspaceId - The workspace ID to use for the request.
 * @param {number} sortPriority - The sort priority to use for the request.
 */
export function importGrpcRequest(r, workspaceId, sortPriority = 0) {
  console.log('IMPORTING GRPC REQUEST', r._id, r.name, JSON.stringify(r, null, 2));

  const parts = r.protoMethodName.split('/').filter((p) => p !== '');
  const service = parts[0] ?? null;
  const method = parts[1] ?? null;

  return {
    id: r._id,
    createdAt: new Date(r.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(r.updated ?? Date.now()).toISOString().replace('Z', ''),
    workspaceId,
    folderId: r.parentId === workspaceId ? null : r.parentId,
    model: 'grpc_request',
    sortPriority,
    name: r.name,
    url: convertSyntax(r.url),
    service,
    method,
    message: r.body?.text ?? '',
    metadata: (r.metadata ?? [])
      .map(({ name, value, disabled }) => ({
        enabled: !disabled,
        name,
        value,
      }))
      .filter(({ name, value }) => name !== '' || value !== ''),
  };
}
