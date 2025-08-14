import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const panel = { background:'var(--panel)', border:'1px solid #1f2a4a', borderRadius:12 }
const inputStyle = { padding:'12px 12px', borderRadius:8, border:'1px solid #2b3d77', background:'#0f1533', color:'#eaf0ff', width:'100%' }
const btnPrimary = { padding:'12px 14px', background:'var(--accent)', color:'#0a1020', border:'none', borderRadius:8, fontWeight:700 }

const examplePrompts = [
  'Learn Python for Data Analysis as a complete beginner',
  '7-day crash course on Web Accessibility for frontend devs',
  'Prepare for system design interviews with daily exercises',
  'Master SQL basics to advanced in one week',
  'Intro to Generative AI and LLMs for product managers'
]

export default function DashboardPage() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('p2l_user') || 'null'), [])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const navigate = useNavigate()

  async function loadCourses() {
    const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/courses?userId=${user.id}`)
    const data = await resp.json()
    setCourses(Array.isArray(data)?data:[])
  }

  useEffect(() => { loadCourses() }, [])

  async function generate() {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/courses/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, prompt })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to generate')
      navigate(`/course/${data.courseId}`)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:1000, margin:'24px auto', padding:'0 16px'}}>
      <div style={{...panel, padding:20}}>
        <div style={{display:'flex', gap:16, alignItems:'stretch'}}>
          <textarea rows={3} style={{...inputStyle, resize:'vertical'}} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe what you want to learn in 7 days..." />
          <button onClick={generate} style={btnPrimary} disabled={loading}>{loading? 'Generating...' : 'Generate Plan'}</button>
        </div>
        <div style={{marginTop:12, color:'var(--muted)'}}>Try one of these prompts:</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:8}}>
          {examplePrompts.map(p => (
            <button key={p} onClick={()=>setPrompt(p)} style={{padding:'8px 10px', background:'#1a2450', border:'1px solid #2b3d77', color:'#eaf0ff', borderRadius:20, fontSize:13}}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{marginTop:20}}>
        <h3 style={{margin:'12px 4px'}}>Your Courses</h3>
        {courses.length === 0 ? (
          <div style={{...panel, padding:20, color:'var(--muted)'}}>No courses yet. Generate your first plan above.</div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12}}>
            {courses.map(c => (
              <Link key={c.id} to={`/course/${c.id}`} style={{...panel, padding:16, display:'block'}}>
                <div style={{fontWeight:700, marginBottom:6}}>{c.title}</div>
                <div style={{color:'var(--muted)', fontSize:13, minHeight:38}}>{c.prompt}</div>
                <div style={{fontSize:12, marginTop:10, color:'#c9d3ff'}}>Created {new Date(c.created_at).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{marginTop:24, display:'flex', alignItems:'center', gap:10}}>
        <div style={{width:44,height:44,borderRadius:10, background:'linear-gradient(135deg,#6aa9ff,#9ad0ff)'}}></div>
        <div>
          <div style={{fontWeight:700}}>Profile</div>
          <div style={{color:'var(--muted)'}}>Username: {user.username}</div>
        </div>
      </div>
    </div>
  )
}


