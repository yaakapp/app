import { sleep } from './sleep';

/** Ensures a promise takes at least a certain number of milliseconds to resolve */
export async function minPromiseMillis<T>(promise: Promise<T>, millis = 300) {
  const start = Date.now();
  let result;
  let err;

  try {
    result = await promise;
  } catch (e) {
    err = e;
    const delayFor = millis - (Date.now() - start);
    await sleep(delayFor);
    throw err;
  }

  const delayFor = millis - (Date.now() - start);
  await sleep(delayFor);
  return result;
}
