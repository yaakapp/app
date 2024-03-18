import { importEnvironment } from './importers/environment';
import { importHttpRequest } from './importers/httpRequest';
import {
  isEnvironment,
  isJSObject,
  isHttpRequest,
  isRequestGroup,
  isWorkspace,
  isGrpcRequest,
} from './helpers/types.js';
import { parseVariables } from './helpers/variables.js';
import { importFolder } from './importers/folder.js';
import { importGrpcRequest } from './importers/grpcRequest';

export function pluginHookImport(contents) {
  let parsed;
  try {
    parsed = JSON.parse(contents);
  } catch (e) {
    return;
  }

  if (!isJSObject(parsed)) return;
  if (!Array.isArray(parsed.resources)) return;

  const resources = {
    workspaces: [],
    httpRequests: [],
    grpcRequests: [],
    environments: [],
    folders: [],
  };

  // Import workspaces
  const workspacesToImport = parsed.resources.filter(isWorkspace);
  for (const workspaceToImport of workspacesToImport) {
    const baseEnvironment = parsed.resources.find(
      (r) => isEnvironment(r) && r.parentId === workspaceToImport._id,
    );
    resources.workspaces.push({
      id: workspaceToImport._id,
      createdAt: new Date(workspacesToImport.created ?? Date.now()).toISOString().replace('Z', ''),
      updatedAt: new Date(workspacesToImport.updated ?? Date.now()).toISOString().replace('Z', ''),
      model: 'workspace',
      name: workspaceToImport.name,
      variables: baseEnvironment ? parseVariables(baseEnvironment.data) : [],
    });
    const environmentsToImport = parsed.resources.filter(
      (r) => isEnvironment(r) && r.parentId === baseEnvironment?._id,
    );
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
        } else if (isHttpRequest(child)) {
          resources.httpRequests.push(
            importHttpRequest(child, workspaceToImport._id, sortPriority++),
          );
        } else if (isGrpcRequest(child)) {
          console.log('GRPC', JSON.stringify(child, null, 1));
          resources.grpcRequests.push(
            importGrpcRequest(child, workspaceToImport._id, sortPriority++),
          );
        }
      }
    };

    // Import folders
    nextFolder(workspaceToImport._id);
  }

  // Filter out any `null` values
  resources.httpRequests = resources.httpRequests.filter(Boolean);
  resources.grpcRequests = resources.grpcRequests.filter(Boolean);
  resources.environments = resources.environments.filter(Boolean);
  resources.workspaces = resources.workspaces.filter(Boolean);

  return { resources };
}
