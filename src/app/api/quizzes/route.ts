import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Quiz } from '@/lib/models'

export async function GET() {
  await connectDB()
  const quizzes = await Quiz().find().lean()
  return NextResponse.json(quizzes)
}

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const quiz = await Quiz().create(body)
  return NextResponse.json(quiz, { status: 201 })
}
