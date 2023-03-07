import { describe, expect, it } from 'vitest';
import { generateColorVariant, toTailwindVariable } from './theme';

describe('suite name', () => {
  it('Generates dark variants', () => {
    expect(generateColorVariant('blue', 50, 'dark')).toEqual('hsl(240,100%,5.0%)');
    expect(generateColorVariant('blue', 100, 'dark')).toEqual('hsl(240,100%,10.0%)');
    expect(generateColorVariant('blue', 200, 'dark')).toEqual('hsl(240,100%,20.0%)');
    expect(generateColorVariant('blue', 300, 'dark')).toEqual('hsl(240,100%,30.0%)');
    expect(generateColorVariant('blue', 400, 'dark')).toEqual('hsl(240,100%,40.0%)');
    expect(generateColorVariant('blue', 500, 'dark')).toEqual('hsl(240,100%,50.0%)');
    expect(generateColorVariant('blue', 600, 'dark')).toEqual('hsl(240,100%,60.0%)');
    expect(generateColorVariant('blue', 700, 'dark')).toEqual('hsl(240,100%,70.0%)');
    expect(generateColorVariant('blue', 800, 'dark')).toEqual('hsl(240,100%,80.0%)');
    expect(generateColorVariant('blue', 900, 'dark')).toEqual('hsl(240,100%,90.0%)');
    expect(generateColorVariant('blue', 950, 'dark')).toEqual('hsl(240,100%,95.0%)');
  });
  it('Generates light variants', () => {
    expect(generateColorVariant('blue', 50, 'light')).toEqual('hsl(240,100%,95.0%)');
    expect(generateColorVariant('blue', 100, 'light')).toEqual('hsl(240,100%,90.0%)');
    expect(generateColorVariant('blue', 200, 'light')).toEqual('hsl(240,100%,80.0%)');
    expect(generateColorVariant('blue', 300, 'light')).toEqual('hsl(240,100%,70.0%)');
    expect(generateColorVariant('blue', 400, 'light')).toEqual('hsl(240,100%,60.0%)');
    expect(generateColorVariant('blue', 500, 'light')).toEqual('hsl(240,100%,50.0%)');
    expect(generateColorVariant('blue', 600, 'light')).toEqual('hsl(240,100%,40.0%)');
    expect(generateColorVariant('blue', 700, 'light')).toEqual('hsl(240,100%,30.0%)');
    expect(generateColorVariant('blue', 800, 'light')).toEqual('hsl(240,100%,20.0%)');
    expect(generateColorVariant('blue', 900, 'light')).toEqual('hsl(240,100%,10.0%)');
    expect(generateColorVariant('blue', 950, 'light')).toEqual('hsl(240,100%,5.0%)');
  });
});

describe('Generates Tailwind color', () => {
  it('Does it', () => {
    expect(
      toTailwindVariable({ name: 'blue', cssColor: 'hsl(10, 20%, 30%)', variant: 100 }),
    ).toEqual('--color-blue-100: 10 20% 30%;');
  });
});
