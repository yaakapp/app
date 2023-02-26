console.log('---------------------------');
console.log('- 👋 Hello from plugin.ts -');
console.log('---------------------------');

Deno.core.opAsync('op_hello', 'World');
