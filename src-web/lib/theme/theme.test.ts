import { describe, expect, it } from 'vitest';
import { generateColorVariant, toTailwindVariable } from './theme';

describe('Generate colors', () => {
  it('Generates dark colors', () => {
    expect(generateColorVariant('hsl(0,0%,50%)', 50, 'dark', 0.2, 0.8)).toBe('hsl(0,0%,14.0%)');
    expect(generateColorVariant('hsl(0,0%,50%)', 950, 'dark', 0.2, 0.8)).toBe('hsl(0,0%,77.0%)');
    expect(generateColorVariant('hsl(0,0%,50%)', 50, 'dark', 0.4, 0.6)).toBe('hsl(0,0%,23.0%)');
    expect(generateColorVariant('hsl(0,0%,50%)', 950, 'dark', 0.4, 0.6)).toBe('hsl(0,0%,59.0%)');
  });
  it('Generates light colors', () => {
    expect(generateColorVariant('hsl(0,0%,50%)', 50, 'light', 0.2, 0.8)).toBe('hsl(0,0%,80.0%)');
    expect(generateColorVariant('hsl(0,0%,50%)', 950, 'light', 0.2, 0.8)).toBe('hsl(0,0%,14.0%)');
    expect(generateColorVariant('hsl(0,0%,50%)', 50, 'light', 0.4, 0.6)).toBe('hsl(0,0%,60.0%)');
    expect(generateColorVariant('hsl(0,0%,50%)', 950, 'light', 0.4, 0.6)).toBe('hsl(0,0%,23.0%)');
  });
});

describe('Generates Tailwind color', () => {
  it('Does it', () => {
    expect(
      toTailwindVariable({ name: 'blue', cssColor: 'hsl(10, 20%, 30%)', variant: 100 }),
    ).toEqual('--color-blue-100: 10 20% 30%;');
  });
});
