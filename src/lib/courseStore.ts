// Shared data layer for courses and lectures
// Uses localStorage so admin edits appear instantly on the public page

export type CourseMaterial = {
  id: string
  name: string
  type: 'pdf' | 'video' | 'link' | 'slides'
  url: string
}

export type LiveClass = {
  scheduledAt: string // ISO date string
  meetingUrl: string
  isLive: boolean
  title: string
}

export type Lecture = {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  duration: string // e.g. "45 min"
  videoUrl: string
  materials: CourseMaterial[]
  liveClass: LiveClass | null
  isFree: boolean
  createdAt: string
}

export type Course = {
  id: string
  title: string
  description: string
  category: 'Beginner' | 'Intermediate' | 'Advanced'
  thumbnail: string
  color: string
  status: 'active' | 'archived'
  students: number
  rating: number
  totalLectures: number
  duration: string
  createdAt: string
}

// ── Default seed data ──────────────────────────────────────────

const SEED_COURSES: Course[] = [
  { id: 'c1', title: 'Sanskrit Basics I', description: 'Master Devanagari script and foundational grammar. Perfect starting point for all learners.', category: 'Beginner', thumbnail: '', color: '#00e5ff', status: 'active', students: 342, rating: 4.9, totalLectures: 24, duration: '12 hrs', createdAt: '2026-01-10' },
  { id: 'c2', title: 'Vedic Grammar Engine', description: "Pāṇini's Ashtadhyayi rules — Sandhi, Samasa, and Kāraka taught with AI precision.", category: 'Advanced', thumbnail: '', color: '#a78bfa', status: 'active', students: 187, rating: 4.8, totalLectures: 48, duration: '28 hrs', createdAt: '2026-01-22' },
  { id: 'c3', title: 'Sandhi Mastery', description: 'Complete guide to all 8 Sandhi rule types with 200+ practice exercises.', category: 'Intermediate', thumbnail: '', color: '#f5a623', status: 'active', students: 214, rating: 4.7, totalLectures: 32, duration: '18 hrs', createdAt: '2026-02-05' },
  { id: 'c4', title: 'Pronunciation AI', description: 'Real-time audio analysis grades your Sanskrit pronunciation with instant feedback.', category: 'Beginner', thumbnail: '', color: '#ff6b35', status: 'active', students: 421, rating: 4.9, totalLectures: 16, duration: '8 hrs', createdAt: '2026-02-10' },
  { id: 'c5', title: 'Subanta Prakarana', description: 'Noun declension across all eight cases and three genders with mnemonics.', category: 'Intermediate', thumbnail: '', color: '#00e5ff', status: 'active', students: 158, rating: 4.6, totalLectures: 36, duration: '20 hrs', createdAt: '2026-02-15' },
  { id: 'c6', title: 'Dhatu Kosha — Root Words', description: 'Master 2000+ Sanskrit verb roots (Dhatus) with meaning trees and contextual usage.', category: 'Advanced', thumbnail: '', color: '#a78bfa', status: 'active', students: 92, rating: 4.9, totalLectures: 60, duration: '35 hrs', createdAt: '2026-02-20' },
  { id: 'c7', title: 'Sanskrit for Daily Life', description: 'Learn conversational Sanskrit phrases, simple sentences, and common vocabulary.', category: 'Beginner', thumbnail: '', color: '#f5a623', status: 'active', students: 534, rating: 4.8, totalLectures: 20, duration: '10 hrs', createdAt: '2026-02-25' },
  { id: 'c8', title: 'Yoga Sutras in Sanskrit', description: "Read and understand Patanjali's Yoga Sutras in original Sanskrit with commentary.", category: 'Intermediate', thumbnail: '', color: '#ff6b35', status: 'active', students: 276, rating: 5.0, totalLectures: 28, duration: '15 hrs', createdAt: '2026-03-01' },
]

