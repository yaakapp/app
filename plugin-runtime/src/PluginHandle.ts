import path from 'node:path';
import { Worker } from 'node:worker_threads';

export class PluginHandle {
  pluginDir: string;
  name: string;
  worker: Worker;

  constructor(pluginDir: string) {
    this.pluginDir = pluginDir;
    this.name = '';
  }

  async boot() {
    return new Promise<void>((resolve, reject) => {
      this.worker = new Worker(path.resolve(__filename, '../plugin-worker.ts'), {
        workerData: {
          pluginDir: this.pluginDir,
        },
      });

      this.worker.once('message', (msg: { event: string; payload: any }) => {
        if (msg.event === 'initialized') {
          this.name = msg.payload.name;
          resolve();
        }
      });
      this.worker.on('message', this.handleMessage);
      this.worker.on('error', this.handleError);
      this.worker.on('exit', this.handleExit);
    });
  }

  async runImport(data: string): Promise<string> {
    return new Promise((resolve) => {
      this.worker.postMessage({
        event: 'run-import',
        payload: data,
      });
      this.worker.on('message', (msg) => {
        if (msg.event === 'run-import-response') {
          console.log('RESPONSE', msg.payload);
          resolve(msg.payload);
        }
      });
    });
  }

  private async handleMessage(msg: { event: string; payload: any }) {
    switch (msg.event) {
      case 'initialized':
        // console.log('INITIALIZED PLUGIN', msg.payload);
        break;
      default:
        console.log('UNKNOWN EVENT', msg);
    }
  }

  private async handleError(err: Error) {
    console.log('PLUGIN ERROR', err);
  }

  private async handleExit(code: number) {
    if (code === 0) {
      console.log('PLUGIN EXITED SUCCESSFULLY');
    } else {
      console.log('PLUGIN EXITED CODE', code);
    }
  }
}
