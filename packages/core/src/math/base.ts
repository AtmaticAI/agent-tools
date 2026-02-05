import type { BaseConversionResult, NumberBase } from './types';

const radixMap: Record<NumberBase, number> = {
  binary: 2,
  octal: 8,
  decimal: 10,
  hex: 16,
};

export function convertBase(input: string, fromBase: NumberBase): BaseConversionResult {
  const radix = radixMap[fromBase];
  if (radix === undefined) {
    throw new Error(`Unknown base: ${fromBase}`);
  }

  // Strip common prefixes before parsing
  let cleanInput = input.trim();
  if (fromBase === 'binary' && cleanInput.startsWith('0b')) {
    cleanInput = cleanInput.slice(2);
  } else if (fromBase === 'octal' && cleanInput.startsWith('0o')) {
    cleanInput = cleanInput.slice(2);
  } else if (fromBase === 'hex' && cleanInput.startsWith('0x')) {
    cleanInput = cleanInput.slice(2);
  }

  const decimalValue = parseInt(cleanInput, radix);
  if (isNaN(decimalValue)) {
    throw new Error(`Invalid input '${input}' for base '${fromBase}'`);
  }

  return {
    input,
    fromBase,
    binary: '0b' + decimalValue.toString(2),
    octal: '0o' + decimalValue.toString(8),
    decimal: decimalValue.toString(10),
    hex: '0x' + decimalValue.toString(16),
  };
}
