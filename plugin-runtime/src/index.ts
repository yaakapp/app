import { createChannel, createClient } from 'nice-grpc';
import { EventChannel } from './EventChannel';
import { PluginRuntimeClient, PluginRuntimeDefinition } from './gen/plugins/runtime';
import { PluginHandle } from './PluginHandle';

const port = process.env.PORT || '50051';

const channel = createChannel(`localhost:${port}`);
const client: PluginRuntimeClient = createClient(PluginRuntimeDefinition, channel);

setTimeout(() => {
  events.send({ name: 'ping', replyId: '', payload: '{}' });
}, 1000);

const events = new EventChannel();
const workers: PluginHandle[] = [];

new Promise(async () => {
  for await (const event of client.eventStream(events.listen())) {
    // Handle special event to bootstrap plugin
    if (event.name === 'plugin.boot.request') {
      const payload: Record<string, any> = JSON.parse(event.payload);
      const ph = new PluginHandle(payload.dir, events.send.bind(events));
      workers.push(ph);
    }

    // Once booted, forward all events to plugin's worker
    workers[0].sendToWorker(event);
  }

  console.log('Stream ended');
}).catch(console.error);
