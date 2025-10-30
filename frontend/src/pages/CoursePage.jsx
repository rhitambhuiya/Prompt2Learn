import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, BookOpen, Clock, CheckCircle } from 'lucide-react';
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
        position: 'relative', // Needed for border progress bar
        paddingTop: '30px', // Adjusted to make space for the top border
    },
    // Styles for the Daily Progress Bar
    progressTrack: {
        height: '10px',
        backgroundColor: sageGreen.darkBorder,
        borderRadius: '5px',
        overflow: 'hidden',
        marginTop: '15px',
        flexGrow: 1, // Added flexGrow for proper alignment
    },
    progressBar: (width) => ({ 
        width: `${width}%`,
        height: '100%',
        backgroundColor: sageGreen.primary,
        transition: 'width 0.5s ease-in-out',
        borderRadius: '5px',
    }),
    // Styles for the Lesson Border Progress Bar
    lessonBorderProgress: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '4px',
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: '10px 10px 0 0',
        overflow: 'hidden',
    },
    lessonProgressFill: (isCompleted) => ({
        width: isCompleted ? '100%' : '0%', // Always 100% or 0% for a single lesson
        height: '100%',
        backgroundColor: sageGreen.lightHover, // Bright green accent for completed lessons
        transition: 'width 0.5s ease-in-out',
    }),
};

// --- COMPONENTS ---

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

