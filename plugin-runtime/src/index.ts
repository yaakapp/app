import { FileImportPlugin, FileImportPluginResponse } from '@yaakapp/api';
import { YaakContext } from '@yaakapp/api/lib/plugins/context';
import { isAbortError } from 'abort-controller-x';
import { createServer, ServerError, ServerMiddlewareCall, Status } from 'nice-grpc';
import { CallContext } from 'nice-grpc-common';
import { ServerReflection, ServerReflectionService } from 'nice-grpc-server-reflection';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import { Callback } from './gen/yaak/common/callback';
import { RuntimeEventsRequest, RuntimeEventsResponse } from './gen/yaak/internal/runtime_events';
import {
  DeepPartial,
  PluginRuntimeDefinition,
  PluginRuntimeServiceImplementation,
  ServerStreamingMethodResult,
} from './gen/yaak/plugin_runtime';
import {
  CallDataFiltererRequest,
  CallDataFiltererResponse,
  GetDataFilterersRequest,
  GetDataFilterersResponse,
} from './gen/yaak/plugins/data_filterer';
import {
  CallFileImportRequest,
  CallFileImportResponse,
  FileImporter,
  GetFileImportersRequest,
  GetFileImportersResponse,
} from './gen/yaak/plugins/file_importer';
import {
  CallHttpRequestActionRequest,
  CallHttpRequestActionResponse,
  GetHttpRequestActionsRequest,
  GetHttpRequestActionsResponse,
} from './gen/yaak/plugins/http_request_action';
import { PluginHandle } from './PluginHandle';
import { loadPlugins, PluginInfo } from './plugins';

class PluginRuntimeService implements PluginRuntimeServiceImplementation {
  #handles: PluginHandle[] | null = null;
  #callbackFns: Record<string, Function> = {};

  constructor() {
    console.log('Loading plugins');
    this.pluginsWithInfo().then((plugins) => {
      console.log('Loaded plugins', plugins.map((p) => p.info.name).join(', '));
    });
  }

  async plugins(): Promise<PluginHandle[]> {
    this.#handles = this.#handles ?? loadPlugins();
    return this.#handles;
  }

  async pluginsWithInfo(): Promise<{ plugin: PluginHandle; info: PluginInfo }[]> {
    const plugins = await this.plugins();
    return Promise.all(
      plugins.map(async (plugin) => ({ plugin, info: await plugin.meta('info') })),
    );
  }

  async pluginsWith(capability: PluginInfo['capabilities'][0]): Promise<PluginHandle[]> {
    const withInfo = await this.pluginsWithInfo();
    return withInfo.filter((v) => v.info.capabilities.includes(capability)).map((v) => v.plugin);
  }

