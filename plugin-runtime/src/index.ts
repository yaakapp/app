import { PluginEvent } from '@yaakapp/api';
import { createChannel, createClient } from 'nice-grpc';
import { EventChannel } from './EventChannel';
import { PluginRuntimeClient, PluginRuntimeDefinition } from './gen/plugins/runtime';
import { PluginHandle } from './PluginHandle';

const port = process.env.PORT || '50051';

const channel = createChannel(`localhost:${port}`);
const client: PluginRuntimeClient = createClient(PluginRuntimeDefinition, channel);

const events = new EventChannel();
const plugins: Record<string, PluginHandle> = {};

new Promise(async () => {
  for await (const e of client.eventStream(events.listen())) {
    const pluginEvent: PluginEvent = JSON.parse(e.event);
    // Handle special event to bootstrap plugin
    if (pluginEvent.payload.type === 'boot_request') {
      const plugin = new PluginHandle(pluginEvent.payload.dir, pluginEvent.pluginRefId, events);
      plugins[pluginEvent.pluginRefId] = plugin;
    }

    // Once booted, forward all events to plugin's worker
    const plugin = plugins[pluginEvent.pluginRefId];
    if (!plugin) {
      console.warn('Failed to get plugin for event by', pluginEvent.pluginRefId);
      continue;
    }

    plugin.sendToWorker(pluginEvent);
  }

  console.log('Stream ended');
}).catch((e) => console.log('Client stream errored', e));
