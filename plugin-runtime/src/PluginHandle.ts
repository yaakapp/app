import { YaakPlugin } from '@yaakapp/api';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { Callback } from './gen/yaak/common/callback';

export interface ParentToWorkerAccessEvent extends ParentToWorkerBaseEvent {
  access: keyof YaakPlugin;
}

export interface ParentToWorkerMetaEvent extends ParentToWorkerBaseEvent {
  meta: 'info';
}

export interface ParentToWorkerInvokeEvent<A> extends ParentToWorkerBaseEvent {
  invoke: keyof YaakPlugin;
  args: A;
}

export interface ParentToWorkerCallbackEvent<A extends Array<any>> extends ParentToWorkerBaseEvent {
  callback: Callback;
  args: A;
}

export interface ParentToWorkerBaseEvent {
  replyId: string;
}

export type WorkerToParentSuccessEvent<P> = {
  replyId: string;
  payload: P;
};

export type WorkerToParentErrorEvent = {
  replyId: string;
  error: string;
};

export type WorkerToParentEvent<T = any> = WorkerToParentErrorEvent | WorkerToParentSuccessEvent<T>;

export class PluginHandle {
  readonly pluginDir: string;
  readonly #worker: Worker;
  #callbacks: Record<string, Function> = {};

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

  invoke<A, R>(name: ParentToWorkerInvokeEvent<A>['invoke'], args: A): Promise<R> {
    return this.#postUnaryMessage({ invoke: name, args });
  }

  access<N extends ParentToWorkerAccessEvent['access'], R extends YaakPlugin[N]>(
    name: N,
  ): Promise<NonNullable<R>> {
    return this.#postUnaryMessage({ access: name });
  }

  meta<R>(name: ParentToWorkerMetaEvent['meta']): Promise<R> {
    return this.#postUnaryMessage({ meta: name });
  }

  callback<A extends Array<unknown>, R>(
    callback: ParentToWorkerCallbackEvent<A>['callback'],
    args: ParentToWorkerCallbackEvent<A>['args'],
  ): Promise<R> {
    return this.#postUnaryMessage({ callback, args });
  }

  #postUnaryMessage<R = void>(msg: Record<string, any>): Promise<R> {
    const replyId = `msg_${randomUUID().replaceAll('-', '')}`;
    return new Promise((resolve, reject) => {
      const cb = (m: WorkerToParentEvent<R>) => {
        if (m.replyId !== replyId) return;

        if ('error' in m) {
          reject(m.error);
          return;
        }

        // Convert callback functions to callback-id objects, so they can be serialized
        // TODO: Parse recursively
        console.log('CONVERTING PAYLOAD', m.payload);
        if (Object.prototype.toString.call(m.payload) === '[object Object]') {
          for (const key of Object.keys(m.payload as any)) {
            const value = m.payload[key];
            if (
              Object.prototype.toString.call(value) === '[object Object]' &&
              Object.keys(value).length === 1 &&
              'id' in value
            ) {
              console.log('CONVERTING CALLBACK', value);
              const callback: Callback = value;
              const callbackId = callback.id;
              const callbackFn = (...args: any[]) => this.callback(callback, args);
              this.#callbacks[callbackId] = callbackFn;
              m.payload[key] = callbackFn;
            }
          }
        }
        console.log('CONVERTED VALUE', m.payload);
        resolve(m.payload as R);

        this.#worker.removeListener('message', cb);
      };

      this.#worker.addListener('message', cb);
      this.#worker.postMessage({ ...msg, replyId });
    });
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
