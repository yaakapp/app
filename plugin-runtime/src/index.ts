import { isAbortError } from 'abort-controller-x';
import { createServer, ServerError, ServerMiddlewareCall, Status } from 'nice-grpc';
import { CallContext } from 'nice-grpc-common';
import * as fs from 'node:fs';
import {
  DeepPartial,
  HookFilterRequest,
  HookFilterResponse,
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
  }

  async hookImport(request: HookImportRequest): Promise<DeepPartial<HookImportResponse>> {
    const plugins = await this.#manager.pluginsWith('import');
    for (const p of plugins) {
      const data = await p.runImport(request.data);
      if (data != null) return { data };
    }

    throw new ServerError(Status.UNKNOWN, 'No importers found for data');
  }

  async hookFilter(request: HookFilterRequest): Promise<DeepPartial<HookFilterResponse>> {
    const pluginName = request.contentType.includes('json') ? 'filter-jsonpath' : 'filter-xpath';
    const plugin = await this.#manager.pluginOrThrow(pluginName);
    return { data: await plugin.runFilter(request) };
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
