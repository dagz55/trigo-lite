import { processWebhookEvent, verifyWebhookSignature } from '@/lib/paymongo';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('paymongo-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    
    // Process the webhook event
    await processWebhookEvent(event);

    // Handle specific event types
    switch (event.attributes.type) {
      case 'link.payment.paid':
        // Payment via link was successful
        const linkPayment = event.attributes.data;
        const metadata = linkPayment.attributes.metadata;
        
        // Update your database based on payment type
        if (metadata?.type === 'wallet_topup') {
          // Update user wallet balance
          console.log('Processing wallet top-up:', linkPayment);
          // TODO: Update wallet balance in your database
        } else if (metadata?.type === 'ride_payment') {
          // Update ride payment status
          console.log('Processing ride payment:', linkPayment);
          // TODO: Update ride payment status in your database
        } else if (metadata?.type === 'subscription') {
          // Activate subscription
          console.log('Processing subscription payment:', linkPayment);
          // TODO: Activate user subscription in your database
        }
        break;

      case 'payment.paid':
        // Direct payment was successful
        const payment = event.attributes.data;
        console.log('Payment successful:', payment);
        // TODO: Handle successful payment
        break;

      case 'payment.failed':
        // Payment failed
        const failedPayment = event.attributes.data;
        console.log('Payment failed:', failedPayment);
        // TODO: Handle failed payment
        break;

      default:
        console.log('Unhandled webhook event:', event.attributes.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 