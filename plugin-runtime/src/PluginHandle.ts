import { InternalEvent } from '@yaakapp/api';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { EventChannel } from './EventChannel';

export class PluginHandle {
  readonly #worker: Worker;

  constructor(
    readonly pluginDir: string,
    readonly pluginRefId: string,
    readonly events: EventChannel,
  ) {
    const workerPath = process.env.YAAK_WORKER_PATH ?? path.join(__dirname, 'index.worker.cjs');
    this.#worker = new Worker(workerPath, {
      workerData: {
        pluginDir,
        pluginRefId,
      },
    });

    this.#worker.on('message', (e) => this.events.emit(e));
    this.#worker.on('error', this.#handleError.bind(this));
    this.#worker.on('exit', this.#handleExit.bind(this));
  }

  sendToWorker(event: InternalEvent) {
    this.#worker.postMessage(event);
  }

  async #handleError(err: Error) {
    console.error('Plugin errored', this.pluginDir, err);
  }

  async #handleExit(code: number) {
    if (code === 0) {
      console.log('Plugin exited successfully', this.pluginDir);
    } else {
      console.log('Plugin exited with error', code, this.pluginDir);
    }
  }
}
