import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, resourceId, resourceType, amount } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !resourceId || !resourceType || !amount) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Save the payment details to the database (mocked for now)
    console.log('Payment verified for user:', userId, 'Resource:', resourceId, 'Type:', resourceType, 'Amount:', amount);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 500 });
  }
}