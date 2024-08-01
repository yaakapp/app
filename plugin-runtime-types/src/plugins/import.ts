import { AtLeast } from '../helpers';
import { Environment, Folder, HttpRequest, Workspace } from '../models';
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
