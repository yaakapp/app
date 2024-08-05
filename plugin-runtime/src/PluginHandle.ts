import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { PluginEvent } from './gen/plugins/runtime';

export class PluginHandle {
  readonly #worker: Worker;

  constructor(readonly pluginDir: string, readonly reply: (event: PluginEvent) => void) {
    const workerPath = process.env.YAAK_WORKER_PATH ?? path.join(__dirname, 'index.worker.cjs');
    this.#worker = new Worker(workerPath, {
      workerData: {
        pluginDir: this.pluginDir,
      },
    });

    this.#worker.on('message', this.reply);
    this.#worker.on('error', this.#handleError.bind(this));
    this.#worker.on('exit', this.#handleExit.bind(this));
  }

  sendToWorker(event: PluginEvent) {
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