  #createCallback<F extends Function>(fn: F): Callback {
    const callback: Callback = {
      id: `cb_${randomUUID().replaceAll('-', '')}`,
    };
    this.#callbackFns[callback.id] = fn;
    return callback;
  }

  // ~~~~~~~~~~~~ //
  // gRPC methods //
  // ~~~~~~~~~~~~ //

  async *streamRuntimeEvents(
    request: RuntimeEventsRequest,
    context: CallContext,
  ): ServerStreamingMethodResult<DeepPartial<RuntimeEventsResponse>> {
    // TODO: Implement observable
    //   https://github.com/deeplay-io/nice-grpc/tree/bd6f6f77809d83acd1931ba43fc3357c91448ce5/packages/nice-grpc#example-observables
  }

  async getDataFilters(
    request: GetDataFilterersRequest,
    context: CallContext,
  ): Promise<DeepPartial<GetDataFilterersResponse>> {
    throw new Error('TODO get data filters');
  }

  async callDataFilter(
    request: CallDataFiltererRequest,
    context: CallContext,
  ): Promise<DeepPartial<CallDataFiltererResponse>> {
    throw new Error('TODO call data filter');
  }

  async getHttpRequestActions(
    request: GetHttpRequestActionsRequest,
    context: CallContext,
  ): Promise<DeepPartial<GetHttpRequestActionsResponse>> {
    throw new Error('TODO get http request actions');
  }

  async callHttpRequestAction(
    request: CallHttpRequestActionRequest,
    context: CallContext,
  ): Promise<DeepPartial<CallHttpRequestActionResponse>> {
    throw new Error('TODO call http request action');
  }

  async getFileImporters(
    _request: GetFileImportersRequest,
    _context: CallContext,
  ): Promise<DeepPartial<GetFileImportersResponse>> {
    const fileImporters: FileImporter[] = [];
    for (const plugin of await this.pluginsWith('fileImport')) {
      const importer = await plugin.access('fileImport');
      console.log('ADDING CALLBACK', importer);
      fileImporters.push({
        name: importer.name,
        description: importer.description,
        onImport: this.#createCallback(importer.onImport),
      });
    }
    return { fileImporters };
  }

  async callFileImport(
    request: CallFileImportRequest,
    context: CallContext,
  ): Promise<DeepPartial<CallFileImportResponse>> {
    const callbackId = request.callback?.id ?? 'n/a';
    const callback: FileImportPlugin['onImport'] = this.#callbackFns[callbackId];
    if (callback == null) {
      throw new Error(
        `Callback not found for ${callbackId}. Options are ${Object.keys(
          this.#callbackFns,
        ).join()}`,
      );
    }
    console.log('GOT CALLBACK', callback);
    const ctx: YaakContext = {
      // TODO: Fill out the context
    } as any;
    const resources: FileImportPluginResponse = await callback(ctx, { text: request.fileContent });
    console.log('GOT RESOURCES', resources);
    return { resources };
  }

  // async hookHttpRequestAction(
  //   _request: HookHttpRequestActionRequest,
  // ): Promise<DeepPartial<HookHttpRequestActionResponse>> {
  //   const plugins = await this.#manager.pluginsWith('httpRequestAction');
  //   let actions: HookHttpRequestActionResponse['actions'] = [];
  //   for (const p of plugins) {
  //     actions.push(await p.invoke('httpRequestAction', undefined));
  //   }
  //
  //   console.log('ACTIONS', actions);
  //   return { actions };
  // }
  //
  // async hookImport(request: HookImportRequest): Promise<DeepPartial<HookGenericResponse>> {
  //   const plugins = await this.#manager.pluginsWith('importer');
  //   for (const p of plugins) {
  //     const result = await p.invoke('importer', undefined);
  //     const data = JSON.stringify(result, null, 2);
  //     if (data != null && data !== 'null') {
  //       const info = { plugin: (await p.getInfo()).name };
  //       return { info, data };
  //     }
  //   }
  //
  //   throw new ServerError(Status.UNKNOWN, 'No importers found for data');
  // }
  //
  // async hookResponseFilter(
  //   request: HookResponseFilterRequest,
  // ): Promise<DeepPartial<HookGenericResponse>> {
  //   const pluginName = request.contentType.includes('json') ? 'filter-jsonpath' : 'filter-xpath';
  //   const plugin = await this.#manager.pluginOrThrow(pluginName);
  //   const data: string = await plugin.invoke('run-filter', request);
  //   const info = { plugin: (await plugin.getInfo()).name };
  //   return { info, data };
  // }
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
try {
  server.add(
    ServerReflectionService,
    ServerReflection(
      fs.readFileSync('/Users/gschier/Workspace/yaak/plugin-runtime/src/gen/protoset.bin'),
      [PluginRuntimeDefinition.fullName],
    ),
  );
} catch (err) {
  console.log('Failed to add gRPC server reflection', err);
}

// Start on random port if YAAK_GRPC_PORT_FILE_PATH is set, or :4000
const addr = process.env.YAAK_GRPC_PORT_FILE_PATH ? 'localhost:0' : 'localhost:4000';
server.listen(addr).then((port) => {
  console.log('gRPC server listening on', `http://localhost:${port}`);
  if (process.env.YAAK_GRPC_PORT_FILE_PATH) {
    console.log('Wrote port file to', process.env.YAAK_GRPC_PORT_FILE_PATH);
    fs.writeFileSync(process.env.YAAK_GRPC_PORT_FILE_PATH, JSON.stringify({ port }, null, 2));
  }
});
