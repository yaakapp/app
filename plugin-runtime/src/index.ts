import { isAbortError } from 'abort-controller-x';
import { createServer, ServerError, ServerMiddlewareCall, Status } from 'nice-grpc';
import { CallContext } from 'nice-grpc-common';
import * as fs from 'node:fs';
import {
  DeepPartial,
  HookExportRequest,
  HookImportRequest,
  HookGenericResponse,
  HookResponseFilterRequest,
  PluginRuntimeDefinition,
  PluginRuntimeServiceImplementation,
  HookHttpRequestActionRequest,
  HookHttpRequestActionResponse,
} from './gen/plugins/runtime';
import { PluginManager } from './PluginManager';

class PluginRuntimeService implements PluginRuntimeServiceImplementation {
  #manager: PluginManager;

  constructor() {
    this.#manager = PluginManager.instance();
  }

  async hookHttpRequestAction(
    request: HookHttpRequestActionRequest,
  ): Promise<DeepPartial<HookHttpRequestActionResponse>> {
    const plugins = await this.#manager.pluginsWith('http-request-action');
    console.log(
      'PLUGINS',
      plugins.map((p) => p.pluginDir),
    );
    let actions: HookHttpRequestActionResponse['actions'] = [];
    for (const p of plugins) {
      console.log('CALLING PLUGIN', p.pluginDir);
      actions.push(await p.invoke('run-http-request-action', request));
      console.log('CALLED PLUGIN', actions);
    }

    console.log('ACTIONS', actions);
    return { actions };
  }

  async hookExport(request: HookExportRequest): Promise<DeepPartial<HookGenericResponse>> {
    const plugin = await this.#manager.pluginOrThrow('exporter-curl');
    const data: string = await plugin.invoke('run-export', JSON.parse(request.request));
    const info = { plugin: (await plugin.getInfo()).name };
    return { info, data };
  }

  async hookImport(request: HookImportRequest): Promise<DeepPartial<HookGenericResponse>> {
    const plugins = await this.#manager.pluginsWith('import');
    for (const p of plugins) {
      const result = await p.invoke('run-import', request.data);
      const data = JSON.stringify(result, null, 2);
      if (data != null && data !== 'null') {
        const info = { plugin: (await p.getInfo()).name };
        return { info, data };
      }
    }

    throw new ServerError(Status.UNKNOWN, 'No importers found for data');
  }

  async hookResponseFilter(
    request: HookResponseFilterRequest,
  ): Promise<DeepPartial<HookGenericResponse>> {
    const pluginName = request.contentType.includes('json') ? 'filter-jsonpath' : 'filter-xpath';
    const plugin = await this.#manager.pluginOrThrow(pluginName);
    const data: string = await plugin.invoke('run-filter', request);
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

// Start on random port if YAAK_GRPC_PORT_FILE_PATH is set, or :4000
const addr = process.env.YAAK_GRPC_PORT_FILE_PATH ? 'localhost:0' : 'localhost:4000';
server.listen(addr).then((port) => {
  console.log('gRPC server listening on', `http://localhost:${port}`);
  if (process.env.YAAK_GRPC_PORT_FILE_PATH) {
    console.log('Wrote port file to', process.env.YAAK_GRPC_PORT_FILE_PATH);
    fs.writeFileSync(process.env.YAAK_GRPC_PORT_FILE_PATH, JSON.stringify({ port }, null, 2));
  }
});
