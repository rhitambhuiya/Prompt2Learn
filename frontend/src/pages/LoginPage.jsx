import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const fieldStyle = { display:'flex', flexDirection:'column', gap:6 }
const inputStyle = { padding:'12px 12px', borderRadius:8, border:'1px solid #2b3d77', background:'#0f1533', color:'#eaf0ff' }
const btnPrimary = { padding:'12px 14px', background:'var(--accent)', color:'#0a1020', border:'none', borderRadius:8, fontWeight:700 }
const btnSecondary = { padding:'12px 14px', background:'#22305f', color:'#eaf0ff', border:'1px solid #2b3d77', borderRadius:8, fontWeight:700 }

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Request failed')
      localStorage.setItem('p2l_user', JSON.stringify(data))
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:420, margin:'40px auto', background:'var(--panel)', padding:24, borderRadius:12, border:'1px solid #1f2a4a'}}> 
      <h2 style={{marginTop:0}}>Welcome to Prompt2Learn</h2>
      <p style={{marginTop:4, color:'var(--muted)'}}>Sign in or create an account to generate AI study modules.</p>
      <div style={{display:'flex', gap:10, marginTop:12}}>
        <button onClick={()=>setMode('login')} style={{...btnSecondary, background: mode==='login'?'#2a3a74':'#22305f'}}>Login</button>
        <button onClick={()=>setMode('register')} style={{...btnSecondary, background: mode==='register'?'#2a3a74':'#22305f'}}>Register</button>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:14, marginTop:18}}>
        <div style={fieldStyle}>
          <label>Username</label>
          <input style={inputStyle} value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. alex" />
        </div>
        <div style={fieldStyle}>
          <label>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <div style={{color:'#ff7a7a', fontSize:14}}>{error}</div>}
        <button onClick={submit} style={btnPrimary} disabled={loading}>{loading ? 'Please wait...' : (mode==='login'?'Login':'Create account')}</button>
      </div>
    </div>
  )
}


