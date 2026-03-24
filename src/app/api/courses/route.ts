import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Course } from '@/lib/models'

const SEED: Parameters<ReturnType<typeof Course>['create']>[0][] = [
  { title: 'Sanskrit Basics I', description: 'Master Devanagari script and foundational grammar.', category: 'Beginner', thumbnail: '', color: '#00e5ff', status: 'active', students: 342, rating: 4.9, totalLectures: 24, duration: '12 hrs', createdAt: '2026-01-10' },
  { title: 'Vedic Grammar Engine', description: "Pāṇini's Ashtadhyayi rules — Sandhi, Samasa, and Kāraka taught with AI precision.", category: 'Advanced', thumbnail: '', color: '#a78bfa', status: 'active', students: 187, rating: 4.8, totalLectures: 48, duration: '28 hrs', createdAt: '2026-01-22' },
  { title: 'Sandhi Mastery', description: 'Complete guide to all 8 Sandhi rule types with 200+ practice exercises.', category: 'Intermediate', thumbnail: '', color: '#f5a623', status: 'active', students: 214, rating: 4.7, totalLectures: 32, duration: '18 hrs', createdAt: '2026-02-05' },
  { title: 'Pronunciation AI', description: 'Real-time audio analysis grades your Sanskrit pronunciation.', category: 'Beginner', thumbnail: '', color: '#ff6b35', status: 'active', students: 421, rating: 4.9, totalLectures: 16, duration: '8 hrs', createdAt: '2026-02-10' },
  { title: 'Subanta Prakarana', description: 'Noun declension across all eight cases and three genders.', category: 'Intermediate', thumbnail: '', color: '#00e5ff', status: 'active', students: 158, rating: 4.6, totalLectures: 36, duration: '20 hrs', createdAt: '2026-02-15' },
  { title: 'Dhatu Kosha — Root Words', description: 'Master 2000+ Sanskrit verb roots with meaning trees.', category: 'Advanced', thumbnail: '', color: '#a78bfa', status: 'active', students: 92, rating: 4.9, totalLectures: 60, duration: '35 hrs', createdAt: '2026-02-20' },
  { title: 'Sanskrit for Daily Life', description: 'Learn conversational Sanskrit phrases and common vocabulary.', category: 'Beginner', thumbnail: '', color: '#f5a623', status: 'active', students: 534, rating: 4.8, totalLectures: 20, duration: '10 hrs', createdAt: '2026-02-25' },
  { title: 'Yoga Sutras in Sanskrit', description: "Read and understand Patanjali's Yoga Sutras in original Sanskrit.", category: 'Intermediate', thumbnail: '', color: '#ff6b35', status: 'active', students: 276, rating: 5.0, totalLectures: 28, duration: '15 hrs', createdAt: '2026-03-01' },
]

export async function GET() {
  try {
    await connectDB()
    const CourseModel = Course()
    const count = await CourseModel.countDocuments()
    if (count === 0) await CourseModel.insertMany(SEED)
    const courses = await CourseModel.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(courses)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/courses GET]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const course = await Course().create(body)
    return NextResponse.json(course, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/courses POST]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
