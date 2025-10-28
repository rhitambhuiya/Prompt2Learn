import React from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CoursePage from './pages/CoursePage'
import { ToastContainer } from 'react-toastify'
import { sageGreen } from './pages/DashboardPage'

function NavBar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('p2l_user') || 'null')
  function logout() {
    localStorage.removeItem('p2l_user')
    navigate('/login')
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--panel)', borderBottom: '1px solid #1f2a4a', position: 'sticky', top: 0, zIndex: 10 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), #9ad0ff)' }}></div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Prompt2Learn</div>
      </Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {user && <div style={{ fontSize: 14, color: 'var(--muted)' }}>Signed in as <b>{user.username}</b></div>}
        {user ? (
          <button onClick={logout} style={btnSecondary}>Logout</button>
        ) : (
          <Link to="/login"><button style={btnPrimary}>Login</button></Link>
        )}
      </div>
    </div>
  )
}

const btnPrimary = { padding: '8px 14px', background: 'var(--accent)', color: '#0a1020', border: 'none', borderRadius: 8, fontWeight: 700 }
const btnSecondary = { padding: '8px 14px', background: '#22305f', color: '#eaf0ff', border: '1px solid #2b3d77', borderRadius: 8, fontWeight: 600 }

function RequireAuth({ children }) {
  const user = JSON.parse(localStorage.getItem('p2l_user') || 'null')
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div>
      <ToastContainer
        position="top-right" // Set toast position to top-right
        style={{ top: '70px' }}
        autoClose={2500} // Default duration in milliseconds (5 seconds)
        hideProgressBar={false} // Show the timer slider (progress bar)
        newestOnTop={true} // Ensures new toasts appear above old ones
        closeOnClick
        rtl={false}
        theme="dark" // Use the dark theme
      />
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/course/:courseId" element={<RequireAuth><CoursePage /></RequireAuth>} />
        <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}


