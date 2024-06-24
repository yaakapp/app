import { createServer } from 'nice-grpc';
import {
  DeepPartial,
  HookImportRequest,
  HookImportResponse,
  PluginRuntimeDefinition,
  PluginRuntimeServiceImplementation,
} from '../gen/plugins/runtime';
import { PluginManager } from './PluginManager';

class PluginRuntimeService implements PluginRuntimeServiceImplementation {
  #manager: PluginManager;

  constructor() {
    this.#manager = PluginManager.instance();
    this.#manager
      .plugins()
      .then(async (plugins) => {
        for (const plugin of plugins) {
          console.log('Loaded', await plugin.getInfo());
        }
      })
      .catch((err) => console.log('Failed initial load of plugins', err));
  }

  async hookImport(request: HookImportRequest): Promise<DeepPartial<HookImportResponse>> {
    const curlPlugin = await this.#manager.pluginOrThrow('importer-curl');
    return { data: await curlPlugin.runImport(request.data) };
  }
}

const server = createServer();

server.add(PluginRuntimeDefinition, new PluginRuntimeService());

server.listen('0.0.0.0:4000').then((port) => {
  console.log('gRPC server listening on', port);
});
