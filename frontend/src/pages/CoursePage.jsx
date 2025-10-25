import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, BookOpen, Clock } from 'lucide-react';
import { API_URL } from '../config';

// --- SAGE GREEN PALETTE DEFINITIONS (COPIED FROM DASHBOARD) ---
const sageGreen = {
    primary: '#10b981', // More Vibrant Emerald Green
    secondary: '#059669', // Darker Vibrant Green
    lightHover: '#34d399', // Brighter Mint Green for accent text
    shadowPrimary: 'rgba(16, 185, 129, 0.6)', // Vibrant shadow
    darkBackground: '#0A100F', // Darker background
    darkPanel: '#171c19', // Darker panel/tile background
    darkBorder: '#374151', // Neutral dark border
    lightText: '#eaf0ff', // Pure white/off-white for highlights
};

// --- STYLE DEFINITIONS (ADJUSTED FOR SAGE GREEN) ---

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
  // Inner content wrapper 
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
    backgroundColor: sageGreen.darkPanel, // Green panel color
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    borderBottom: `1px solid ${sageGreen.darkBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    color: sageGreen.lightText,
    boxSizing: 'border-box',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: sageGreen.primary, // Green accent
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
  lessonTile: { // Style for inner lesson tiles
    backgroundColor: sageGreen.darkBackground, // Inner tile background
    border: `1px solid ${sageGreen.darkBorder}`,
    borderLeft: `4px solid ${sageGreen.secondary}`, // Default green border accent
    borderRadius: '10px',
    padding: '25px', // Increased padding
    cursor: 'pointer',
    color: '#eaf0ff',
    transition: 'all 0.2s ease',
  },
};

// --- COMPONENTS ---

// Header Component (Copied from DashboardPage)
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


function CollapsibleLesson({ title, description }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        ...styles.lessonTile,
        borderLeftColor: open ? sageGreen.primary : sageGreen.secondary, // Highlight when open
        background: open ? sageGreen.darkPanel : styles.lessonTile.backgroundColor, // Use dark panel color when open
      }}
      onClick={() => setOpen(!open)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = sageGreen.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = styles.tile.border.split(' ')[2]; // Revert to base dark border
      }}
    >
      <div
        style={{
          fontWeight: 700, // Slightly bolder
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: open ? sageGreen.lightHover : '#eaf0ff', // Light green accent when open
          fontSize: '20px', // Increased Lesson Title content font size (was 18px)
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 24, color: open ? sageGreen.primary : sageGreen.lightHover, transition: 'transform 0.2s' }}>
          {open ? '−' : '+'}
        </span>
      </div>

      {open && description && (
        <div
          style={{
            color: sageGreen.lightText, // Ensure all content text is white
            fontSize: '18px', // Increased Lesson Description content font size (was 16px)
            marginTop: 12, // Increased margin
            lineHeight: 1.6,
            textAlign: 'justify'
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

// Main Course Details Component
export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ADDED useNavigate hook

  // Mock user/logout handlers for header integration (since this file is standalone)
  const user = useMemo(() => JSON.parse(localStorage.getItem('p2l_user') || 'null'), []);
  const handleLogout = () => {
    localStorage.removeItem('p2l_user');
    // Use navigate to redirect, matching the Dashboard logic
    navigate('/login'); 
  }


  useEffect(() => {
    async function load() {
      try {
        const resp = await fetch(
          `${API_URL}/api/courses/${courseId}`
        );
        const data = await resp.json();
        setCourse(data);
      } catch (e) {
        console.error("Failed to load course:", e);
        setCourse({ error: true });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  // Conditional rendering based on loading/error state
  const renderContent = () => {
    const wrapperStyle = { 
        ...styles.contentWrapper, 
        padding: '120px 24px 72px 24px', // Increased top padding for better spacing
        textAlign: 'center' 
    };

    if (loading)
      return (
        <div style={wrapperStyle}>
          <div style={{ color: sageGreen.primary, fontSize: '24px' }}>Loading course plan...</div>
          
        </div>
      );

    if (!course || course.error)
      return (
        <div style={wrapperStyle}>
          <div style={{ color: '#dc2626', fontSize: '24px' }}>Course Not Found or Failed to Load.</div>
          <Link to="/" style={{ color: sageGreen.primary, marginTop: '16px', display: 'block', textDecoration: 'underline' }}>Go back to Dashboard</Link>
        </div>
      );
    
    // Success State
    return (
        <div style={styles.contentWrapper}>
            {/* Back Button */}
            <Link 
                to="/" 
                style={{ 
                    color: sageGreen.primary, 
                    marginBottom: '32px', // Increased margin
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '18px', // Font size remains good here
                    fontWeight: 600,
                    textDecoration: 'none'
                }}
            >
                <ChevronRight size={20} style={{ transform: 'rotate(180deg)', marginRight: '8px' }} />
                Back to Dashboard
            </Link>

            {/* Course Summary Card */}
            <div style={{ ...styles.tile, padding: '40px', borderLeft: `4px solid ${sageGreen.primary}`, marginBottom: '56px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <BookOpen size={40} style={{ marginRight: '16px', color: sageGreen.primary }} /> 
                    <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '800', color: sageGreen.lightText }}> 
                        {course.title}
                    </h2>
                </div>
                
                <div style={{ 
                    color: '#9ca3af', 
                    fontSize: '16px', 
                    marginBottom: '20px', 
                    paddingBottom: '20px', 
                    borderBottom: `1px solid ${sageGreen.darkBorder}`
                }}>
                    Generated from prompt:{' '}
                    <span style={{ fontStyle: 'italic', color: sageGreen.lightText }}>
                        "{course.prompt}"
                    </span>
                </div>
                
                {course.days && (
                    <div style={{ 
                        color: sageGreen.primary, 
                        fontSize: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px' 
                    }}>
                        <Clock size={20} />
                        Plan duration:{' '}
                        <span style={{
                            padding: '4px 10px',
                            backgroundColor: `rgba(16, 185, 129, 0.2)`, 
                            color: sageGreen.lightHover,
                            borderRadius: '9999px',
                            fontWeight: '600',
                            fontSize: '14px',
                        }}>
                           {course.days.length} days
                        </span>
                    </div>
                )}
            </div>

            {/* Daily Modules */}
            <div style={{ display: 'grid', gap: '32px', marginTop: '16px' }}>
                {course.days.map((day) => (
                    <div
                        key={day.dayIndex}
                        style={{ ...styles.tile, padding: '32px', borderLeft: `4px solid ${sageGreen.primary}` }}
                    >
                        {/* Day Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: 48, 
                                    height: 48,
                                    borderRadius: 12, 
                                    background: `linear-gradient(135deg, ${sageGreen.secondary}, ${sageGreen.primary})`, 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: sageGreen.darkBackground, // Dark text on bright background
                                    fontWeight: 800,
                                    fontSize: '24px' 
                                }}
                            >
                                {day.dayIndex}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '24px', color: '#eaf0ff' }}>{day.dayTitle}</div>
                        </div>

                        {/* Lessons List */}
                        <div style={{ marginTop: 10, display: 'grid', gap: 12 }}>
                            {day.lessons.map((l, idx) => (
                                <CollapsibleLesson
                                    key={idx}
                                    title={l.title}
                                    description={l.description}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };


  return (
    <div style={{ backgroundColor: styles.container.backgroundColor, minHeight: styles.container.minHeight }}>
        {/* Fixed Header */}
        <AppHeader user={user} onLogout={handleLogout} />
      
      {renderContent()}

    </div>
  );
}
