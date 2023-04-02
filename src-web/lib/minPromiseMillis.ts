import { sleep } from './sleep';

export async function minPromiseMillis<T>(promise: Promise<T>, millis: number) {
  const start = Date.now();
  const result = await promise;
  const delayFor = millis - (Date.now() - start);
  await sleep(delayFor);
  return result;
}
