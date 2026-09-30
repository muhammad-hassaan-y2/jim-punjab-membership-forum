export type AppTheme = 'green' | 'blue' | 'black-gold';
export type AppLanguage = 'en' | 'ur';

export type PaymentMethod = 'Cash' | 'Online' | 'Cheque' | 'DD';
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'verified' | 'pending' | 'cancelled';

export interface FundCategory {
  id: string;
  nameEnglish: string;
  nameUrdu: string;
  color: string;
  type: TransactionType | 'both';
  isDefault?: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankNameUrdu: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branch: string;
}

export interface MonthlyContributions {
  jan?: number;
  feb?: number;
  mar?: number;
  apr?: number;
  may?: number;
  jun?: number;
  jul?: number;
  aug?: number;
  sep?: number;
  oct?: number;
  nov?: number;
  dec?: number;
}

export const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
export type MonthKey = typeof MONTH_KEYS[number];
export const MONTH_LABELS: Record<MonthKey, { en: string; ur: string }> = {
  jan: { en: 'Jan', ur: 'جنوری' },
  feb: { en: 'Feb', ur: 'فروری' },
  mar: { en: 'Mar', ur: 'مارچ' },
  apr: { en: 'Apr', ur: 'اپریل' },
  may: { en: 'May', ur: 'مئی' },
  jun: { en: 'Jun', ur: 'جون' },
  jul: { en: 'Jul', ur: 'جولائی' },
  aug: { en: 'Aug', ur: 'اگست' },
  sep: { en: 'Sep', ur: 'ستمبر' },
  oct: { en: 'Oct', ur: 'اکتوبر' },
  nov: { en: 'Nov', ur: 'نومبر' },
  dec: { en: 'Dec', ur: 'دسمبر' },
};

export interface Transaction {
  id: string;
  sheetId?: string;
  receiptNo: string;
  date: string; // ISO format: YYYY-MM-DD
  donorName: string; // اسم گرامی / نام دہندہ
  donorNameUrdu?: string;
  branchName?: string; // برانچ کا نام / شاخ
  zila?: string; // ضلع / District
  phone: string; // فون نمبر
  sarparastAla?: string; // سرپرست اعلیٰ
  profession?: string; // پیشہ / شعبہ (Profession / Category)
  address: string; // مکمل پتہ
  city?: string; // شہر
  reference?: string; // بتوسط (legacy/optional)
  preferredPeriod?: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Annually';
  monthlyAmount?: number | string; // ماہانہ رقم یا نشان (✓ / ✗ / custom text)
  quarterlyAmount?: number | string; // سہ ماہی رقم یا نشان
  halfYearlyAmount?: number | string; // شش ماہی رقم یا نشان
  annuallyAmount?: number | string; // سالانہ رقم یا نشان
  targetAmount?: number; // معینہ ہدف (Target Money)
  monthsData?: MonthlyContributions; // 12-Month Contribution breakdown
  amount: number; // کل وصول شدہ رقم (Total Paid / Collected Amount)
  amountInWordsUrdu?: string;
  amountInWordsEnglish?: string;
  categoryId?: string; // category key (defaults to membership)
  categoryName?: string;
  categoryNameUrdu?: string;
  paymentMode: PaymentMethod;
  bankName: string;
  chequeOrTxnNo: string;
  type: TransactionType;
  status: TransactionStatus;
  notes?: string;
  createdAt: string;
  customFields?: Record<string, any>;
}

export interface FinancialProject {
  id: string;
  name: string;
  year: number | string; // e.g. 2026
  description?: string;
  targetAmount?: number;
  createdAt: string;
}

export interface SheetTab {
  id: string;
  name: string;
  nameUrdu: string;
  projectId?: string;
  projectName?: string;
  projectYear?: number | string;
  cityName?: string;
  categoryFilter?: string;
  typeFilter?: TransactionType | 'all';
  color?: string;
  isCustom?: boolean;
  periodType?: 'monthly' | 'weekly' | 'annual' | 'custom' | 'raw' | 'template' | 'all';
  periodValue?: string;
  startDate?: string;
  endDate?: string;
  openingBalance?: number;
  sortOrder?: number;
}

export interface OrganizationConfig {
  nameEnglish: string;
  nameUrdu: string;
  subHeaderEnglish: string;
  subHeaderUrdu: string;
  locationEnglish: string;
  locationUrdu: string;
  phone: string;
  email: string;
  currency: string;
  currencySymbol: string;
  currencySymbolUrdu: string;
  receiptPrefix: string;
  receiptCounter: number;
  targetCollectionAmount?: number;
  signatoryName: string;
  signatoryTitle: string;
  stampOfficeText: string;
  duaUrdu: string;
  duaEnglish: string;
  bankAccounts: BankAccount[];
}

export interface DonorSummary {
  id: string;
  name: string;
  nameUrdu?: string;
  phone: string;
  address: string;
  totalDonated: number;
  totalReceipts: number;
  lastDonationDate: string;
  preferredCategory: string;
  reference: string;
}

export const COMMON_PROFESSIONS = [
  'Business / کاروبار',
  'Govt Service / سرکاری ملازمت',
  'Private Job / پرائیویٹ ملازمت',
  'Scholar / Ulama / عالم دین',
  'Teacher / Educator / استاد',
  'Doctor / Physician / ڈاکٹر',
  'Engineer / انجینئر',
  'Lawyer / Advocate / وکیل',
  'Trader / Shopkeeper / تاجر',
  'Agriculture / Farmer / زمیندار',
  'Overseas / بیرون ملک',
  'Student / طالب علم',
  'Other / دیگر',
] as const;

export const parseNumericAmount = (val: number | string | undefined | null): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim();
  if (str === '✓' || str === '✔' || str === '✗' || str === '❌' || str.toLowerCase() === 'x') return 0;
  const cleaned = str.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const isTickValue = (val: any): boolean => {
  if (val === true) return true;
  if (val === undefined || val === null) return false;
  const s = String(val).trim().toLowerCase();
  return s === '✓' || s === '✔' || s === 'tick' || s === 'true' || s === 'yes' || s === 'y' || s === 'ہاں' || s === 'صحیح';
};

export const isCrossValue = (val: any): boolean => {
  if (val === false) return true;
  if (val === undefined || val === null) return false;
  const s = String(val).trim().toLowerCase();
  return s === '✗' || s === '❌' || s === 'cross' || s === 'false' || s === 'no' || s === 'نہیں' || s === 'غلط' || s === 'x';
};

export const getTransactionTargetAmount = (tx: Partial<Transaction>): number => {
  if (tx.targetAmount !== undefined && tx.targetAmount > 0) return tx.targetAmount;
  const annual = parseNumericAmount(tx.annuallyAmount);
  if (annual > 0) return annual;
  const quarterly = parseNumericAmount(tx.quarterlyAmount);
  if (quarterly > 0) return quarterly * 4;
  const monthly = parseNumericAmount(tx.monthlyAmount);
  if (monthly > 0) return monthly * 12;
  return Number(tx.amount) || 0;
};


