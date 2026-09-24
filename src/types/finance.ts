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

export interface Transaction {
  id: string;
  receiptNo: string;
  date: string; // ISO format: YYYY-MM-DD
  donorName: string; // اسم گرامی
  donorNameUrdu?: string;
  phone: string;
  address: string; // مکمل پتہ
  city?: string; // شہر
  reference?: string; // بتوسط (legacy/optional)
  preferredPeriod?: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Annually';
  monthlyAmount?: number;
  quarterlyAmount?: number;
  halfYearlyAmount?: number;
  annuallyAmount?: number;
  amount: number; // کل رقم (Total Amount as Period)
  amountInWordsUrdu?: string;
  amountInWordsEnglish?: string;
  categoryId: string; // category key
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

export interface SheetTab {
  id: string;
  name: string;
  nameUrdu: string;
  categoryFilter?: string;
  typeFilter?: TransactionType | 'all';
  color?: string;
  isCustom?: boolean;
  periodType?: 'monthly' | 'weekly' | 'annual' | 'custom' | 'raw' | 'template' | 'all';
  periodValue?: string;
  startDate?: string;
  endDate?: string;
  openingBalance?: number;
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
