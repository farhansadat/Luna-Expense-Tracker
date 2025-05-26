/**
 * Formats a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currencyCode The ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback formatting if the currency code is invalid
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}; 