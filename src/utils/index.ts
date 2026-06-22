export function createPageUrl(pageName: string) {
  return '/' + pageName.replace(/ /g, '-');
}

export function formatCurrency(
  value: number,
  currencyOrCompact: string | boolean = 'USD',
  compact = false,
): string {
  let currency = 'USD';
  let isCompact = false;
  if (typeof currencyOrCompact === 'boolean') {
    isCompact = currencyOrCompact;
  } else {
    currency = currencyOrCompact || 'USD';
    isCompact = compact;
  }
  if (isCompact) {
    if (value >= 1_000_000) return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${currency} ${(value / 1_000).toFixed(1)}k`;
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
