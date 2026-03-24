import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: Request) {
  try {
    const { amount, resourceId, resourceType } = await req.json();

    if (!amount || !resourceId || !resourceType) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const options = {
      amount: amount * 100, // Amount in smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: `${resourceType}_${resourceId}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}