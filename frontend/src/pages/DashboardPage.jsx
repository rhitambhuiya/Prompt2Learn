import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, AlertTriangle, ChevronRight, BookOpen, LogOut } from 'lucide-react';

// --- SAGE GREEN PALETTE DEFINITIONS (Matched to previous theme) ---
const sageGreen = {
    primary: '#10b981', // More Vibrant Emerald Green (Duller than previous, but more vibrant than current)
    secondary: '#059669', // Darker Vibrant Green
    lightHover: '#34d399', // Brighter Mint Green for hover effect
    shadowPrimary: 'rgba(16, 185, 129, 0.6)', // Vibrant shadow
    shadowSecondary: 'rgba(5, 150, 105, 0.25)', // Shadow for tile hover
    // Dark Blue/Indigo colors in the original are being replaced with Dark Green hues
    darkBackground: '#0A100F', // Darker background (Less blue/purple)
    darkPanel: '#171c19', // Darker panel/tile background (Less blue/purple)
    darkBorder: '#374151', // Neutral dark border
    lightText: '#eaf0ff', // Pure white/off-white for highlights
};

// --- STYLE DEFINITIONS ---

const styles = {
  // Global container styles
  container: {
    color: '#eaf0ff',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: sageGreen.darkBackground, // Dark background for the overall app look
    paddingTop: '64px', // Space for the fixed header
  },
  // Reusable card/tile base
  tile: {
    backgroundColor: sageGreen.darkPanel, // Dark panel background
    border: `1px solid ${sageGreen.darkBorder}`, // Dark border
    borderRadius: '16px',
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.3s ease',
  },
  // Primary button style
  buttonPrimary: {
    width: '100%',
    padding: '16px',
    fontSize: '20px',
    fontWeight: '700',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    color: '#121212', // Dark text on bright button
    border: 'none',
    background: `linear-gradient(to right, ${sageGreen.primary}, ${sageGreen.secondary})`, // SAGE GREEN gradient (Vibrant)
    boxShadow: 'none', // REMOVED DEFAULT SHADOW
    boxSizing: 'border-box', 
    transform: 'scale(1)', // Base transform state for animation
  },
  // Textarea input style
  textarea: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: `2px solid ${sageGreen.secondary}`, // SAGE GREEN border
    backgroundColor: sageGreen.darkBackground, // Dark background
    color: '#ffffff',
    fontSize: '16px',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box', 
  },
  // Suggestion tag button style - IMPROVED
  buttonTag: {
    padding: '10px 18px', // Increased padding
    backgroundColor: `rgba(5, 150, 105, 0.15)`, // SAGE GREEN light background (Vibrant secondary)
    border: `1px solid ${sageGreen.secondary}80`, // SAGE GREEN border
    color: '#ffffff', // FORCED WHITE TEXT
    borderRadius: '9999px', // full rounded
    fontSize: '14px', 
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textShadow: `0 0 2px ${sageGreen.primary}70`, // Subtle SAGE GREEN shadow
  },
  // Course card link style
  courseCard: {
    display: 'block',
    padding: '24px', // Increased padding
    textDecoration: 'none',
    color: '#eaf0ff',
    borderLeft: '4px solid transparent',
  },
  // Inner content wrapper (to prevent awkward stretching on ultra-wide screens)
  contentWrapper: {
    maxWidth: '1400px', 
    margin: '0 auto', 
    padding: '48px 24px 72px 24px', 
  },
  // Header styles
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 100,
    padding: '12px 24px',
    backgroundColor: sageGreen.darkPanel, // Using the less-blue panel color
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    borderBottom: `1px solid ${sageGreen.darkBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    color: 'var(--text, #eaf0ff)',
    boxSizing: 'border-box', 
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: sageGreen.primary, // SAGE GREEN Accent (Vibrant)
    letterSpacing: '0.5px',
    textShadow: `0 0 5px ${sageGreen.primary}80`,
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s ease',
  },
  profileCode: {
    fontSize: '13px', 
    backgroundColor: '#374151', 
    padding: '2px 6px', 
    borderRadius: '4px',
    color: '#ffffff' // Ensure code text is white
  },
};

// Custom Error Modal Component 
const ErrorModal = ({ message, onClose }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
  }}>
    <div style={{
      backgroundColor: '#374151', // Dark Gray
      border: '1px solid #ef4444', // Red border
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '384px',
      width: '90%',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <AlertTriangle style={{ width: '24px', height: '24px', color: '#fca5a5' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>Generation Error</h3>
      </div>
      <p style={{ color: '#d1d5db', marginBottom: '24px', fontSize: '14px' }}>{message}</p>
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#dc2626',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          border: 'none',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
      >
        Dismiss
      </button>
      </div>
      </div>
);

// Header Component
const AppHeader = ({ user, onLogout }) => (
    <header style={styles.header}>
        <div style={styles.headerTitle}>
            ✨ Prompt2Learn
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', flexShrink: 0 }}>
            <span style={{ color: '#9ca3af', whiteSpace: 'nowrap' }}>
                Signed in as{' '}
                <strong style={{ fontWeight: '700', color: 'white' }}>
                    {user?.username || 'Guest'}
                </strong>
            </span>
            <button 
                onClick={onLogout} 
                style={styles.logoutButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
                <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Logout
            </button>
        </div>
    </header>
);

// Main Dashboard Component
export default function DashboardPage() {
  // NOTE: localStorage is used here, but for a real-world multi-user app, Firestore/Firebase Auth should be used.
  const user = useMemo(() => JSON.parse(localStorage.getItem('p2l_user') || 'null'), []);
  
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /**
   * Handles logging out the user (simulated).
   */
  const handleLogout = () => {
    localStorage.removeItem('p2l_user');
    // Simulate navigation back to a login screen or root
    navigate('/login'); 
  }

  /**
   * Loads existing courses for the authenticated user.
   */
  async function loadCourses() {
    if (!user || !user.id) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const resp = await fetch(`${apiUrl}/api/courses?userId=${user.id}`);
      const data = await resp.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load courses:', e);
    }
  }

  useEffect(() => {
    if (!user) {
      console.error("User not found in localStorage.");
      // In a real app, this would redirect to login/auth page
      return;
    }
    loadCourses();
  }, [user]);

  /**
   * Generates a new course plan based on the user prompt.
   */
  async function generate() {
    if (!prompt.trim()) {
      setError('Please enter a topic to generate a learning plan.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const resp = await fetch(
        `${apiUrl}/api/courses/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, prompt }),
        }
      );
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to generate plan. Check server logs.');
      }

      navigate(`/course/${data.courseId}`);
      
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: styles.container.backgroundColor, minHeight: styles.container.minHeight }}>
        {/* Fixed Header */}
        <AppHeader user={user} onLogout={handleLogout} />
      
      {/* Error Modal */}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      
      {/* Content Wrapper to apply max-width, centering, and PADDING */}
      <div style={styles.contentWrapper}>

        {/* Header (Content below fixed header) */}
        <header style={{ marginBottom: '48px', paddingTop: '16px' }}>
          <h1 style={{ fontSize: '32px', '@media (min-width: 640px)': { fontSize: '36px' }, fontWeight: '800', color: sageGreen.lightText, marginBottom: '8px' }}>
            Your Personalized Learning Dashboard
          </h1>
          <p style={{ fontSize: '18px', color: '#9ca3af' }}>
            Generate 7-day AI-powered learning plans on any topic.
          </p>
        </header>

        {/* Prompt Generator Panel */}
        <section style={{ ...styles.tile, padding: '32px', marginBottom: '48px' }}>
          <div style={{ marginBottom: '16px' }}>
            <textarea
              rows={4}
              style={{ ...styles.textarea, marginBottom: '16px' }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Learn Python for Data Analysis as a complete beginner or a 7-day crash course on Web Accessibility."
              disabled={loading}
            />
            <button
              onClick={generate}
              style={{ 
                ...styles.buttonPrimary,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                transform: loading ? 'scale(1)' : styles.buttonPrimary.transform, // Base state
              }}
              onMouseEnter={(e) => { 
                  if (!loading) { 
                        e.target.style.background = `linear-gradient(to right, ${sageGreen.lightHover}, ${sageGreen.primary})`; 
                        e.target.style.transform = 'scale(1.01)'; // Add hover animation
                        e.target.style.boxShadow = `0 4px 10px ${sageGreen.shadowPrimary}`; // Add shadow on hover
                    }
                }}
              onMouseLeave={(e) => { 
                if (!loading) {
                    e.target.style.background = styles.buttonPrimary.background; 
                    e.target.style.transform = 'scale(1)'; // Remove hover animation
                    e.target.style.boxShadow = 'none'; // Remove shadow on mouse leave
                }
              }}
              disabled={loading}
            >
              {loading ? 'Generating Plan...' : '✨ Generate New Plan'}
            </button>
          </div>

          {/* Suggestion Tags */}
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af', marginBottom: '16px' }}>
              Quick Start Ideas:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {[
                'Learn Python for Data Analysis as a complete beginner',
                '7-day crash course on Web Accessibility for frontend devs',
                'Prepare for system design interviews with daily exercises',
                'Master SQL basics to advanced in one week',
                'Intro to Generative AI and LLMs for product managers',
              ].map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  style={styles.buttonTag}
                  onMouseEnter={(e) => {
                        e.target.style.backgroundColor = sageGreen.secondary;
                        e.target.style.color = '#ffffff';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                  onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(5, 150, 105, 0.15)'; 
                        e.target.style.color = '#ffffff'; // Force white text on mouse leave
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section style={{ marginTop: '48px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
            <BookOpen style={{ width: '24px', height: '24px', marginRight: '8px', color: sageGreen.primary }} /> {/* SAGE GREEN ICON */}
            Your Active Learning Paths ({courses.length})
          </h3>
          
          {courses.length === 0 ? (
            <div style={{ ...styles.tile, padding: '40px', color: '#9ca3af', textAlign: 'center', fontSize: '18px' }}>
              No courses found. Use the generator above to start your first learning plan!
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Increased min size for better layout
              gap: '32px' // Increased gap
            }}>
              {courses.map((c) => (
                <Link
                  key={c.id}
                  to={`/course/${c.id}`}
                  style={{
                    ...styles.tile,
                    ...styles.courseCard,
                    borderLeft: '4px solid transparent',
                    cursor: 'pointer',
                    // Hover effects manually managed for inline styles
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderLeftColor = sageGreen.primary; // SAGE GREEN Border (Vibrant)
                    e.currentTarget.style.backgroundColor = '#1f2937';
                    e.currentTarget.style.boxShadow = `0 15px 25px ${sageGreen.shadowPrimary}`; // SAGE GREEN Shadow on hover (Vibrant)
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderLeftColor = 'transparent';
                    e.currentTarget.style.backgroundColor = styles.tile.backgroundColor;
                    e.currentTarget.style.boxShadow = styles.tile.boxShadow;
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h4 style={{ fontWeight: '800', fontSize: '20px', color: '#ffffff' }}> {/* Set to white */}
                      {c.title || 'Untitled Course'}
                    </h4>
                    <ChevronRight style={{ width: '24px', height: '24px', color: '#9ca3af' }} />
                  </div>
                  
                  <p style={{ fontSize: '16px', color: '#ffffff', marginBottom: '20px', minHeight: '50px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {c.prompt}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#ffffff' }}> {/* Set details to white */}
                    <span>
                      Created: {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ padding: '4px 10px', backgroundColor: '#3b82f620', color: sageGreen.lightHover, borderRadius: '9999px', fontWeight: '600' }}> {/* SAGE GREEN pill text (Vibrant) */}
                      In Progress
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Profile Section */}
        <section style={{ marginTop: '64px' }}>
          <div style={{ ...styles.tile, padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '56px', // Increased size
              height: '56px', // Increased size
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: `linear-gradient(to br, ${sageGreen.secondary}, ${sageGreen.primary})`, // SAGE GREEN Gradient (Vibrant)
              color: 'white', 
              fontWeight: 'bold', 
              fontSize: '24px' // Increased font size
            }}>
              {user?.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'white', fontSize: '18px' }}>
                {user?.username || 'Guest User'}
              </div>
              <div style={{ fontSize: '15px', color: '#9ca3af' }}>
                User ID: <code style={styles.profileCode}>{user?.id || 'N/A'}</code>
              </div>
            </div>
          </div>
        </section>
      </div> {/* End Content Wrapper */}
      </div>
  );
}
