# PayMongo Integration Guide for TriGo

This guide explains how PayMongo has been integrated into the TriGo application for payment processing.

## Overview

PayMongo is integrated to handle:
- Wallet top-ups for passengers
- Ride payments (future implementation)
- Subscription payments (future implementation)

## Setup Instructions

### 1. Get PayMongo API Keys

1. Sign up for a PayMongo account at [https://dashboard.paymongo.com](https://dashboard.paymongo.com)
2. Navigate to Developers → API Keys
3. Copy your Test Mode keys (for development):
   - Public Key (pk_test_...)
   - Secret Key (sk_test_...)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root and add:

```env
# PayMongo Configuration
PAYMONGO_SECRET_KEY=sk_test_YOUR_SECRET_KEY
PAYMONGO_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY

# PayMongo Webhook Secret (get this after creating a webhook)
PAYMONGO_WEBHOOK_SECRET=whsk_YOUR_WEBHOOK_SECRET

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### 3. Set Up Webhooks

1. In your PayMongo Dashboard, go to Developers → Webhooks
2. Create a new webhook with URL: `https://your-domain.com/api/payment/webhook`
3. Select the following events:
   - `link.payment.paid`
   - `payment.paid`
   - `payment.failed`
4. Copy the webhook secret and add it to your `.env.local`

## File Structure

```
src/
├── lib/
│   └── paymongo.ts              # PayMongo API utility functions
├── types/
│   └── paymongo.ts              # TypeScript types for PayMongo
├── app/
│   └── api/
│       └── payment/
│           ├── create-link/     # API route to create payment links
│           │   └── route.ts
│           └── webhook/         # API route to handle webhooks
│               └── route.ts
└── components/
    └── payment/
        └── PayMongoTopUp.tsx    # Reusable payment component
```

## Implementation Details

### Creating Payment Links

The app uses PayMongo Links API for simple payment collection:

```typescript
// Example: Create a payment link for wallet top-up
const response = await fetch('/api/payment/create-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100,                        // Amount in pesos
    description: 'TriGo Wallet Top-up',
    type: 'wallet_topup',
    metadata: {
      userId: 'user-123',
      // Additional metadata
    }
  })
});
```

### Supported Payment Methods

- **E-Wallets**: GCash, Maya (PayMaya), GrabPay
- **Credit/Debit Cards**: Visa, Mastercard, JCB
- **Online Banking**: BPI, BDO, UnionBank, Landbank, Metrobank
- **Buy Now, Pay Later**: BillEase

### Payment Flow

1. User initiates payment (e.g., wallet top-up)
2. App creates a PayMongo payment link via API
3. User is redirected to PayMongo's secure checkout
4. User completes payment using their preferred method
5. PayMongo sends webhook to your app
6. App processes webhook and updates user's balance

### Webhook Processing

Webhooks are verified using HMAC signature validation:

```typescript
// Webhook endpoint automatically:
// 1. Verifies signature
// 2. Processes payment based on type
// 3. Updates database accordingly
```

## Usage in Components

### Passenger Wallet Top-up

The PayMongo integration is currently active in:
- `/passenger/wallet` - Wallet management page

Users can top up their wallet by:
1. Clicking "Top Up via PayMongo"
2. Selecting amount and payment method
3. Being redirected to PayMongo checkout
4. Completing payment

### Future Implementations

The infrastructure supports:
- Direct ride payments
- Subscription management
- Saved payment methods
- Refunds

## Testing

### Test Card Numbers

For testing in development:
- Success: `4343 4343 4343 4345` (Visa)
- Decline: `4444 3333 2222 1111`
- Expiry: Any future date
- CVV: Any 3 digits

### Test E-wallet Flow

1. Use test mode keys
2. PayMongo provides test pages for e-wallet flows
3. No real money is processed in test mode

## Security Considerations

1. **API Keys**: Never expose secret keys in client-side code
2. **Webhook Verification**: Always verify webhook signatures
3. **HTTPS**: Use HTTPS in production for webhook endpoints
4. **Amount Validation**: Always validate amounts server-side

## Troubleshooting

### Common Issues

1. **"Missing API key"**: Check `.env.local` file and restart dev server
2. **Webhook failures**: Ensure webhook URL is publicly accessible
3. **Payment not reflecting**: Check webhook logs in PayMongo dashboard

### Debug Mode

Enable debug logging:
```typescript
// In webhook handler
console.log('Webhook event:', JSON.stringify(event, null, 2));
```

## Going to Production

1. Replace test keys with live keys
2. Update webhook URLs to production domain
3. Test all payment flows thoroughly
4. Monitor webhook delivery rates
5. Set up error alerting

## Support

- PayMongo Documentation: [https://developers.paymongo.com](https://developers.paymongo.com)
- PayMongo Support: support@paymongo.com
- API Status: [https://status.paymongo.com](https://status.paymongo.com) 