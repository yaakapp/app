import { greet } from './greet.js';

export function hello() {
  greet();
  console.log('Try JSON parse', JSON.parse(`{ "hello": 123 }`).hello);
  console.log('Try RegExp', '123'.match(/[\d]+/));
}
