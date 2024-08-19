import { Environment } from '../gen/Environment';
import { Folder } from '../gen/Folder';
import { HttpRequest } from '../gen/HttpRequest';
import { Workspace } from '../gen/Workspace';
import { AtLeast } from '../helpers';
import { Context } from './Context';

export type ImportPluginResponse = null | {
  workspaces: AtLeast<Workspace, 'name' | 'id' | 'model'>[];
  environments: AtLeast<Environment, 'name' | 'id' | 'model' | 'workspaceId'>[];
  httpRequests: AtLeast<HttpRequest, 'name' | 'id' | 'model' | 'workspaceId'>[];
  folders: AtLeast<Folder, 'name' | 'id' | 'model' | 'workspaceId'>[];
};

export type ImporterPlugin = {
  name: string;
  description?: string;
  onImport(ctx: Context, args: { text: string }): Promise<ImportPluginResponse>;
};
