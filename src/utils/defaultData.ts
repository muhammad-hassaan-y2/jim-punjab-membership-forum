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
    id: 'zakat',
    nameEnglish: 'Zakat',
    nameUrdu: 'زکوٰۃ',
    color: '#059669', // emerald
    type: 'income',
    isDefault: true,
  },
  {
    id: 'fitrat',
    nameEnglish: 'Fitrat',
    nameUrdu: 'فطرت / فطرانہ',
    color: '#0284c7', // sky
    type: 'income',
    isDefault: true,
  },
  {
    id: 'sadqat',
    nameEnglish: 'Sadqat',
    nameUrdu: 'صدقات',
    color: '#d97706', // amber
    type: 'income',
    isDefault: true,
  },
  {
    id: 'khirat',
    nameEnglish: 'Khirat',
    nameUrdu: 'خیرات',
    color: '#7c3aed', // violet
    type: 'income',
    isDefault: true,
  },
  {
    id: 'charam_qurbani',
    nameEnglish: 'Charam Qurbani',
    nameUrdu: 'چرم قربانی',
    color: '#dc2626', // red
    type: 'income',
    isDefault: true,
  },
  {
    id: 'membership',
    nameEnglish: 'Membership',
    nameUrdu: 'ممبر شپ',
    color: '#2563eb', // blue
    type: 'income',
    isDefault: true,
  },
  {
    id: 'madrassah',
    nameEnglish: 'Madrassah',
    nameUrdu: 'مدرسہ',
    color: '#0d9488', // teal
    type: 'income',
    isDefault: true,
  },
];

export const defaultOrgConfig: OrganizationConfig = {
  nameEnglish: 'Markaz Rooh ul Islam',
  nameUrdu: 'مرکز روح الاسلام',
  subHeaderEnglish: 'Islamic Research, Educational & Welfare Foundation',
  subHeaderUrdu: 'اسلامی تعلیمی و فلاحی ادارہ',
  locationEnglish: 'Pakistan',
  locationUrdu: 'پاکستان',
  phone: '0300-1234567',
  email: 'info@markazroohulislam.org',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  currencySymbolUrdu: 'روپے',
  receiptPrefix: 'REC-',
  receiptCounter: 1,
  signatoryName: 'MARKAZ ADMINISTRATION',
  signatoryTitle: 'AUTHORIZED SIGNATORY',
  stampOfficeText: 'MARKAZ ROOH UL ISLAM\nFINANCE & ACCOUNTS DEPARTMENT\nAUTHORIZED OFFICIAL STAMP',
  duaUrdu: 'جَزَاكُمُ اللَّهُ خَيْرًا كَثِيرًا وَأَجْرًا كَبِيرًا وَأَحْسَنَ الْجَزَاءَ فِي الدُّنْيَا وَالْآخِرَةِ',
  duaEnglish: 'May Allah reward you with abundant goodness and best reward in this world and the Hereafter.',
  bankAccounts: defaultBankAccounts,
};

export const defaultTransactions: Transaction[] = [];

