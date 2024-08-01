import { YaakPlugin } from '@yaakapp/api';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { Callback } from './gen/yaak/common/callback';

export type ParentToWorkerAccessEvent = {
  replyId: string;
  access: keyof YaakPlugin;
};

export type ParentToWorkerMetaEvent = {
  replyId: string;
  meta: 'info';
};

export type ParentToWorkerInvokeEvent<A> = {
  replyId: string;
  invoke: keyof YaakPlugin;
  args: A;
};

export type ParentToWorkerCallbackEvent<A> = {
  replyId: string;
  callback: Callback;
  args: A;
};

export type ParentToWorkerEvent<T> =
  | ParentToWorkerAccessEvent
  | ParentToWorkerMetaEvent
  | ParentToWorkerInvokeEvent<T>
  | ParentToWorkerCallbackEvent<T>;

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
    return this.#postMessage({ invoke: name, args });
  }

  access<N extends ParentToWorkerAccessEvent['access'], R extends YaakPlugin[N]>(
    name: N,
  ): Promise<NonNullable<R>> {
    return this.#postMessage({ access: name });
  }

  meta<R>(name: ParentToWorkerMetaEvent['meta']): Promise<R> {
    return this.#postMessage({ meta: name });
  }

  callback<A, R>(
    callback: ParentToWorkerCallbackEvent<A>['callback'],
    args: ParentToWorkerCallbackEvent<A>['args'],
  ): Promise<R> {
    return this.#postMessage({ callback, args });
  }

  #postMessage<R = void>(
    message: Omit<ParentToWorkerAccessEvent | ParentToWorkerInvokeEvent<R>, 'replyId'>,
  ): Promise<R> {
    const replyId = `msg_${randomUUID().replaceAll('-', '')}`;
    return new Promise((resolve, reject) => {
      const cb = (e: WorkerToParentEvent<R>) => {
        if (e.replyId !== replyId) return;

        if ('error' in e) {
          reject(e.error);
        } else {
          resolve(e.payload as R);
        }

        this.#worker.removeListener('message', cb);
      };

      this.#worker.addListener('message', cb);
      this.#worker.postMessage(message);
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
