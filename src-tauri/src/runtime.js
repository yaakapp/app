(function (globalThis) {
  // Deno.core.print(Object.keys(Deno.core).join('\n'));

  function argsToMessage(...args) {
    return args.map((arg) => JSON.stringify(arg)).join(' ');
  }

  globalThis.console = {
    log: (...args) => {
      Deno.core.print(`[log]: ${argsToMessage(...args)}\n`, false);
    },
    error: (...args) => {
      Deno.core.print(`[err]: ${argsToMessage(...args)}\n`, true);
    },
  };
})(globalThis);
