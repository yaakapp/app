/**
 * Import an Insomnia workspace object.
 * @param {Object} w - The workspace object to import.
 */
export function importWorkspace(w) {
  console.log('IMPORTING Workpace', w._id, w.name, JSON.stringify(w, null, 2));
  return {
    id: w._id,
    createdAt: new Date(w.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(w.updated ?? Date.now()).toISOString().replace('Z', ''),
    model: 'workspace',
    name: w.name,
  };
}
