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
  address: string; // مکمل پتہ
  city?: string; // شہر
  reference?: string; // بتوسط (legacy/optional)
  preferredPeriod?: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Annually';
  monthlyAmount?: number; // ماہانہ رقم
  quarterlyAmount?: number; // سہ ماہی رقم
  halfYearlyAmount?: number; // شش ماہی رقم
  annuallyAmount?: number; // سالانہ رقم
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
