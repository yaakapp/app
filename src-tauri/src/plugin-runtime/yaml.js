((globalThis) => {
  const core = Deno.core;
  globalThis.YAML = {
    parse: core.ops.op_yaml_parse,
    stringify: core.ops.op_yaml_stringify,
  };
})(globalThis);
