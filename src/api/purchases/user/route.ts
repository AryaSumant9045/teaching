import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession();
    console.log('Session:', session);

    if (!session || !session.user) {
      console.log('No session or user found');
      return NextResponse.json({ userId: null, purchasedResourceIds: [] });
    }

    const userId = session.user.id;
    console.log('User ID:', userId);

    // Fetch purchased resource IDs for the user (mocked for now)
    const purchasedResourceIds = []; // Replace with actual database query

    return NextResponse.json({ userId, purchasedResourceIds });
  } catch (error) {
    console.error('Error fetching user session:', error);
    return NextResponse.json({ userId: null, purchasedResourceIds: [] });
  }
}