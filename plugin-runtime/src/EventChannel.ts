import EventEmitter from 'node:events';
import { PluginEvent } from './gen/plugins/runtime';

export class EventChannel {
  emitter: EventEmitter = new EventEmitter();

  send(event: PluginEvent) {
    this.emitter.emit('__event__', event);
  }

  async *listen() {
    while (true) {
      yield new Promise<PluginEvent>((resolve) => {
        this.emitter.once('__event__', (event) => {
          resolve(event);
        });
      });
    }
  }
}
