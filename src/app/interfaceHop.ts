// Énumérations
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  TRAVELER = "TRAVELER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}
export enum DeliveryStatus {
  UNASSIGNED = "UNASSIGNED",
  RESERVED = "RESERVED",
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
  FAILED = "FAILED",
}

export enum PackageStatus {
  PENDING = "PENDING",
  ACCEPT = "ACCEPT",
  REGISTERED = "REGISTERED",
  PICKED_UP = "PICKED_UP",
  CANCELED = "CANCELED",
}

export enum PackageCategory {
  CLOTHING = "CLOTHING",
  ELECTRONICS = "ELECTRONICS",
  FURNITURE = "FURNITURE",
  APPLIANCES = "APPLIANCES",
  BOOKS = "BOOKS",
  TOYS = "TOYS",
  SPORTS = "SPORTS",
  MEDICAL = "MEDICAL",
  FRAGILE = "FRAGILE",
  PERISHABLE = "PERISHABLE",
  LIQUIDS = "LIQUIDS",
  HAZARDOUS = "HAZARDOUS",
  FOOD = "FOOD",
  OTHER = "OTHER",
}

export enum PackageSize {
  LETTER = "LETTER", // 0-1L (lettre, petit colis)
  EXTRA_SMALL = "EXTRA_SMALL", // 0-5L (téléphone, petit livre)
  SMALL = "SMALL", // 5-15L (chaussures, sac à main)
  MEDIUM = "MEDIUM", // 15-50L (boîte à chaussures, laptop)
  LARGE = "LARGE", // 50-100L (valise cabine, carton standard)
  EXTRA_LARGE = "EXTRA_LARGE", // 100-200L (grande valise, téléviseur)
  JUMBO = "JUMBO", // 200+L (meubles, gros appareils électroménagers)
}

export enum VehicleType {
  CAR = "CAR",
  SUV = "SUV",
  VAN = "VAN",
  BIKE = "BIKE",
  MOTORCYCLE = "MOTORCYCLE",
  PUBLIC_TRANSPORT = "PUBLIC_TRANSPORT",
  OTHER = "OTHER",
  TRUCK = "TRUCK",
  SCOOTER = "SCOOTER",
}

export enum TripStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  PLANNED = "PLANNED",
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELED = "CANCELED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  BANK_TRANSFER = "BANK_TRANSFER",
  APPLE_PAY = "APPLE_PAY",
  GOOGLE_PAY = "GOOGLE_PAY",
}

export enum PayoutStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
  SUCCEEDED = "SUCCEEDED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

// Types
export interface ImageUrl {
  title: string;
  url: string;
}

// Interfaces
export interface IUser {
  id: string;
  email: string;
  password?: string;
  identifier?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePicture?: string;
  rating: number;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  preferredCurrency: string;
  token?: string;
  addressNumber?: number;
  address?: string;
  addressComplement?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  identityVerified?: boolean;
  verificationStatus: VerificationStatus;
  verificationToken?: string;
  hasStripeConnectAccount?: boolean;
  stripeAccountLink?: string;
  verificationExpires?: Date;
  resetToken?: string;
  resetExpires?: Date;
  stripeCustomerId?: string;
  stripeAccountId?: string;
  createdAt: Date | any;
  updatedAt: Date | any;

  // Relations
  sessions?: IUserSession[];
  sentDeliveries?: IDelivery[];
  receivedDeliveries?: IDelivery[];
  trips?: ITrip[];
  packages?: IPackage[];
  invoices?: IInvoice[];
  payments?: IPayment[];
  payouts?: IPayout[];
  verifications?: IVerification[];
  ratings?: IRating[];
  givenRatings?: IRating[];
}

export interface IUserSession {
  id: string;
  userId: string;
  isValid: boolean;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: IUser;
}

export interface IVerification {
  id: string;
  userId: string;
  documentType: string;
  documentUrl: string;
  status: VerificationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: IUser;
}

export interface IDelivery {
  _count: any;
  id: string;
  senderId: string;
  receiverId: string;
  tripId?: string;
  status: DeliveryStatus;

  deliveryAddressNumber?: number;
  deliveryAddress?: string;
  deliveryAddressComplement?: string;
  deliveryCity?: string;
  deliveryPostalCode?: string;
  deliveryCountry?: string;

  pickupAddressNumber?: number;
  pickupAddress?: string;
  pickupAddressComplement?: string;
  pickupCity?: string;
  pickupPostalCode?: string;
  pickupCountry?: string;

  pickupInstructions?: string;
  deliveryInstructions?: string;
  trackingNumber: string;
  qrCodeUrl?: string;
  checkoutUrl?: string;
  deliveryPdfUrl?: string;
  estimatedPrice: number;
  actualPrice?: number;
  travelerShare?: number;
  paidAt?: Date;
  reservationExpiry?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  sender: IUser;
  receiver: IReceiver;
  trip?: ITrip;
  packages?: IPackage[];
  payment?: IPayment;
  invoice?: IInvoice;
}

