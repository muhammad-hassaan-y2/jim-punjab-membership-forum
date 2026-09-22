/**
 * Converts a number to English words
 */

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  if (num < 20) return ones[num];
  if (num < 100) {
    const unit = num % 10;
    return tens[Math.floor(num / 10)] + (unit ? ' ' + ones[unit] : '');
  }
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return ones[hundred] + ' Hundred' + (remainder ? ' and ' + convertLessThanThousand(remainder) : '');
}

export function convertNumberToEnglishWords(num: number, appendCurrency: string = 'Rupees Only'): string {
  if (isNaN(num) || num === null || num === undefined) return '';
  num = Math.floor(Math.abs(num));
  if (num === 0) return `Zero ${appendCurrency}`.trim();

  const billion = Math.floor(num / 1000000000);
  const million = Math.floor((num % 1000000000) / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  const parts: string[] = [];

  if (billion > 0) {
    parts.push(convertLessThanThousand(billion) + ' Billion');
  }
  if (million > 0) {
    parts.push(convertLessThanThousand(million) + ' Million');
  }
  if (thousand > 0) {
    parts.push(convertLessThanThousand(thousand) + ' Thousand');
  }
  if (remainder > 0) {
    parts.push(convertLessThanThousand(remainder));
  }

  const result = parts.join(' ').trim();
  return appendCurrency ? `${result} ${appendCurrency}`.trim() : result;
}
