import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { PluginInfo } from './plugins';

export interface ParentToWorkerEvent<T = any> {
  name: string;
  callbackId: string;
  payload?: T;
}

export interface WorkerToParentEvent<T = any> {
  callbackId: string;
  payload: T;
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
    const callbackId = `callback-${Math.random().toString()}`;
    return this.#callPlugin({ name: 'info', callbackId });
  }

  async runFilter({ filter, body }: { filter: string; body: string }): Promise<string> {
    return this.#callPlugin({
      callbackId: `callback-${Math.random().toString()}`,
      name: 'run-filter',
      payload: { filter, body },
    });
  }

  async runImport(data: string): Promise<string> {
    return this.#callPlugin({
      callbackId: `callback-${Math.random().toString()}`,
      name: 'run-import',
      payload: data,
    });
  }

  #callPlugin<T>(event: ParentToWorkerEvent): Promise<T> {
    return new Promise((resolve) => {
      const cb = (e: WorkerToParentEvent<T>) => {
        if (e.callbackId === event.callbackId) {
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
