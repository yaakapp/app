import { PluginEvent } from '@yaakapp/api';
import { createChannel, createClient } from 'nice-grpc';
import { EventChannel } from './EventChannel';
import { PluginRuntimeClient, PluginRuntimeDefinition } from './gen/plugins/runtime';
import { PluginHandle } from './PluginHandle';

const port = process.env.PORT || '50051';

const channel = createChannel(`localhost:${port}`);
const client: PluginRuntimeClient = createClient(PluginRuntimeDefinition, channel);

const serverEvents = new EventChannel();
const plugins: PluginHandle[] = [];

new Promise(async () => {
  for await (const e of client.eventStream(serverEvents.listen())) {
    const pluginEvent: PluginEvent = JSON.parse(e.event);
    // Handle special event to bootstrap plugin
    if (pluginEvent.payload.type === 'boot_request') {
      console.log('Got boot request', pluginEvent);
      plugins.push(new PluginHandle(pluginEvent.payload.dir, (e) => serverEvents.emit(e)));
    } else if (pluginEvent.payload.type === 'ping_response') {
      console.log('Got ping response', pluginEvent.payload.message);
    }

    // Once booted, forward all events to plugin's worker
    plugins[0].sendToWorker(pluginEvent);
  }

  console.log('Stream ended');
}).catch(console.error);
