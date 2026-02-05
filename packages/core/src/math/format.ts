import type { NumberFormatOptions } from './types';

export function formatNumber(value: number, options?: NumberFormatOptions): string {
  const locale = options?.locale ?? 'en-US';

  const formatOptions: Intl.NumberFormatOptions = {};

  if (options?.style) {
    formatOptions.style = options.style;
  }

  if (options?.currency) {
    formatOptions.currency = options.currency;
  }

  if (options?.minimumFractionDigits !== undefined) {
    formatOptions.minimumFractionDigits = options.minimumFractionDigits;
  }

  if (options?.maximumFractionDigits !== undefined) {
    formatOptions.maximumFractionDigits = options.maximumFractionDigits;
  }

  return new Intl.NumberFormat(locale, formatOptions).format(value);
}
