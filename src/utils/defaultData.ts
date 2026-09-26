import { FundCategory, OrganizationConfig, Transaction, BankAccount } from '../types/finance';

export const defaultBankAccounts: BankAccount[] = [
  {
    id: 'bank-1',
    bankName: 'Allied Bank Limited (ABL)',
    bankNameUrdu: 'الائیڈ بینک کنڈیارو',
    accountTitle: 'Markaz Rooh ul Islam',
    accountNumber: '01234567890123',
    iban: 'PK12ABPA0001234567890123',
    branch: 'Main Branch',
  },
  {
    id: 'bank-2',
    bankName: 'Meezan Bank Limited',
    bankNameUrdu: 'میزان بینک اسلامک',
    accountTitle: 'Markaz Rooh ul Islam Markazi Fund',
    accountNumber: '99018273645123',
    iban: 'PK45MEZN0099018273645123',
    branch: 'Main Boulevard Branch',
  },
  {
    id: 'bank-3',
    bankName: 'Habib Bank Limited (HBL)',
    bankNameUrdu: 'حبیب بینک لمیٹڈ',
    accountTitle: 'Dargah Allah Abad Welfare',
    accountNumber: '44556677889900',
    iban: 'PK88HABB0044556677889900',
    branch: 'Naushahro Feroze Branch',
  }
];

export const defaultCategories: FundCategory[] = [
  {
    id: 'membership',
    nameEnglish: 'Membership Fund',
    nameUrdu: 'ممبر شپ فنڈ',
    color: '#059669', // emerald
    type: 'income',
    isDefault: true,
  },
];

export const defaultOrgConfig: OrganizationConfig = {
  nameEnglish: 'JIM Punjab',
  nameUrdu: 'جماعت اصلاح المسلمین پنجاب',
  subHeaderEnglish: 'Jamaat Islahul Muslimeen Punjab',
  subHeaderUrdu: 'پنجاب زون',
  locationEnglish: 'Punjab, Pakistan',
  locationUrdu: 'پنجاب، پاکستان',
  phone: '0300-1234567',
  email: 'info@jimpunjab.org',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  currencySymbolUrdu: 'روپے',
  receiptPrefix: 'REC-',
  receiptCounter: 1,
  targetCollectionAmount: 10000000,
  signatoryName: 'JIM PUNJAB ADMINISTRATION',
  signatoryTitle: 'AUTHORIZED SIGNATORY',
  stampOfficeText: 'JAMAAT ISLAHUL MUSLIMEEN PUNJAB\nFINANCE & ACCOUNTS DEPARTMENT\nAUTHORIZED OFFICIAL STAMP',
  duaUrdu: 'جَزَاكُمُ اللَّهُ خَيْرًا كَثِيرًا وَأَجْرًا كَبِيرًا وَأَحْسَنَ الْجَزَاءَ فِي الدُّنْيَا وَالْآخِرَةِ',
  duaEnglish: 'May Allah reward you with abundant goodness and best reward in this world and the Hereafter.',
  bankAccounts: defaultBankAccounts,
};

export const defaultTransactions: Transaction[] = [];