const SEED_LECTURES: Lecture[] = [
  { id: 'l1', courseId: 'c1', title: 'Introduction to Sanskrit & Devanagari', description: 'Overview of the Sanskrit language, its history, and the Devanagari writing system.', order: 1, duration: '35 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', materials: [{ id: 'm1', name: 'Devanagari Chart PDF', type: 'pdf', url: '#' }, { id: 'm2', name: 'Intro Slides', type: 'slides', url: '#' }], liveClass: null, isFree: true, createdAt: '2026-01-11' },
  { id: 'l2', courseId: 'c1', title: 'Vowels — Svaras', description: 'Learn all 14 Sanskrit vowels with correct pronunciation.', order: 2, duration: '42 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', materials: [{ id: 'm3', name: 'Vowels Practice Sheet', type: 'pdf', url: '#' }], liveClass: { scheduledAt: '2026-03-25T18:00:00Z', meetingUrl: 'https://meet.google.com/demo', isLive: false, title: 'Live Q&A — Svara Practice' }, isFree: true, createdAt: '2026-01-12' },
  { id: 'l3', courseId: 'c1', title: 'Consonants — Vyanjanas', description: 'The 36 consonants grouped by articulatory position.', order: 3, duration: '50 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', materials: [{ id: 'm4', name: 'Consonants Chart', type: 'pdf', url: '#' }, { id: 'm5', name: 'Audio Reference', type: 'link', url: '#' }], liveClass: null, isFree: false, createdAt: '2026-01-13' },
  { id: 'l4', courseId: 'c2', title: 'Understanding Pāṇini\'s Sūtra System', description: 'Introduction to the Ashtadhyayi and its 8 chapters.', order: 1, duration: '60 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', materials: [{ id: 'm6', name: 'Ashtadhyayi Overview', type: 'pdf', url: '#' }], liveClass: { scheduledAt: new Date(Date.now() - 1000 * 60).toISOString(), meetingUrl: 'https://meet.google.com/demo', isLive: true, title: '🔴 Live Lecture Now' }, isFree: true, createdAt: '2026-01-23' },
  { id: 'l5', courseId: 'c3', title: 'Svara Sandhi Rules I', description: 'Vowel coalescence rules — when two vowels meet.', order: 1, duration: '45 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', materials: [{ id: 'm7', name: 'Sandhi Rule Table', type: 'pdf', url: '#' }], liveClass: null, isFree: true, createdAt: '2026-02-06' },
]

const COURSES_KEY = 'cvai_courses'
const LECTURES_KEY = 'cvai_lectures'

function isServer() { return typeof window === 'undefined' }

// ── Course CRUD ─────────────────────────────────────────────

export function getCourses(): Course[] {
  if (isServer()) return SEED_COURSES
  try {
    const raw = localStorage.getItem(COURSES_KEY)
    if (!raw) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(SEED_COURSES))
      return SEED_COURSES
    }
    return JSON.parse(raw) as Course[]
  } catch { return SEED_COURSES }
}

export function saveCourse(course: Course): Course[] {
  if (isServer()) return SEED_COURSES
  const list = getCourses()
  const idx = list.findIndex(c => c.id === course.id)
  if (idx >= 0) list[idx] = course
  else list.unshift(course)
  localStorage.setItem(COURSES_KEY, JSON.stringify(list))
  return list
}

export function deleteCourse(id: string): Course[] {
  if (isServer()) return SEED_COURSES
  const list = getCourses().filter(c => c.id !== id)
  localStorage.setItem(COURSES_KEY, JSON.stringify(list))
  // Also remove lectures for this course
  const lectures = getLectures().filter(l => l.courseId !== id)
  localStorage.setItem(LECTURES_KEY, JSON.stringify(lectures))
  return list
}

export function getCourseById(id: string): Course | undefined {
  return getCourses().find(c => c.id === id)
}

// ── Lecture CRUD ─────────────────────────────────────────────

export function getLectures(courseId?: string): Lecture[] {
  if (isServer()) return courseId ? SEED_LECTURES.filter(l => l.courseId === courseId) : SEED_LECTURES
  try {
    const raw = localStorage.getItem(LECTURES_KEY)
    if (!raw) {
      localStorage.setItem(LECTURES_KEY, JSON.stringify(SEED_LECTURES))
      return courseId ? SEED_LECTURES.filter(l => l.courseId === courseId) : SEED_LECTURES
    }
    const all = JSON.parse(raw) as Lecture[]
    return courseId ? all.filter(l => l.courseId === courseId) : all
  } catch { return courseId ? SEED_LECTURES.filter(l => l.courseId === courseId) : SEED_LECTURES }
}

export function saveLecture(lecture: Lecture): Lecture[] {
  if (isServer()) return []
  const all = getLectures()
  const idx = all.findIndex(l => l.id === lecture.id)
  if (idx >= 0) all[idx] = lecture
  else all.push(lecture)
  localStorage.setItem(LECTURES_KEY, JSON.stringify(all))
  return all.filter(l => l.courseId === lecture.courseId)
}

export function deleteLecture(id: string): void {
  if (isServer()) return
  const all = getLectures().filter(l => l.id !== id)
  localStorage.setItem(LECTURES_KEY, JSON.stringify(all))
}

export function setLectureGoLive(lectureId: string, isLive: boolean): void {
  if (isServer()) return
  const all = getLectures()
  const lec = all.find(l => l.id === lectureId)
  if (lec?.liveClass) { lec.liveClass.isLive = isLive }
  localStorage.setItem(LECTURES_KEY, JSON.stringify(all))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
