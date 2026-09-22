/**
 * Converts a number to Urdu words (ہندسوں سے الفاظ)
 * Supports up to Arab (ارب) and handles proper Urdu numerical phrasing
 */

const urduOnes: { [key: number]: string } = {
  0: 'صفر',
  1: 'ایک',
  2: 'دو',
  3: 'تین',
  4: 'چار',
  5: 'پانچ',
  6: 'چھ',
  7: 'سات',
  8: 'آٹھ',
  9: 'نو',
  10: 'دس',
  11: 'گیارہ',
  12: 'بارہ',
  13: 'تیرہ',
  14: 'چودہ',
  15: 'پندرہ',
  16: 'سولہ',
  17: 'سترہ',
  18: 'اٹھارہ',
  19: 'انیس',
  20: 'بیس',
  21: 'اکیس',
  22: 'بائیس',
  23: 'تیئیس',
  24: 'چوبیس',
  25: 'پچیس',
  26: 'چھبیس',
  27: 'ستائیس',
  28: 'اٹَھائیس',
  29: 'انتیس',
  30: 'تیس',
  31: 'اکتیس',
  32: 'بتیس',
  33: 'تینتیس',
  34: 'چونتیس',
  35: 'پینتیس',
  36: 'چھتیس',
  37: 'سینتیس',
  38: 'اڑتیس',
  39: 'انتالیس',
  40: 'چالیس',
  41: 'اکتالیس',
  42: 'بیالیس',
  43: 'تینتالیس',
  44: 'چوالیس',
  45: 'پینتالیس',
  46: 'چھینتالیس',
  47: 'سینتالیس',
  48: 'اڑتالیس',
  49: 'انچاس',
  50: 'پچاس',
  51: 'اکیاون',
  52: 'باون',
  53: 'ترپن',
  54: 'چون',
  55: 'پچپن',
  56: 'چھپن',
  57: 'ستاون',
  58: 'اٹھاون',
  59: 'انسٹھ',
  60: 'ساٹھ',
  61: 'اکسٹھ',
  62: 'باسٹھ',
  63: 'تریسٹھ',
  64: 'چونسٹھ',
  65: 'پینسٹھ',
  66: 'چھیاسٹھ',
  67: 'سڑسٹھ',
  68: 'اڑسٹھ',
  69: 'انہتر',
  70: 'ستر',
  71: 'اکہتر',
  72: 'بہتر',
  73: 'تہتر',
  74: 'چوہتر',
  75: 'پچہتر',
  76: 'چھہتر',
  77: 'ستتر',
  78: 'اٹھتر',
  79: 'اناسی',
  80: 'اسی',
  81: 'اکیاسی',
  82: 'بیاسی',
  83: 'تراسی',
  84: 'چوراسی',
  85: 'پچاسی',
  86: 'چھیاسی',
  87: 'ستاسی',
  88: 'اٹھاسی',
  89: 'نواسی',
  90: 'نوے',
  91: 'اکیانوے',
  92: 'بانوے',
  93: 'ترانوے',
  94: 'چورانوے',
  95: 'پچانوے',
  96: 'چھانوے',
  97: 'ستانوے',
  98: 'اٹھانوے',
  99: 'نناوے',
};

export function convertNumberToUrduWords(num: number, appendRupees: boolean = true): string {
  if (isNaN(num) || num === null || num === undefined) return '';
  num = Math.floor(Math.abs(num));
  if (num === 0) return appendRupees ? 'صفر روپے فقط' : 'صفر';

  const parts: string[] = [];

  // Arab (ارب) = 1,00,00,00,000
  const arab = Math.floor(num / 1000000000);
  if (arab > 0) {
    parts.push(`${convertNumberToUrduWords(arab, false)} ارب`);
    num %= 1000000000;
  }

  // Crore (کروڑ) = 1,00,00,000
  const crore = Math.floor(num / 10000000);
  if (crore > 0) {
    parts.push(`${convertNumberToUrduWords(crore, false)} کروڑ`);
    num %= 10000000;
  }

  // Lakh (لاکھ) = 1,00,000
  const lakh = Math.floor(num / 100000);
  if (lakh > 0) {
    parts.push(`${convertNumberToUrduWords(lakh, false)} لاکھ`);
    num %= 100000;
  }

  // Hazar (ہزار) = 1,000
  const hazar = Math.floor(num / 1000);
  if (hazar > 0) {
    parts.push(`${convertNumberToUrduWords(hazar, false)} ہزار`);
    num %= 1000;
  }

  // Sau (سو) = 100
  const sau = Math.floor(num / 100);
  if (sau > 0) {
    parts.push(`${urduOnes[sau] || convertNumberToUrduWords(sau, false)} سو`);
    num %= 100;
  }

  // 1 - 99
  if (num > 0) {
    if (urduOnes[num]) {
      parts.push(urduOnes[num]);
    }
  }

  const result = parts.join(' ').trim();
  if (appendRupees) {
    return `${result} روپے فقط`;
  }
  return result;
}
