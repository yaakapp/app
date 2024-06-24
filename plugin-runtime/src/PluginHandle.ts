import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { PluginInfo } from './plugins';

export interface PluginEvent<T = any> {
  event: string;
  payload?: T;
  callbackId?: string;
}

export class PluginHandle {
  readonly pluginDir: string;
  readonly #worker: Worker;

  constructor(pluginDir: string) {
    this.pluginDir = pluginDir;

    this.#worker = new Worker(path.resolve(__filename, '../plugin-worker.ts'), {
      workerData: {
        pluginDir: this.pluginDir,
      },
    });

    this.#worker.on('error', this.handleError);
    this.#worker.on('exit', this.handleExit);
  }

  async getInfo(): Promise<PluginInfo> {
    return this.#callPlugin({ event: 'info' });
  }

  async runImport(data: string): Promise<string> {
    const result = await this.#callPlugin({
      event: 'run-import',
      payload: data,
    });
    return result as string;
  }

  #callPlugin<T>(event: PluginEvent): Promise<T> {
    return new Promise((resolve) => {
      const callbackId = `callback-${Math.random().toString()}`;
      event.callbackId = callbackId;

      const cb = (e: PluginEvent<T>) => {
        if (e.event === callbackId) {
          resolve(e.payload as T);
          this.#worker.removeListener('message', cb);
        }
      };

      this.#worker.addListener('message', cb);
      this.#worker.postMessage(event);
    });
  }

  private async handleError(err: Error) {
    console.log('PLUGIN ERROR', this.pluginDir, err);
  }

  private async handleExit(code: number) {
    if (code === 0) {
      console.log('PLUGIN EXITED SUCCESSFULLY');
    } else {
      console.log('PLUGIN EXITED CODE', code);
    }
  }
}
