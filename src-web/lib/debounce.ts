export function debounce(fn: (...args: any[]) => any, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  const result = function (...args: Parameters<typeof fn>) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  result.cancel = function () {
    clearTimeout(timer);
  };
  return result;
}
