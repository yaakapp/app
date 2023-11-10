import { importEnvironment } from './importers/environment.js';
import { importRequest } from './importers/request.js';
import { importWorkspace } from './importers/workspace.js';
import {
  isEnvironment,
  isJSObject,
  isRequest,
  isRequestGroup,
  isWorkspace,
} from './helpers/types.js';
import { parseVariables } from './helpers/variables.js';
import { importFolder } from './importers/folder.js';

export function pluginHookImport(contents) {
  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch (e) {
    return undefined;
  }

  if (!isJSObject(parsed)) {
    return undefined;
  }

  if (!Array.isArray(parsed.requests)) {
    return undefined;
  }

  const resources = {
    workspaces: [],
    requests: [],
    environments: [],
    folders: [],
  };

  // Import workspaces
  const workspacesToImport = parsed.resources.filter(isWorkspace);
  for (const workspaceToImport of workspacesToImport) {
    console.log('IMPORTING WORKSPACE', workspaceToImport.name);
    const baseEnvironment = parsed.resources.find(
      (r) => isEnvironment(r) && r.parentId === workspaceToImport._id,
    );
    console.log('FOUND BASE ENV', baseEnvironment.name);
    resources.workspaces.push(
      importWorkspace(
        workspaceToImport,
        baseEnvironment ? parseVariables(baseEnvironment.data) : [],
      ),
    );
    console.log('IMPORTING ENVIRONMENTS', baseEnvironment.name);
    const environmentsToImport = parsed.resources.filter(
      (r) => isEnvironment(r) && r.parentId === baseEnvironment?._id,
    );
    console.log('FOUND', environmentsToImport.length, 'ENVIRONMENTS');
    resources.environments.push(
      ...environmentsToImport.map((r) => importEnvironment(r, workspaceToImport._id)),
    );

    const nextFolder = (parentId) => {
      const children = parsed.resources.filter((r) => r.parentId === parentId);
      let sortPriority = 0;
      for (const child of children) {
        if (isRequestGroup(child)) {
          resources.folders.push(importFolder(child, workspaceToImport._id));
          nextFolder(child._id);
        } else if (isRequest(child)) {
          resources.requests.push(importRequest(child, workspaceToImport._id, sortPriority++));
        }
      }
    };

    // Import folders
    nextFolder(workspaceToImport._id);
  }

  // Filter out any `null` values
  resources.requests = resources.requests.filter(Boolean);
  resources.environments = resources.environments.filter(Boolean);
  resources.workspaces = resources.workspaces.filter(Boolean);

  return resources;
}
