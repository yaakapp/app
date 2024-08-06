import { Environment } from '../gen/models/Environment';
import { Folder } from '../gen/models/Folder';
import { HttpRequest } from '../gen/models/HttpRequest';
import { Workspace } from '../gen/models/Workspace';
import { AtLeast } from '../helpers';
import { YaakContext } from './context';

export type ImportPluginResponse = null | {
  workspaces: AtLeast<Workspace, 'name' | 'id' | 'model'>[];
  environments: AtLeast<Environment, 'name' | 'id' | 'model' | 'workspaceId'>[];
  httpRequests: AtLeast<HttpRequest, 'name' | 'id' | 'model' | 'workspaceId'>[];
  folders: AtLeast<Folder, 'name' | 'id' | 'model' | 'workspaceId'>[];
};

export type ImporterPlugin = {
  name: string;
  description?: string;
  onImport(ctx: YaakContext, args: { text: string }): Promise<ImportPluginResponse>;
};
