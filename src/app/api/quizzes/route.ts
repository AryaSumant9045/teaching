import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Quiz } from '@/lib/models'

const SEED = [
  { title: 'Sandhi Rules Checkpoint', timer: 20, lessonId: '', type: 'quiz', questions: [] },
  { title: 'Lesson 3 Lecture Test', timer: 10, lessonId: 'lesson-3', type: 'lecture', questions: [] },
]

export async function GET() {
  await connectDB()
  const QuizModel = Quiz()
  const count = await QuizModel.countDocuments()
  if (count === 0) await QuizModel.insertMany(SEED)
  const quizzes = await QuizModel.find().lean()
  return NextResponse.json(quizzes)
}

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const quiz = await Quiz().create(body)
  return NextResponse.json(quiz, { status: 201 })
}
