import { createPaymentLink, toCentavos } from '@/lib/paymongo';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication if using Clerk
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { amount, description, type, metadata } = body;

    if (!amount || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, description, type' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment link
    const paymentLink = await createPaymentLink({
      amount: toCentavos(amount), // Convert pesos to centavos
      description,
      remarks: `TriGo ${type}`,
      metadata: {
        ...metadata,
        type, // 'wallet_topup', 'ride_payment', 'subscription'
        // userId, // Include user ID if authenticated
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: paymentLink.data.id,
        checkoutUrl: paymentLink.data.attributes.checkout_url,
        referenceNumber: paymentLink.data.attributes.reference_number,
        amount: amount,
        status: paymentLink.data.attributes.status,
      },
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
} 