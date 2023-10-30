import { hello } from './hello.js';

export function entrypoint() {
  hello();
  console.log('Try JSON parse', JSON.parse(`{ "hello": 123 }`).hello);
  console.log('Try RegExp', '123'.match(/[\d]+/));
}
