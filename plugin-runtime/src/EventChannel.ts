import EventEmitter from 'node:events';
import { Event } from './gen/plugins/runtime';

export class EventChannel {
  #emitter: EventEmitter;
  constructor() {
    this.#emitter = new EventEmitter();
  }

  send(event: Event) {
    console.log('Sending event', event);
    this.#emitter.emit('__event__', event);
  }

  async *listen() {
    yield new Promise<Event>((resolve) => {
      this.#emitter.addListener('__event__', (event) => {
        resolve(event);
      });
    });
  }
}
