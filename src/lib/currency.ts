export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    CNY: '¥',
    INR: '₹',
    NZD: 'NZ$',
  };
  return symbols[currency] || currency;
};

export const formatCurrency = (amount: number, currency: string = 'USD', useLargeNumberFormat: boolean = false) => {
  if (amount === null || amount === undefined) return '';

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  if (useLargeNumberFormat && amount >= 1000000) {
    return formatter.format(amount / 1000000) + 'M';
  } else if (useLargeNumberFormat && amount >= 1000) {
    return formatter.format(amount / 1000) + 'K';
  }

  return formatter.format(amount);
}; 