// Collapsible Lesson Component
function CollapsibleLesson({ dayIndex, lessonIndex, title, description, isCompleted, onToggleComplete }) {
    const [open, setOpen] = useState(false);

    const handleCheckboxChange = (e) => {
        e.stopPropagation(); 
        e.preventDefault(); 
        onToggleComplete(dayIndex, lessonIndex, !isCompleted);
    };

    const handleTileClick = (e) => {
        setOpen(!open); 
    };

    return (
        <div
            style={{
                ...styles.lessonTile,
                borderLeftColor: isCompleted ? '#34d399' : (open ? sageGreen.primary : sageGreen.secondary),
                background: open ? sageGreen.darkPanel : styles.lessonTile.backgroundColor,
                opacity: isCompleted ? 0.8 : 1,
                padding: '0px',
                cursor: 'pointer',
            }}
            onClick={handleTileClick} 
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = sageGreen.secondary;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = styles.tile.border.split(' ')[2];
            }}
        >
            <div style={styles.lessonBorderProgress}>
                <div style={styles.lessonProgressFill(isCompleted)}></div>
            </div>

            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '25px',
                    paddingTop: '5px',
                }}
            >
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        flexGrow: 1, 
                        textDecoration: isCompleted ? 'line-through' : 'none', 
                        fontWeight: 700,
                        color: isCompleted ? '#9ca3af' : (open ? sageGreen.lightHover : '#eaf0ff'), 
                        fontSize: '20px',
                    }}
                >
                    <div 
                        onClick={handleCheckboxChange}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            flexShrink: 0, 
                            marginRight: '15px', 
                            cursor: 'pointer',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => {}} 
                            style={{
                                width: '20px',
                                height: '20px',
                                accentColor: sageGreen.primary,
                                pointerEvents: 'none', 
                            }}
                        />
                    </div>
                    <span>{title}</span>
                </div>
                
                <span 
                    style={{ 
                        fontSize: 24, 
                        color: open ? sageGreen.primary : sageGreen.lightHover, 
                        transition: 'transform 0.2s', 
                        flexShrink: 0 
                    }}
                >
                    {open ? '−' : '+'}
                </span>
            </div>
            
            {open && description && (
                <div
                    style={{
                        color: sageGreen.lightText,
                        fontSize: '18px',
                        marginTop: 0,
                        padding: '0 25px 25px 25px',
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
    const [lessonStatus, setLessonStatus] = useState({});
    const [courseStatus, setCourseStatus] = useState('active'); // 🌟 New state for global status
    const navigate = useNavigate();

    const user = useMemo(() => JSON.parse(localStorage.getItem('p2l_user') || 'null'), []);
    const handleLogout = () => {
        localStorage.removeItem('p2l_user');
        navigate('/login'); 
    }

    const saveLessonStatus = (status) => {
        if (user && courseId) {
            localStorage.setItem(`p2l_lesson_status_${user.id}_${courseId}`, JSON.stringify(status));
        }
    };

    const loadLessonStatus = () => {
        if (user && courseId) {
            try {
                const stored = localStorage.getItem(`p2l_lesson_status_${user.id}_${courseId}`);
                return stored ? JSON.parse(stored) : {};
            } catch (e) {
                console.error("Failed to load lesson status:", e);
                return {};
            }
        }
        return {};
    };

    useEffect(() => {
        async function load() {
            try {
                const resp = await fetch(
                    `${API_URL}/api/courses/${courseId}`
                );
                const data = await resp.json();
                setCourse(data);
                
                const initialStatus = loadLessonStatus();
                setLessonStatus(initialStatus);

                // 🌟 Load the global course status into state
                if (user && courseId) {
                    const userCoursesKey = `p2l_courses_${user.id}`;
                    const storedCourses = JSON.parse(localStorage.getItem(userCoursesKey) || '[]');
                    const status = storedCourses.find(c => c.id === data.id)?.status || 'active';
                    setCourseStatus(status);
                }

            } catch (e) {
                console.error("Failed to load course:", e);
                setCourse({ error: true });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [courseId, user]);

    const handleToggleComplete = (dayIndex, lessonIndex, isCompleted) => {
        const key = `${dayIndex}-${lessonIndex}`;
        const userCoursesKey = `p2l_courses_${user.id}`;
        const storedCourses = JSON.parse(localStorage.getItem(userCoursesKey) || '[]');
        
        // 🌟 Read from state, not localStorage
        const currentCourseStatus = courseStatus; 
        
        if (!isCompleted && currentCourseStatus === 'completed') {
            const newStoredCourses = storedCourses.map(c => {
                if (c.id === courseId) {
                    return { ...c, status: 'active' };
                }
                return c;
            });
            localStorage.setItem(userCoursesKey, JSON.stringify(newStoredCourses));
            
            // 🌟 Update the state for this page
            setCourseStatus('active'); 
            
            console.log(`Course ${course.title} reactivated by user unchecking a lesson.`);

            const newStatus = {};
            if (course && course.days) {
                course.days.forEach(day => {
                    day.lessons.forEach((_, lIdx) => {
                        const lessonKey = `${day.dayIndex}-${lIdx}`;
                        newStatus[lessonKey] = (lessonKey !== key); 
                    });
                });
            }
            setLessonStatus(newStatus);
            saveLessonStatus(newStatus);

        } else {
            setLessonStatus(prevStatus => {
                const newStatus = {
                    ...prevStatus,
                    [key]: isCompleted,
                };
                saveLessonStatus(newStatus);
                return newStatus;
            });
        }
    };

    const dailyProgress = useMemo(() => {
        if (!course || !course.days) return [];

        // 🌟 Use state for finalization status
        const isFinalized = courseStatus === 'completed';

        return course.days.map(day => {
            const dayIndex = day.dayIndex;
            
            if (isFinalized) {
                return { dayIndex, percentage: 100 };
            }

            let completedCount = 0;
            const totalLessons = day.lessons.length;

            if (totalLessons === 0) return { dayIndex, percentage: 100 };
            
            day.lessons.forEach((_, lessonIndex) => {
                const key = `${dayIndex}-${lessonIndex}`;
                if (lessonStatus[key]) {
                    completedCount++;
                }
            });

            const percentage = (completedCount / totalLessons) * 100;
            return { dayIndex, percentage };
        });
    }, [course, lessonStatus, courseStatus]);

    useEffect(() => {
        // 🌟 Add guard clause
        if (!course || !course.days || !user || !user.id || courseStatus === 'completed') {
            return;
        }

        const totalDays = course.days.length;
        const completedDays = dailyProgress.filter(p => p.percentage === 100).length;
        
        const isCourseComplete = totalDays > 0 && completedDays === totalDays;

        if (isCourseComplete) {
            const userCoursesKey = `p2l_courses_${user.id}`;
            const storedCourses = JSON.parse(localStorage.getItem(userCoursesKey) || '[]');
            
            let courseStatusUpdated = false;

            const newStoredCourses = storedCourses.map(c => {
                if (c.id === course.id && c.status !== 'completed') {
                    courseStatusUpdated = true;
                    return { ...c, status: 'completed' };
                }
                return c;
            });

            if (courseStatusUpdated) {
                localStorage.setItem(userCoursesKey, JSON.stringify(newStoredCourses));
                // 🌟 Update the state
                setCourseStatus('completed'); 
                
                console.log(`Course ${course.title} automatically marked as completed.`);
            }
        }
    }, [dailyProgress, course, user, navigate, courseStatus]); // 🌟 Update dependencies


    const renderContent = () => {
        const wrapperStyle = { 
            ...styles.contentWrapper, 
            padding: '120px 24px 72px 24px',
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
        
        // 🌟 Use state for finalization status
        const isCourseFinalized = courseStatus === 'completed'; 

        return (
            <div style={styles.contentWrapper}>
                <Link 
                    to="/" 
                    style={{ 
                        color: sageGreen.lightText, 
                        marginBottom: '32px',
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '18px',
                        fontWeight: 600,
                        textDecoration: 'none'
                    }}
                >
                    <ChevronRight size={20} style={{ transform: 'rotate(180deg)', marginRight: '8px' }} />
                    Back to Dashboard
                </Link>

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
                            color: sageGreen.lightText, 
                            fontSize: '16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px' 
                        }}>
                            <Clock size={20} />
                            Plan duration:{' '}
                            <span style={{
                                padding: '4px 10px',
                                backgroundColor: `rgba(15, 173, 123, 0.2)`, 
                                color: "#ffffff",
                                borderRadius: '9999px',
                                fontWeight: '600',
                                fontSize: '14px',
                            }}>
                               {course.days.length} days
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gap: '32px', marginTop: '16px' }}>
                    {course.days.map((day) => {
                        const dayIndex = day.dayIndex;
                        const progress = dailyProgress.find(p => p.dayIndex === dayIndex)?.percentage || 0;
                        const isDayComplete = progress === 100;

                        return (
                            <div
                                key={day.dayIndex}
                                style={{ 
                                    ...styles.tile, 
                                    padding: '32px', 
                                    borderLeft: `4px solid ${isDayComplete ? sageGreen.lightHover : sageGreen.primary}` 
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '15px' }}>
                                    <div
                                        style={{
                                            width: 48, 
                                            height: 48,
                                            borderRadius: 12, 
                                            background: `linear-gradient(135deg, ${isDayComplete ? '#4d7c0f' : sageGreen.secondary}, ${isDayComplete ? '#84cc16' : sageGreen.primary})`, 
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: sageGreen.darkBackground,
                                            fontWeight: 800,
                                            fontSize: '24px' 
                                        }}
                                    >
                                        {day.dayIndex}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '24px', color: '#eaf0ff' }}>{day.dayTitle}</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '15px' }}>
                                    <div style={styles.progressTrack}>
                                        <div style={styles.progressBar(progress)}></div>
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: isDayComplete ? sageGreen.lightHover : '#9ca3af', flexShrink: 0 }}>
                                        {Math.round(progress)}% Complete
                                        {isDayComplete && <CheckCircle size={16} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />}
                                    </span>
                                </div>

                                <div style={{ marginTop: 10, display: 'grid', gap: 12 }}>
                                    {day.lessons.map((l, idx) => (
                                        <CollapsibleLesson
                                            key={idx}
                                            dayIndex={dayIndex}
                                            lessonIndex={idx}
                                            title={l.title}
                                            description={l.description}
                                            isCompleted={isCourseFinalized || lessonStatus[`${dayIndex}-${idx}`] || false}
                                            onToggleComplete={handleToggleComplete}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: styles.container.backgroundColor, minHeight: styles.container.minHeight }}>
            <AppHeader user={user} onLogout={handleLogout} />
            {renderContent()}
        </div>
    );
}