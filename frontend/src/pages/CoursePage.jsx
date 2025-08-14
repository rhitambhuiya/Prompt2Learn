import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const panel = { background:'var(--panel)', border:'1px solid #1f2a4a', borderRadius:12 }

export default function CoursePage() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/courses/${courseId}`)
      const data = await resp.json()
      setCourse(data)
      setLoading(false)
    }
    load()
  }, [courseId])

  if (loading) return <div style={{maxWidth:900, margin:'24px auto', padding:'0 16px'}}>Loading...</div>
  if (!course || course.error) return <div style={{maxWidth:900, margin:'24px auto', padding:'0 16px'}}>Not found</div>

  return (
    <div style={{maxWidth:900, margin:'24px auto', padding:'0 16px'}}>
      <div style={{...panel, padding:20}}>
        <h2 style={{marginTop:0}}>{course.title}</h2>
        <div style={{color:'var(--muted)', marginTop:-6}}>Generated from prompt: “{course.prompt}”</div>
      </div>

      <div style={{display:'grid', gap:12, marginTop:16}}>
        {course.days.map(day => (
          <div key={day.dayIndex} style={{...panel, padding:16}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:30,height:30,borderRadius:8, background:'linear-gradient(135deg,#6aa9ff,#9ad0ff)', display:'flex',alignItems:'center',justifyContent:'center', color:'#0a1020',fontWeight:800}}>{day.dayIndex}</div>
              <div style={{fontWeight:700}}>{day.dayTitle}</div>
            </div>
            <div style={{marginTop:10, display:'grid', gap:8}}>
              {day.lessons.map((l, idx) => (
                <div key={idx} style={{background:'#0f1533', border:'1px solid #2b3d77', borderRadius:10, padding:12}}>
                  <div style={{fontWeight:600}}>{l.title}</div>
                  {l.description && <div style={{color:'var(--muted)', fontSize:14, marginTop:4}}>{l.description}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


