import { isJSString } from './types.js';

export function parseVariables(data) {
  return Object.entries(data).map(([name, value]) => ({
    enabled: true,
    name,
    value: `${value}`,
  }));
}

/**
 * Convert Insomnia syntax to Yaak syntax
 * @param {string} variable - Text to convert
 */
export function convertSyntax(variable) {
  if (!isJSString(variable)) return variable;
  return variable.replaceAll(/{{\s*(_\.)?([^}]+)\s*}}/g, '${[$2]}');
}
