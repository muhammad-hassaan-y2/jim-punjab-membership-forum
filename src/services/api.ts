import { Transaction, SheetTab, FundCategory, OrganizationConfig } from '../types/finance';

const BASE_URL = '/api';

export interface HealthResponse {
  status: string;
  database: string;
  latencyMs: number;
  time?: string;
  error?: string;
}

export const api = {
  // Check health and connection to Neon DB
  async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return { status: 'error', database: 'Neon PostgreSQL', latencyMs: 0, error: err.message };
    }
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${BASE_URL}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions from Neon DB');
    return await res.json();
  },

  async createTransaction(tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }): Promise<Transaction> {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (!res.ok) throw new Error('Failed to create transaction in Neon DB');
    return await res.json();
  },

  async updateTransaction(id: string, tx: Partial<Transaction>): Promise<void> {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    if (!res.ok) throw new Error('Failed to update transaction in Neon DB');
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete transaction from Neon DB');
  },

  async clearAllTransactions(): Promise<void> {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear transactions from Neon DB');
  },

  async bulkSaveTransactions(transactions: Transaction[], replaceAll = false): Promise<void> {
    const res = await fetch(`${BASE_URL}/transactions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, replaceAll }),
    });
    if (!res.ok) throw new Error('Failed to bulk save transactions in Neon DB');
  },

  // Sheet Tabs
  async getSheets(): Promise<SheetTab[]> {
    const res = await fetch(`${BASE_URL}/sheets`);
    if (!res.ok) throw new Error('Failed to fetch sheet tabs');
    return await res.json();
  },

  async syncSheets(sheets: SheetTab[]): Promise<void> {
    const res = await fetch(`${BASE_URL}/sheets/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheets }),
    });
    if (!res.ok) throw new Error('Failed to sync sheet tabs');
  },

  async deleteSheet(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/sheets?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete sheet from Neon DB');
  },

  async updateSheet(id: string, updates: { name?: string; cityName?: string; nameUrdu?: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/sheets`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update sheet in Neon DB');
  },

  // Categories
  async getCategories(): Promise<FundCategory[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  },

  async syncCategories(categories: FundCategory[]): Promise<void> {
    const res = await fetch(`${BASE_URL}/categories/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    });
    if (!res.ok) throw new Error('Failed to sync categories');
  },

  // Config
  async getConfig(): Promise<OrganizationConfig | null> {
    const res = await fetch(`${BASE_URL}/config`);
    if (!res.ok) throw new Error('Failed to fetch organization config');
    return await res.json();
  },

  async saveConfig(config: OrganizationConfig): Promise<void> {
    const res = await fetch(`${BASE_URL}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to save organization config');
  },
};
