import { isAbortError } from 'abort-controller-x';
import { createServer, ServerError, ServerMiddlewareCall, Status } from 'nice-grpc';
import { CallContext } from 'nice-grpc-common';
import * as fs from 'node:fs';
import {
  DeepPartial,
  HookExportRequest,
  HookImportRequest,
  HookResponse,
  HookResponseFilterRequest,
  PluginRuntimeDefinition,
  PluginRuntimeServiceImplementation,
} from './gen/plugins/runtime';
import { PluginManager } from './PluginManager';

class PluginRuntimeService implements PluginRuntimeServiceImplementation {
  #manager: PluginManager;

  constructor() {
    this.#manager = PluginManager.instance();
  }

  async hookExport(request: HookExportRequest): Promise<DeepPartial<HookResponse>> {
    const plugin = await this.#manager.pluginOrThrow('exporter-curl');
    const data = await plugin.runExport(JSON.parse(request.request));
    const info = { plugin: (await plugin.getInfo()).name };
    return { info, data };
  }

  async hookImport(request: HookImportRequest): Promise<DeepPartial<HookResponse>> {
    const plugins = await this.#manager.pluginsWith('import');
    for (const p of plugins) {
      const data = await p.runImport(request.data);
      if (data != null && data !== 'null') {
        const info = { plugin: (await p.getInfo()).name };
        return { info, data };
      }
    }

    throw new ServerError(Status.UNKNOWN, 'No importers found for data');
  }

  async hookResponseFilter(request: HookResponseFilterRequest): Promise<DeepPartial<HookResponse>> {
    const pluginName = request.contentType.includes('json') ? 'filter-jsonpath' : 'filter-xpath';
    const plugin = await this.#manager.pluginOrThrow(pluginName);
    const data = await plugin.runResponseFilter(request);
    const info = { plugin: (await plugin.getInfo()).name };
    return { info, data };
  }
}

let server = createServer();

async function* errorHandlingMiddleware<Request, Response>(
  call: ServerMiddlewareCall<Request, Response>,
  context: CallContext,
) {
  try {
    return yield* call.next(call.request, context);
  } catch (error: unknown) {
    if (error instanceof ServerError || isAbortError(error)) {
      throw error;
    }

    let details = String(error);

    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      details += `: ${error.stack}`;
    }

    throw new ServerError(Status.UNKNOWN, details);
  }
}

server = server.use(errorHandlingMiddleware);
server.add(PluginRuntimeDefinition, new PluginRuntimeService());

// Start on random port if GRPC_PORT_FILE_PATH is set, or :4000
const addr = process.env.GRPC_PORT_FILE_PATH ? 'localhost:0' : 'localhost:4000';
server.listen(addr).then((port) => {
  console.log('gRPC server listening on', `http://localhost:${port}`);
  if (process.env.GRPC_PORT_FILE_PATH) {
    console.log('Wrote port file to', process.env.GRPC_PORT_FILE_PATH);
    fs.writeFileSync(process.env.GRPC_PORT_FILE_PATH, JSON.stringify({ port }, null, 2));
  }
});
