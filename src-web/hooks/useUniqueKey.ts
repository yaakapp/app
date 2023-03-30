import { useState } from 'react';

export function useUniqueKey(len = 10): { key: string; regenerate: () => void } {
  const [key, setKey] = useState<string>(() => generate(len));
  return { key, wasUpdatedExternally: () => setKey(generate(len)) };
}

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generate(len: number): string {
  const chars = [];
  for (let i = 0; i < len; i++) {
    chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
  }
  return chars.join('');
}
