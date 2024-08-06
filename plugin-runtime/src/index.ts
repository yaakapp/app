import { PluginEvent } from '@yaakapp/api';
import { createChannel, createClient } from 'nice-grpc';
import { EventChannel } from './EventChannel';
import { PluginRuntimeClient, PluginRuntimeDefinition } from './gen/plugins/runtime';
import { PluginHandle } from './PluginHandle';

const port = process.env.PORT || '50051';

const channel = createChannel(`localhost:${port}`);
const client: PluginRuntimeClient = createClient(PluginRuntimeDefinition, channel);

setTimeout(() => {
  events.sendForReply({
    type: 'ping_request',
    message: 'Hello!',
  });
}, 1000);

const events = new EventChannel();
const workers: PluginHandle[] = [];

new Promise(async () => {
  for await (const e of client.eventStream(events.listen())) {
    const event: PluginEvent = JSON.parse(e.event);
    // Handle special event to bootstrap plugin
    if (event.payload.type === 'boot_request') {
      console.log('Got boot request', event);
      const ph = new PluginHandle(event.payload.dir, events.emit.bind(events));
      workers.push(ph);
    } else if (event.payload.type === 'ping_request') {
      console.log('GOT PING RESPONSE', event.payload.message);
    }

    // Once booted, forward all events to plugin's worker
    workers[0].sendToWorker(event);
  }

  console.log('Stream ended');
}).catch(console.error);
