import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import { Purchase } from '@/lib/models'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, resourceId, resourceType, amount } = await req.json()

    const secret = process.env.RAZORPAY_KEY_SECRET || ''

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 })
    }

    // Payment is verified, save to database
    const newPurchase = await Purchase().create({
      userId,
      resourceId,
      resourceType,
      amount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: 'completed'
    })

    return NextResponse.json({ success: true, purchase: newPurchase }, { status: 201 })
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json(
      { error: 'Error verifying payment', details: error.message },
      { status: 500 }
    )
  }
}
