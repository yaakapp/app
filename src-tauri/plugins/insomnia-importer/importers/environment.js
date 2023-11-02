/**
 * Import an Insomnia environment object.
 * @param {Object} e - The environment object to import.
 */
export function importEnvironment(e) {
  console.log('IMPORTING Environment', e._id, e.name, JSON.stringify(e, null, 2));
  return {
    id: e._id,
    workspaceId: '__CURRENT__',
    createdAt: new Date(e.created ?? Date.now()).toISOString().replace('Z', ''),
    updatedAt: new Date(e.updated ?? Date.now()).toISOString().replace('Z', ''),
    model: 'workspace',
    name: e.name,
    variables: Object.entries(e.data).map(([name, value]) => ({
      enabled: true,
      name,
      value,
    })),

    // name: string;
    // value: string;
    // enabled?: boolean;

    // readonly workspaceId: string;
    // readonly model: 'environment';
    // name: string;
    // variables: EnvironmentVariable[];
  };
}
