import { PluginEvent, PluginEventPayload } from '@yaakapp/api';
import EventEmitter from 'node:events';
import { EventStreamEvent } from './gen/plugins/runtime';

export class EventChannel {
  emitter: EventEmitter = new EventEmitter();
  replyId = 0;

  emit(e: PluginEvent) {
    this.emitter.emit('__plugin_event__', { event: JSON.stringify(e) });
  }

  send(pluginDir: string, payload: PluginEventPayload) {
    this.emit({ pluginDir, payload, replyId: null });
  }

  sendForReply(pluginDir: string, payload: PluginEventPayload) {
    this.emit({ pluginDir, payload, replyId: `${this.replyId++}` });
  }

  async *listen(): AsyncGenerator<EventStreamEvent> {
    while (true) {
      yield new Promise<EventStreamEvent>((resolve) => {
        this.emitter.once('__plugin_event__', (event: EventStreamEvent) => {
          resolve(event);
        });
      });
    }
  }
}
