import { InternalEvent } from '@yaakapp/api';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { EventChannel } from './EventChannel';

export class PluginHandle {
  #worker: Worker;

  constructor(
    readonly pluginDir: string,
    readonly pluginRefId: string,
    readonly events: EventChannel,
  ) {
    this.#worker = this.#createWorker();
  }

  sendToWorker(event: InternalEvent) {
    this.#worker.postMessage(event);
  }

  #createWorker(): Worker {
    const workerPath = process.env.YAAK_WORKER_PATH ?? path.join(__dirname, 'index.worker.cjs');
    const worker = new Worker(workerPath, {
      workerData: { pluginDir: this.pluginDir, pluginRefId: this.pluginRefId },
    });

    worker.on('message', (e) => this.events.emit(e));
    worker.on('error', this.#handleError.bind(this));
    worker.on('exit', this.#handleExit.bind(this));

    console.log('Created plugin worker for ', this.pluginDir);

    return worker;
  }

  async #handleError(err: Error) {
    console.error('Plugin errored', this.pluginDir, err);
  }

  async #handleExit(code: number) {
    if (code === 0) {
      console.log('Plugin exited successfully', this.pluginDir);
    } else {
      console.log('Plugin exited with status', code, this.pluginDir);
    }
  }
}
