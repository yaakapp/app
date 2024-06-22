import { createServer } from 'nice-grpc';
import {
  DeepPartial,
  HookImportRequest,
  HookImportResponse,
  PluginRuntimeDefinition,
  PluginRuntimeServiceImplementation,
} from '../gen/plugins/runtime';
import { loadPlugins } from './plugins';

const echoServiceImpl: PluginRuntimeServiceImplementation = {
  async hookImport(request: HookImportRequest): Promise<DeepPartial<HookImportResponse>> {
    const plugins = await loadPlugins();
    const curlPlugin = plugins.find((p) => p.name === 'importer-curl');
    return { data: await curlPlugin.runImport(request.data) };
  },
};

const server = createServer();
server.add(PluginRuntimeDefinition, echoServiceImpl);
server.listen('0.0.0.0:4000').then((port) => {
  console.log('gRPC server listening on', port);
});
