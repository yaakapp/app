import { createChannel, createClient } from 'nice-grpc';
import { EventChannel } from './EventChannel';
import { PluginRuntimeClient, PluginRuntimeDefinition } from './gen/plugins/runtime';

const port = process.env.PORT || '50051';

const channel = createChannel(`localhost:${port}`);
const client: PluginRuntimeClient = createClient(PluginRuntimeDefinition, channel);

const events = new EventChannel();

setTimeout(() => {
  events.send({ name: 'Ping', replyId: '', payload: 'null' });
}, 1000);

new Promise(async () => {
  console.log('LISTENING FOR EVENTS');
  for await (const event of client.eventStream(events.listen())) {
    console.log('Received event', event);
  }
}).catch(console.error);
