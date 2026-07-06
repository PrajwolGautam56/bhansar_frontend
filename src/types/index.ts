export type Role = 'ADMIN' | 'AGENT';
export type Stage = 'NEW' | 'INTERESTED' | 'NEGOTIATING' | 'ONBOARDING' | 'CLIENT' | 'LOST';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
}

export interface Company {
  _id: string;
  name: string;
  location?: string;
  district?: string;
  panNumber?: string;
  eximCode?: string;
  importProducts?: string[];
  importProductDetails?: Array<{
    name: string;
    hsCode?: string;
  }>;
  importFrequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'IRREGULAR';
  entryPort?: string;
  currentServiceProvider?: string;
  importTransactions?: Array<{
    startDate?: string;
    endDate?: string;
    amount?: number;
    currency?: string;
    notes?: string;
  }>;
  status?: 'LEAD' | 'INTERESTED' | 'ACTIVE_CLIENT' | 'INACTIVE';
  notes?: string;
  workingSince?: string;
}

export interface Lead {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  designation?: string;
  company?: Company;
  stage: Stage;
  lastCalledDate?: string;
  nextCallDate?: string;
  assignedTo?: User;
  remarks?: string;
  mutualPerson?: string;
  relatedLeads?: Lead[];
  relatedContacts?: Contact[];
}

export interface Contact {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  designation?: string;
  company?: Company;
  relationType: 'LEAD_CONTACT' | 'MUTUAL' | 'CLIENT_REFERRAL';
  linkedLeads?: Lead[];
  notes?: string;
}

export interface CallLog {
  _id: string;
  lead?: Lead;
  calledBy?: User;
  calledAt: string;
  callDurationSeconds?: number;
  outcome: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'NO_ANSWER';
  remarks?: string;
  nextAction?: string;
}

export interface Reminder {
  _id: string;
  lead?: Lead;
  assignedTo?: User;
  reminderDate: string;
  note?: string;
  isDone: boolean;
  urgency?: 'OVERDUE' | 'TODAY' | 'UPCOMING';
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
