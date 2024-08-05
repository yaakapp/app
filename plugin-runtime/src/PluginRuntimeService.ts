import { isAbortError } from 'abort-controller-x';
import { createServer, ServerError, ServerMiddlewareCall, Status } from 'nice-grpc';
import { CallContext } from 'nice-grpc-common';
import * as fs from 'node:fs';
import { EventChannel } from './EventChannel';
import {
  Event,
  PluginRuntimeDefinition,
  PluginRuntimeServiceImplementation,
  ServerStreamingMethodResult,
} from './gen/plugins/runtime';

export class PluginRuntimeService implements PluginRuntimeServiceImplementation {
  #events: EventChannel;

  constructor() {
    this.#events = new EventChannel();
  }

  async *eventStream(request: AsyncIterable<Event>): ServerStreamingMethodResult<Event> {
    // Subscribe to server events in background
    new Promise<void>(async (resolve) => {
      for await (const event of request) {
        console.log('RECEIVED EVENT', event);
      }
      resolve();
    }).catch(console.error);

    // Block and yield all events
    for await (const event of this.#events.listen()) {
      console.log('YIELDING EVENT', event);
      yield event;
    }
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
