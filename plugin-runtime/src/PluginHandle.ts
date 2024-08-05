import path from 'node:path';
import { Worker } from 'node:worker_threads';

export class PluginHandle {
  readonly pluginDir: string;
  readonly #worker: Worker;

  constructor(pluginDir: string) {
    this.pluginDir = pluginDir;

    const workerPath = path.join(__dirname, 'index.worker.cjs');
    this.#worker = new Worker(workerPath, {
      workerData: {
        pluginDir: this.pluginDir,
      },
    });

    this.#worker.on('error', this.#handleError.bind(this));
    this.#worker.on('exit', this.#handleExit.bind(this));
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
