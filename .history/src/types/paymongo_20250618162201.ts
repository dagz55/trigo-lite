// PayMongo API Types

export class PayMongoError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'PayMongoError';
  }
}

// Payment Link Types
export interface PayMongoLinkAttributes {
  amount: number; // in centavos
  archived: boolean;
  currency: string;
  description: string;
  livemode: boolean;
  fee: number;
  remarks?: string;
  status: 'unpaid' | 'paid';
  tax_amount?: number;
  taxes?: any[];
  checkout_url: string;
  reference_number: string;
  created_at: number;
  updated_at: number;
  payments: PayMongoPayment[];
  metadata?: Record<string, any>;
}

export interface PayMongoLink {
  id: string;
  type: 'link';
  attributes: PayMongoLinkAttributes;
}

export interface PayMongoLinkResponse {
  data: PayMongoLink;
}

// Payment Intent Types
export interface PayMongoPaymentIntentAttributes {
  amount: number;
  capture_type: 'automatic' | 'manual';
  currency: string;
  description?: string;
  livemode: boolean;
  statement_descriptor?: string;
  status: 'awaiting_payment_method' | 'awaiting_next_action' | 'processing' | 'succeeded' | 'awaiting_capture';
  last_payment_error?: any;
  payment_method_allowed: string[];
  payments: PayMongoPayment[];
  next_action?: any;
  created_at: number;
  updated_at: number;
  metadata?: Record<string, any>;
}

export interface PayMongoPaymentIntent {
  id: string;
  type: 'payment_intent';
  attributes: PayMongoPaymentIntentAttributes;
}

export interface PayMongoPaymentIntentResponse {
  data: PayMongoPaymentIntent;
}

// Payment Types
export interface PayMongoPaymentAttributes {
  amount: number;
  currency: string;
  description?: string;
  external_reference_number?: string;
  fee: number;
  livemode: boolean;
  net_amount: number;
  statement_descriptor?: string;
  status: 'pending' | 'paid' | 'failed';
  source: PayMongoSource;
  created_at: number;
  updated_at: number;
  paid_at?: number;
  payout?: any;
  tax_amount?: number;
  metadata?: Record<string, any>;
}

export interface PayMongoPayment {
  id: string;
  type: 'payment';
  attributes: PayMongoPaymentAttributes;
}

// Source Types
export interface PayMongoSource {
  id: string;
  type: string;
  brand?: string;
  country?: string;
  last4?: string;
}

// Webhook Types
export interface PayMongoWebhookEvent {
  id: string;
  type: string;
  attributes: {
    type: string;
    livemode: boolean;
    data: any;
    created_at: number;
    updated_at: number;
  };
}

// Payment Method Types
export type PayMongoPaymentMethod = 
  | 'card'
  | 'gcash'
  | 'grab_pay'
  | 'paymaya'
  | 'billease'
  | 'dob' // Dragon Pay Online Banking
  | 'dob_ubp'
  | 'dob_bpi'
  | 'dob_bdo'
  | 'dob_landbank'
  | 'dob_metrobank';

// Transaction Status for internal use
export interface PayMongoTransaction {
  id: string;
  paymongoPaymentId?: string;
  paymongoLinkId?: string;
  type: 'wallet_topup' | 'ride_payment' | 'subscription';
  amount: number; // in pesos
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  userId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
} 