export interface IReceiver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface IPackage {
  estimatedPrice(estimatedPrice: any): import("react").ReactNode;
  id: string;
  ownerId: string;
  deliveryId: string;
  description: string;
  weight: number;
  dimensions: string;
  category: PackageCategory;
  packageStatus: PackageStatus;
  size: PackageSize;
  fragile: boolean;
  imageUrl: ImageUrl[];
  specialInstructions?: string;
  PackageStatus: PackageStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  owner: IUser;
  delivery: IDelivery;
}
export interface IPayout {
  id: string;
  userId: string;
  amount: number;
  fee?: number;
  feeAmount?: number;
  currency?: string;
  deliveryId?: string;
  tripId?: string;
  stripeTransferId?: string;
  status: PayoutStatus;
  scheduledAt?: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: IUser;
  delivery?: IDelivery;
  trip?: ITrip;
}
export interface ITrip {
  Payout: any;
  _count: any;
  id: string;
  travelerId: string;
  startCity: string;
  endCity: string;
  startCountry: string;
  endCountry: string;
  waypoints: string[];
  startTime: Date;
  endTime?: Date;
  price?: number;
  vehicleType: VehicleType;
  maxPackages: number;
  availableSpace?: number;
  maxWeight?: number;
  qrCodeUrl?: string;
  status: TripStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  traveler: IUser;
  deliveries?: IDelivery[];
}

export interface IDeliveryReceipt {
  id: string;
  deliveryId: string;
  qrCodeUrl: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  delivery: IDelivery;
}

export interface IInvoice {
  id: string;
  userId: string;
  deliveryId?: string;
  invoiceNumber: string;
  amount: number;
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  pdfUrl?: string;
  dueDate?: Date;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: IUser;
  delivery?: IDelivery;
  payments?: IPayment[];
}

export interface IPayment {
  id: string;
  userId: string;
  invoiceId?: string;
  deliveryId?: string;
  amount: number;
  platformFee: number;
  stripePaymentId?: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  currency: string;
  stripeChargeId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: IUser;
  invoice?: IInvoice;
  delivery?: IDelivery;
}

export interface IPayout {
  id: string;
  userId: string;
  amount: number;
  fee?: number;
  netAmount: number;
  stripeTransferId?: string;
  status: PayoutStatus;
  scheduledAt?: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: IUser;
}

export interface IRating {
  id: string;
  userId: string;
  raterId: string;
  deliveryId?: string;
  tripId?: string;
  score: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  ratedUser: IUser;
  rater: IUser;
}

export interface ISystemSettings {
  id: string;
  commissionRate: number;
  taxRate: number;
  stripeFee: number;
  stripeFixedFee: number;
  currencyCode: string;
  minDeliveryPrice: number;
  maxPackageWeight: number;
  updatedAt: Date;
}

export interface ISettings {
  id: string;
  isAppleAuth: boolean;
  isGoogleAuth: boolean;
  isInReview: boolean;
  isButtonSubscription: boolean;
  isButtonPayment: boolean;
}

export interface IUserBasic {
  phone: any;
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Interface pour la livraison telle que retournée par l'API
export interface IDeliveryResponse {
  deliveryPdfUrl: any;
  packages: any;
  checkoutUrl: boolean;
  paidAt(paidAt: any): import("react").ReactNode;
  priceDetails: any;
  id: string;
  senderId?: string;
  receiverId: string;
  tripId?: string;
  status: DeliveryStatus;
  deliveryAddressNumber?: number;
  deliveryAddress?: string;
  deliveryAddressComplement?: string;
  deliveryCity?: string;
  deliveryPostalCode?: string;
  deliveryCountry?: string;
  paymentKey?: string;

  pickupAddressNumber?: number;
  pickupAddress?: string;
  pickupAddressComplement?: string;
  pickupCity?: string;
  pickupPostalCode?: string;
  pickupCountry?: string;
  pickupInstructions?: string;
  deliveryInstructions?: string;
  trackingNumber: string;
  qrCodeUrl?: string;
  estimatedPrice: number;
  actualPrice?: number;
  createdAt: any;
  updatedAt: any;
  payment: any;

  // Relations simplifiées

  sender: IUserBasic;
  receiver: IUserBasic;
  trip?: ITrip;

  // Compteurs
  _count: {
    packages: number;
  };
}

export interface ISession {
  user: {
    email: string;
    id: string;
    role: UserRole;
    token: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
  };
  expires: string;
}

// Interface pour la réponse complète de l'API de livraisons
export interface IDeliveriesResponse {
  deliveries: IDeliveryResponse[];
  pagination: IPagination;
}

export interface TripCreateData {
  startCity: string;
  startCountry: string;
  endCity: string;
  endCountry: string;
  startTime: string | Date;
  endTime?: string | Date;
  waypoints?: string[];
  price?: number;
  vehicleType: VehicleType;
  maxPackages?: number;
  availableSpace?: number;
  maxWeight?: number;
}

export interface TripUpdateData {
  startLocation?: string;
  endLocation?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  waypoints?: string[];
  price?: number;
  vehicleType?: VehicleType;
  maxPackages?: number;
  availableSpace?: number;
  maxWeight?: number;
  status?: TripStatus;
}

export interface TripFilters {
  startCity?: string;
  endCity?: string;
  startDate?: string;
  endDate?: string;
  minAvailableSpace?: number;
  maxPrice?: number;
  status?: TripStatus;
  page?: number;
  limit?: number;
}

export interface PackageCreateData {
  deliveryId: string;
  name: string;
  description?: string;
  weight: number;
  dimensions?: string;
  value?: number;
  isFragile?: boolean;
  specialInstructions?: string;
}

export interface PackageUpdateData {
  name?: string;
  description?: string;
  weight?: number;
  dimensions?: string;
  value?: number;
  isFragile?: boolean;
  specialInstructions?: string;
  status?: PackageStatus;
}

export interface PackageFilters {
  deliveryId?: string;
  status?: PackageStatus;
  page?: number;
  limit?: number;
}
