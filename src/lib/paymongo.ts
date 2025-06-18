// PayMongo API utility functions
import { PayMongoError, PayMongoLinkResponse, PayMongoPaymentIntentResponse, PayMongoWebhookEvent } from '@/types/paymongo';

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY;

// Helper function to create authorization header
const getAuthHeader = (usePublicKey = false) => {
  const key = usePublicKey ? PAYMONGO_PUBLIC_KEY : PAYMONGO_SECRET_KEY;
  if (!key) {
    throw new Error('PayMongo API key not configured');
  }
  return `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
};

// Create a payment link
export async function createPaymentLink({
  amount,
  description,
  remarks,
  metadata = {},
}: {
  amount: number; // Amount in centavos (e.g., 10000 = ₱100.00)
  description: string;
  remarks?: string;
  metadata?: Record<string, any>;
}): Promise<PayMongoLinkResponse> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount,
            description,
            remarks,
            metadata,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PayMongoError(error.errors?.[0]?.detail || 'Failed to create payment link', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PayMongoError) throw error;
    throw new PayMongoError('Network error creating payment link', 500);
  }
}

// Create a payment intent (for more advanced payment flows)
export async function createPaymentIntent({
  amount,
  paymentMethodAllowed,
  currency = 'PHP',
  metadata = {},
  captureType = 'automatic',
}: {
  amount: number; // Amount in centavos
  paymentMethodAllowed: string[];
  currency?: string;
  metadata?: Record<string, any>;
  captureType?: 'automatic' | 'manual';
}): Promise<PayMongoPaymentIntentResponse> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount,
            payment_method_allowed: paymentMethodAllowed,
            currency,
            metadata,
            capture_type: captureType,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PayMongoError(error.errors?.[0]?.detail || 'Failed to create payment intent', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PayMongoError) throw error;
    throw new PayMongoError('Network error creating payment intent', 500);
  }
}

// Retrieve a payment link by ID
export async function getPaymentLink(linkId: string): Promise<PayMongoLinkResponse> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/links/${linkId}`, {
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PayMongoError(error.errors?.[0]?.detail || 'Failed to retrieve payment link', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PayMongoError) throw error;
    throw new PayMongoError('Network error retrieving payment link', 500);
  }
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require('crypto');
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return false;
  }

  const computedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

// Process webhook event
export async function processWebhookEvent(event: PayMongoWebhookEvent) {
  switch (event.type) {
    case 'payment.paid':
      // Handle successful payment
      console.log('Payment successful:', event.data);
      break;
    case 'payment.failed':
      // Handle failed payment
      console.log('Payment failed:', event.data);
      break;
    case 'link.payment.paid':
      // Handle successful payment via link
      console.log('Link payment successful:', event.data);
      break;
    default:
      console.log('Unhandled webhook event type:', event.type);
  }
}

// Format amount for display (from centavos to pesos)
export function formatAmount(amountInCentavos: number): string {
  return `₱${(amountInCentavos / 100).toFixed(2)}`;
}

// Convert pesos to centavos for API calls
export function toCentavos(amountInPesos: number): number {
  return Math.round(amountInPesos * 100);
} 