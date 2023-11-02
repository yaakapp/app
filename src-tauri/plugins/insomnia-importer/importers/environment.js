/**
 * Import an Insomnia environment object.
 * @param {Object} e - The environment object to import.
 */
export function importEnvironment(e) {
  if (e.parentId.startsWith('env_')) {
    return null;
  }
  console.log('IMPORTING Environment', e._id, e.name, JSON.stringify(e, null, 2));
  return {
    id: e._id,
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
    workspaceId: e.parentId,
    model: 'environment',
    name: e.name,
    variables: Object.entries(e.data).map(([name, value]) => ({
      enabled: true,
      name,
      value: `${value}`,
    })),
  };
}
