/* eslint-disable @typescript-eslint/no-explicit-any */

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface IClient {
  id: string;
  identifier?: string | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  zipcode: string;
  city: string;
  country: string;
  phoneNumber?: string | null;
  neqNumber?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: IUser;
  invoices: IInvoice[];
}

export interface IUser {
  [x: string]: any;
  id?: string;
  identifier?: string;
  firstName: string;
  lastName: string;
  password?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zipcode: string;
  status: boolean;
  role: "ADMIN" | "USER";
  token?: string;
  stripeCustomerId?: string;
  companyId?: string;
  company: ICompany;
  length?: number;
  resetToken?: string;
  currentSubscriptionId?: string;
  subscriptions?: any[];
  createdAt?: any;
}

export interface ICompany {
  logo: string | null | undefined;
  id: string;
  name: string;
  identifier?: string;
  address: string;
  city: string;
  credits: number;
  country: string;
  zipcode: string;
  phone: string;
  email: string;
  userId: string;
  neqNumber?: string;
  tvqNumber?: string;
  tpsNumber?: string;
  tvaNumber?: string;
  createdAt: string;
  updatedAt: string;
  user: IUser;
  planType?: string;
  billingCycle?: string;
  maxUsers?: number;
  invoiceCredit?: number;
  receiptCredit?: number;
  limitResetDate?: any;
}

export interface IPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  prices: IPrice[];
  monthlyPriceId: string;
  annualPriceId: string;
  monthlyPrice: number;
  annualPrice: number;
}

export interface IPrice {
  id: string;
  amount: number;
  currency: string;
  interval: string;
}

export interface IPaiement {
  id: string;
  userId: string;
  user: IUser;
  storeName: string;
  date: string;
  totalAmount: number;
  taxesAmount?: number | null;
  items?: string | null;
  scannedImage?: string | null;
  stripeSessionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  position: number;
  status: string;
  credits: number;
  createdAt: string;
}

export interface IMessage {
  id: number;
  userId: number;
  message: string;
  number: string;
  credits_used: number;
  status: string;
  sendAt: string;
  createdAt: string;
  user: IUser;
}

export interface IPlanPrice {
  name: string;
  currency: string;
  amount: number;
  duration: number;
}

export interface IPaiementUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number | null;
  total?: number;
  amount?: number;
  id?: string;
}
export interface IInvoice {
  invoiceItems?: InvoiceItem[];
  id: string;
  identifier?: string | null;
  invoiceName: string;
  total: number;
  status: string;
  date: string;
  dueDate: number;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  currency: string;
  invoiceNumber: number;
  note?: string | null;
  invoiceUrl?: string | null;
  totalTps: number;
  totalTvq: number;
  bigTotal: number;
  userId: string;
  user: IUser;
  discount: number;
  clientId: string;
  client: IClient;
  createdAt: string;
  updatedAt: string;
}

export interface ITotal {
  totalTps: number;
  totalTvq: number;
  totalTva: number;
  totalTips: number;
  totalAmount: number;
}

export interface IMonthly {
  [key: string]: ITotal;
}

export interface ITrimestrial {
  [key: string]: ITotal;
}
export interface ITaxes {
  total: ITotal;
  monthly: IMonthly;
  trimestrial: ITrimestrial;
}

export interface ITracking {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  endLocation: string;
  distance: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    identifier: string;
    firstName: string;
    lastName: string;
    address: string;
    company: string;
    city: string;
    country: string;
    zipcode: string;
    phone: string;
    email: string;
    role: string;
  };
}

export interface ITrackingForm {
  userId?: string;
  date: string;
  startTime: string;
  endTime: string;
  endLocation: string;
  distance: number;
  description: string;
}

export interface ICompany {
  logo: string | null | undefined;
  id: string;
  name: string;
  address: string;
  city: string;
  credits: number;
  country: string;
  zipcode: string;
  phone: string;
  email: string;
  userId: string;
  neqNumber?: string;
  tvqNumber?: string;
  tpsNumber?: string;
  tvaNumber?: string;
  currentSubscription?: any;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string;
  currentSubscriptionId?: string;
  status?: boolean;
  user: IUser;
}

interface ResourcePermission {
  canCreate: boolean;
  reason: string | null;
}

interface UserPermission {
  canAdd: boolean;
  reason: string | null;
}

interface ResourceLimits {
  invoices: number;
  receipts: number;
  users: number;
}

export interface ILimitsCheckResponse {
  invoices: ResourcePermission;
  receipts: ResourcePermission;
  users: UserPermission;
  requiresSubscription: boolean;
  limits: ResourceLimits;
}
