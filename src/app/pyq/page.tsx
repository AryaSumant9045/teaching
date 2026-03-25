'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileQuestion, Search, Filter, ChevronRight, Calendar, Tag, Download, BookOpen, Loader, AlertCircle, Languages } from 'lucide-react'

const translations = {
  en: {
    badge: 'PYQ Archive',
    title: 'Previous Year',
    titleHighlight: 'Question Papers',
    subtitle: 'Sanskrit board exam papers from past years',
    searchPlaceholder: 'Search papers by year or subject…',
    filter: 'Filter',
    results: 'results',
    error: 'Could not load PYQs:',
    errorMongo: 'Make sure MongoDB is connected.',
    loading: 'Loading PYQs from MongoDB…',
    noPYQs: 'No papers match your search',
    year: 'Year',
    subject: 'Subject',
    questions: 'questions',
    download: 'Download',
    view: 'View Paper',
    categories: {
      All: 'All Years',
    }
  },
  hi: {
    badge: 'PYQ अभिलेखागार',
    title: 'पिछले वर्ष के',
    titleHighlight: 'प्रश्न पत्र',
    subtitle: 'पिछले वर्षों के संस्कृत बोर्ड परीक्षा पत्र',
    searchPlaceholder: 'वर्ष या विषय के अनुसार खोजें…',
    filter: 'फ़िल्टर',
    results: 'परिणाम',
    error: 'PYQ लोड नहीं हो सके:',
    errorMongo: 'सुनिश्चित करें कि MongoDB कनेक्ट है।',
    loading: 'MongoDB से PYQ लोड हो रहे हैं…',
    noPYQs: 'आपकी खोज से कोई पत्र मेल नहीं खाते',
    year: 'वर्ष',
    subject: 'विषय',
    questions: 'प्रश्न',
    download: 'डाउनलोड',
    view: 'पेपर देखें',
    categories: {
      All: 'सभी वर्ष',
    }
  }
}

interface PYQ {
  _id: string
  title: string
  year: string
  subject: string
  fileUrl: string
  questions: number
  addedAt: string
}

export default function PYQListPage() {
  const [pyqs, setPyqs] = useState<PYQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeYear, setActiveYear] = useState('All')
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = translations[lang]

  useEffect(() => {
    fetch('/api/pyq')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(pyqsData => {
        setPyqs(Array.isArray(pyqsData) ? pyqsData : [])
        setLoading(false)
      })
      .catch(e => { 
        console.error('Error fetching PYQs:', e);
        setError(String(e)); 
        setLoading(false);
      });
  }, [])

  const years = ['All', ...[...new Set(pyqs.map(p => p.year))].sort((a, b) => Number(b) - Number(a))]

  const filtered = pyqs.filter(p => {
    const yearMatch = activeYear === 'All' || p.year === activeYear
    const searchMatch = search === '' || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.subject.toLowerCase().includes(search.toLowerCase()) ||
      p.year.includes(search)
    return yearMatch && searchMatch
  })

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      {/* Language Toggle Button */}
      <button
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        style={{ position: 'fixed', top: '90px', right: '16px', zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', cursor: 'pointer', transition: 'all 0.3s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,166,35,0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        <Languages size={18} style={{ color: '#f5a623' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: lang === 'en' ? 'rgba(255,255,255,0.8)' : '#fff' }}>
          {lang === 'en' ? 'हिंदी' : 'English'}
        </span>
      </button>
      
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-12" style={{ paddingTop: '110px', paddingBottom: '48px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', background: 'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.08) 0%, transparent 60%)' }}>
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '99px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', fontSize: '11px', fontWeight: 700, color: '#f5a623', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            <FileQuestion size={11} /> {t.badge}
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.1 }}>
            {t.title}{' '}
            <span style={{ background: 'linear-gradient(135deg,#f5a623,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.titleHighlight}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            {pyqs.length} {t.subtitle}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(14,22,48,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0 18px', maxWidth: '400px', width: '100%' }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', padding: '13px 0', width: '100%' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Year Filter Pills */}
      <div className="px-4 sm:px-6 lg:px-12" style={{ paddingTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={13} style={{ color: 'var(--text-muted)' }} />
        {years.map(year => {
          const count = year === 'All' ? pyqs.length : pyqs.filter(p => p.year === year).length
          const yearColor = '#f5a623'
          return (
            <button key={year} onClick={() => setActiveYear(year)} style={{ padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: activeYear === year ? `${yearColor}18` : 'transparent', color: activeYear === year ? yearColor : 'var(--text-secondary)', border: `1px solid ${activeYear === year ? `${yearColor}50` : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}>
              {year === 'All' ? t.categories.All : year} <span style={{ opacity: 0.55, fontSize: '11px' }}>{count}</span>
            </button>
          )
        })}
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{filtered.length} {t.results}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-12" style={{ marginTop: '24px', marginBottom: '24px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6b35' }}>
          <AlertCircle size={16} />
          <span>{t.error} {error}. {t.errorMongo}</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> {t.loading}
        </div>
      ) : (
        <div className="px-4 sm:px-6 lg:px-12" style={{ paddingTop: '24px', paddingBottom: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
          {filtered.map((pyq, i) => (
            <motion.div key={pyq._id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5, boxShadow: '0 24px 48px rgba(245,166,35,0.15)' }}
              style={{ background: 'rgba(14,22,48,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(245,166,35,0.22)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.3s' }}>
              <div style={{ height: '3px', borderRadius: '3px', background: 'linear-gradient(90deg, #f5a623, #ff6b3566)', boxShadow: '0 0 10px rgba(245,166,35,0.5)' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: 'rgba(245,166,35,0.15)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  <Calendar size={10} style={{ display: 'inline', marginRight: '4px' }} /> {pyq.year}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {pyq.questions} {t.questions}
                </span>
              </div>

              <div>
                <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px', lineHeight: 1.3 }}>{pyq.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <Tag size={12} />
                  {pyq.subject || 'Sanskrit'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <Link href={pyq.fileUrl} target="_blank" download
                  style={{ 
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', 
                    borderRadius: '12px', fontSize: '13px', fontWeight: 800, 
                    background: 'rgba(16,185,129,0.15)', 
                    color: '#10b981', 
                    border: '1px solid rgba(16,185,129,0.3)', 
                    textDecoration: 'none', transition: 'all 0.2s' 
                  }}>
                  <Download size={14} /> {t.download}
                </Link>
                <Link href={`/pyq/${pyq._id}`}
                  style={{ 
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', 
                    borderRadius: '12px', fontSize: '13px', fontWeight: 800, 
                    background: 'rgba(245,166,35,0.18)', 
                    color: '#f5a623', 
                    border: '1px solid rgba(245,166,35,0.35)', 
                    textDecoration: 'none', transition: 'all 0.2s' 
                  }}>
                  <BookOpen size={14} /> {t.view}
                </Link>
              </div>
            </motion.div>
          ))}
          {!loading && filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              <FileQuestion size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: '17px', margin: 0 }}>{t.noPYQs}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
