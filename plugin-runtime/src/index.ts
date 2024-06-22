import { createServer } from 'nice-grpc';
import {
  DeepPartial,
  EchoDefinition,
  EchoReq,
  EchoRes,
  EchoServiceImplementation,
  HookImportReq,
  HookImportRes,
} from '../gen/echo';
import { echo } from './echo';
import { loadPlugins } from './plugins';
import { runPluginImport } from './run-plugin';

const echoServiceImpl: EchoServiceImplementation = {
  async echo(request: EchoReq): Promise<DeepPartial<EchoRes>> {
    return { message: echo(request.name) };
  },
  async hookImport(request: HookImportReq): Promise<DeepPartial<HookImportRes>> {
    console.log('REQUEST', request);
    const res = await runPluginImport('importer-curl', request.data);
    console.log('RESPONSE', res);
    return { data: JSON.stringify(res, null, 2) };
  },
};

const server = createServer();
server.add(EchoDefinition, echoServiceImpl);
server.listen('0.0.0.0:4000').then((port) => {
  console.log('gRPC server listening on', port);
});

loadPlugins()
  .then((plugins) => {
    console.log('PLUGINS', plugins);
  })
  .catch(console.error);
