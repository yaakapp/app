/**
 * Import an Insomnia folder object.
 * @param {Object} f - The environment object to import.
 * @param workspaceId - Workspace to import into.
 */
export function importFolder(f, workspaceId) {
  console.log('IMPORTING FOLDER', f._id, f.name, JSON.stringify(f, null, 2));
  return {
    id: f._id,
    createdAt: new Date(f.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(f.updated ?? Date.now()).toISOString().replace('Z', ''),
    folderId: f.parentId === workspaceId ? null : f.parentId,
    workspaceId,
    model: 'folder',
    name: f.name,
  };
}
