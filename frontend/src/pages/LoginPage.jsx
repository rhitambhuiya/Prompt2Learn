import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Zap, Clock, TrendingUp, X, Eye, EyeOff } from 'lucide-react'; // <-- ADDED Eye, EyeOff

// --- SAGE GREEN PALETTE DEFINITIONS ---
const sageGreen = {
    primary: '#4ade80', // Bright Sage Green (for accents and glow)
    secondary: '#16a34a', // Darker Forest Green (for gradient contrast)
    lightHover: '#6ee7b7', // Lighter Mint Green for hover effect
    shadowOpacity: '40', // 40% opacity for header glow
    buttonShadowOpacity: '50', // 50% opacity for button shadow
    heroShadowOpacity: '66', // 66% opacity for hero button shadow
}

// --- STYLE DEFINITIONS (Black and Sage Green Dark Mode) ---
const darkStyles = {
    // Global container styles (Adjusted for full-page centered hero)
    container: {
        minHeight: '100vh',
        backgroundColor: '#0A0A0A', // Deep Black Background
        color: '#E0E0E0', // Light Grey Text color
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        paddingTop: '64px', // Space for the fixed header
    },
    // Fixed Header styles
    header: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        padding: '12px 24px',
        backgroundColor: '#1C1C1C', // Dark Grey Header
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
        borderBottom: '1px solid #333333', // Darker border
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', 
        height: '64px',
        color: '#E0E0E0',
        boxSizing: 'border-box',
    },
    headerTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: sageGreen.primary, // SAGE GREEN Accent
        letterSpacing: '0.5px',
        textShadow: `0 0 5px ${sageGreen.primary}${sageGreen.shadowOpacity}`, // SAGE GREEN shadow
        fontFamily: 'cursive', // ADDED CURSIVE FONT
    },
    // Modal Backdrop
    modalBackdrop: {
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
    },
    // Modal and Form Card styles
    formCard: {
        maxWidth: '420px',
        width: '90%',
        backgroundColor: '#121212', // Card background
        border: '1px solid #333333',
        borderRadius: '16px',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.8)',
        padding: '32px',
        textAlign: 'center',
    },
    inputStyle: { 
        padding:'14px 16px', 
        borderRadius:'10px', 
        border:'2px solid #555555',
        background:'#0A0A0A', 
        color:'#E0E0E0', 
        fontSize:'16px',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        // Added padding-right to prevent text from overlapping the eye icon
        paddingRight: '40px', 
    },
    btnPrimary: { 
        width: '100%',
        padding: '16px',
        fontSize: '18px',
        fontWeight: '700',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        color: '#121212', // Dark text on bright button
        border: 'none',
        background: `linear-gradient(to right, ${sageGreen.primary}, ${sageGreen.secondary})`, // SAGE GREEN Gradient
        boxShadow: `0 4px 10px ${sageGreen.primary}${sageGreen.buttonShadowOpacity}`,
        boxSizing: 'border-box', 
    },
    btnSecondary: { 
        padding: '12px 18px', 
        background: '#333333',
        color: '#E0E0E0', 
        border: '1px solid #555555', 
        borderRadius: '10px', 
        fontWeight: '600',
        flexGrow: 1,
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
    },
    errorStyle: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        color: '#FF7A7A',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '15px',
        textAlign: 'left',
        border: '1px solid #FF000050'
    },
    heroButton: {
        padding: '16px 40px',
        fontSize: '22px',
        fontWeight: '700',
        borderRadius: '16px',
        background: `linear-gradient(to right, ${sageGreen.primary}, ${sageGreen.secondary})`, // SAGE GREEN Gradient
        color: '#121212', // Dark text on bright button
        border: 'none',
        cursor: 'pointer',
        boxShadow: `0 6px 15px ${sageGreen.primary}${sageGreen.heroShadowOpacity}`,
        transition: 'all 0.3s ease',
        marginTop: '40px',
    },
    featureCard: {
        // This style is not fully defined, but uses darkStyles.formCard
        padding: '24px', // DECREASED PADDING
        textAlign: 'left',
        minHeight: '180px', // DECREASED MIN HEIGHT
    }
}

// Simplified Header Component for Login Page
const AppHeader = ({ onTryOut }) => (
    <header style={darkStyles.header}>
        <div style={darkStyles.headerTitle}>
            ✨ Prompt2Learn
        </div>
        {/* Simple button on the top right to open the modal */}
        <button 
            onClick={onTryOut}
            style={{
                ...darkStyles.btnPrimary, // Used btnPrimary structure for consistency
                width: 'auto',
                padding: '8px 16px',
                fontSize: '16px',
                background: darkStyles.btnPrimary.background,
                boxShadow: 'none',
            }}
            onMouseEnter={(e) => e.target.style.background = `linear-gradient(to right, ${sageGreen.lightHover}, ${sageGreen.primary})`} // SAGE GREEN Hover
            onMouseLeave={(e) => e.target.style.background = darkStyles.btnPrimary.background}
        >
            Try Out
        </button>
    </header>
);

// Component for the dynamic text animation (FIXED)
const AnimatedText = () => {
    const phrases = ["better", "faster", "smarter"];
    const [index, setIndex] = useState(0);
    const [opacity, setOpacity] = useState(1);
    const currentPhrase = phrases[index];

    useEffect(() => {
        // 1. Show phrase for 1.5s (was 2.5s)
        const show = setTimeout(() => {
            // 2. Start fade out
            setOpacity(0);
        }, 1500); // Reduced time the phrase is fully visible

        // 3. After fade out (0.5s later), change index and fade in
        const change = setTimeout(() => {
            setIndex(prevIndex => (prevIndex + 1) % phrases.length);
            setOpacity(1);
        }, 2000); // Reduced total cycle time to 2.0s (1.5s show + 0.5s fade)

        return () => {
            clearTimeout(show);
            clearTimeout(change);
        };
    }, [index]); // Depend on index to restart the sequence

    return (
        <span 
            style={{ 
                color: sageGreen.primary, // SAGE GREEN Accent
                transition: 'opacity 0.5s ease', 
                opacity: opacity 
            }}
        >
            {currentPhrase}
        </span>
    );
};


// Login Form Modal Component
const LoginModal = ({ show, onClose }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false); // <-- NEW: State for password visibility
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [error, setError] = useState('')
    const navigate = useNavigate()

    // Helper to reset state when switching modes
    const handleSetMode = (newMode) => {
        setMode(newMode);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setShowPassword(false); // Reset visibility when changing modes
    };

    if (!show) return null;

    async function submit() {
        setError('')
        
        // --- VALIDATION BLOCK ---
        if (!username || !password) {
            setError('Username and Password are required.');
            return;
        }
        if (mode === 'register') {
            if (!confirmPassword) {
                 setError('Please confirm your password.');
                 return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }
        // --- END VALIDATION BLOCK ---

        setLoading(true)
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            const data = await resp.json()
            if (!resp.ok) {
                // --- 🌟 THE CRITICAL CHANGE IS HERE 🌟 ---
                
                // 1. Check if the specific error message from the server is present
                if (mode === 'login' && data.error === 'User not registered') {
                    // 2. Clear the password and switch the mode to 'register'
                    console.log("Login failed: User not registered. Switching to Register mode.");
                    setPassword('');
                    setConfirmPassword(''); // Clear confirm password field just in case
                    setShowPassword(false);
                    setMode('register');
                    setError('Account not found. Please create a new account.');
                    return; // Stop execution here to prevent the generic error throw
                }
                
                // If it's any other error (e.g., 'Invalid Credentials' or 'username and password required')
                throw new Error(data.error || 'Request failed')
            }
            localStorage.setItem('p2l_user', JSON.stringify(data))
            navigate('/')
        } catch (e) {
            // Note: Updated the VITE_API_URL fallback to 4000 to match the server file
            setError(e.message.includes('Failed to fetch') ? 'Cannot connect to the API server. Make sure the backend is running on port 4000.' : e.message)
        } finally {
            setLoading(false)
        }
    }

    // Common style for the password toggle button
    const passwordToggleStyle = {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#666666',
        padding: '4px',
        transition: 'color 0.2s',
        zIndex: 10,
    };


    return (
        <div style={darkStyles.modalBackdrop}>
            <div style={{...darkStyles.formCard, position: 'relative'}}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#666666',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#E0E0E0'}
                    onMouseLeave={e => e.target.style.color = '#666666'}
                >
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <LogIn size={32} style={{ color: sageGreen.primary, marginRight: '12px' }} /> {/* SAGE GREEN ICON */}
                    <h2 style={{marginTop:0, marginBottom: 0, fontSize: '28px', fontWeight: '800', color: '#E0E0E0'}}>
                        Prompt2Learn
                    </h2>
                </div>
                
                <p style={{marginTop:'4px', color:'#A0A0A0', marginBottom: '24px', fontSize: '16px'}}>
                    Sign in or create an account to generate AI study modules.
                </p>
                
                {/* Mode Toggle Buttons (Updated to use handleSetMode) */}
                <div style={{display:'flex', gap:'12px', marginBottom: '24px'}}>
                    <button 
                        onClick={()=>handleSetMode('login')} 
                        style={{
                            ...darkStyles.btnSecondary, 
                            background: mode==='login' ? '#555555' : darkStyles.btnSecondary.background,
                            border: mode==='login' ? '1px solid #555555' : darkStyles.btnSecondary.border,
                            color: mode==='login' ? 'white' : darkStyles.btnSecondary.color
                        }}
                    >
                        Login
                    </button>
                    <button 
                        onClick={()=>handleSetMode('register')} 
                        style={{
                            ...darkStyles.btnSecondary, 
                            background: mode==='register' ? '#555555' : darkStyles.btnSecondary.background,
                            border: mode==='register' ? '1px solid #555555' : darkStyles.btnSecondary.border,
                            color: mode==='register' ? 'white' : darkStyles.btnSecondary.color
                        }}
                    >
                        Register
                    </button>
                </div>
                
                {/* Form Fields */}
                <div style={{display:'flex', flexDirection:'column', gap:'18px'}}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px', textAlign: 'left' }}>
                        <label style={{fontSize: '16px', fontWeight: '600', color: '#E0E0E0'}}>Username</label>
                        <input 
                            style={darkStyles.inputStyle} 
                            value={username} 
                            onChange={e=>setUsername(e.target.value)} 
                            placeholder="e.g. alex_learner" 
                        />
                    </div>

                    {/* PASSWORD FIELD WITH TOGGLE */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px', textAlign: 'left' }}>
                        <label style={{fontSize: '16px', fontWeight: '600', color: '#E0E0E0'}}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                style={darkStyles.inputStyle} 
                                type={showPassword ? "text" : "password"} // <-- Conditional type
                                value={password} 
                                onChange={e=>setPassword(e.target.value)} 
                                placeholder="••••••••" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                style={passwordToggleStyle}
                                onMouseEnter={e => e.target.style.color = sageGreen.primary}
                                onMouseLeave={e => e.target.style.color = '#666666'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD FIELD (Only in Register Mode, also with toggle) */}
                    {mode === 'register' && (
                        <div style={{ display:'flex', flexDirection:'column', gap:'8px', textAlign: 'left' }}>
                            <label style={{fontSize: '16px', fontWeight: '600', color: '#E0E0E0'}}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    style={darkStyles.inputStyle} 
                                    type={showPassword ? "text" : "password"} // <-- Conditional type
                                    value={confirmPassword} 
                                    onChange={e=>setConfirmPassword(e.target.value)} 
                                    placeholder="Re-enter password" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    style={passwordToggleStyle}
                                    onMouseEnter={e => e.target.style.color = sageGreen.primary}
                                    onMouseLeave={e => e.target.style.color = '#666666'}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {error && <div style={darkStyles.errorStyle}>{error}</div>}
                    
                    <button 
                        onClick={submit} 
                        style={{
                            ...darkStyles.btnPrimary,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '10px'
                        }} 
                        disabled={loading}
                        onMouseEnter={(e) => { if (!loading) e.target.style.background = `linear-gradient(to right, ${sageGreen.lightHover}, ${sageGreen.primary})`; }} // SAGE GREEN Hover
                        onMouseLeave={(e) => { if (!loading) e.target.style.background = darkStyles.btnPrimary.background; }}
                    >
                        {loading ? 'Please wait...' : (mode==='login'?'Log In':'Create Account')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, color }) => (
    <div style={{
        ...darkStyles.formCard, 
        padding: darkStyles.featureCard.padding, // Use the new smaller padding
        textAlign: darkStyles.featureCard.textAlign,
        minHeight: darkStyles.featureCard.minHeight, // Use the new smaller min height
        borderLeft: `4px solid ${color}`,
        backgroundColor: '#1C1C1C', // Ensure card is distinct from modal
        transition: 'transform 0.3s ease',
        cursor: 'default',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.25)',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}> {/* REDUCED MARGIN BOTTOM */}
            {icon}
            <h3 style={{ margin: '0 0 0 16px', fontSize: '22px', fontWeight: '700', color: color }}> {/* Increased font size and margin */}
                {title}
            </h3>
        </div>
        <p style={{ margin: 0, fontSize: '16px', color: '#A0A0A0' }}> {/* Increased font size */}
            {description}
        </p>
    </div>
);


export default function LoginPage() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate()

    // Functionality to check for existing token and skip login if found (standard behavior)
    useEffect(() => {
        if (localStorage.getItem('p2l_user')) {
            // User is already logged in, redirect to dashboard
            navigate('/', { replace: true });
        }
    }, [navigate]);


    return (
        <div style={darkStyles.container}>
            {/* Fixed Header */}
            <AppHeader onTryOut={() => setShowModal(true)} />

            {/* Hero Section */}
            <main style={{ 
                width: '100%', 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '0 24px',
                textAlign: 'center',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // PUSH CONTENTS UPWARDS: Use flex-start and reduce top margin on the content container
                justifyContent: 'flex-start',
                paddingTop: '40px', // Adjusted top spacing
            }}>
                <div style={{marginBottom: '60px', marginTop: '0px'}}> {/* REMOVED TOP MARGIN */}
                    <h1 style={{fontSize: '60px', fontWeight: '900', color: '#E0E0E0', marginBottom: '16px', lineHeight: 1.2, fontFamily: 'cursive'}}> {/* APPLIED CURSIVE FONT */}
                        Prompt2Learn: Learn <AnimatedText />
                    </h1>
                    <p style={{fontSize: '24px', color: '#A0A0A0', maxWidth: '800px', margin: '0 auto'}}>
                        Generate custom, AI-powered learning paths on any topic, designed just for you.
                    </p>
                    <button 
                        onClick={() => setShowModal(true)} 
                        style={darkStyles.heroButton}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        Start Your First Plan Today
                    </button>
                </div>

                {/* Feature Cards Section */}
                <section style={{ 
                    width: '100%',
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '24px', 
                    marginTop: '40px',
                    paddingBottom: '40px',
                }}>
                    <FeatureCard
                        icon={<Zap size={32} color="#fcd34d" />} 
                        title="Instant Course Generation"
                        color="#fcd34d"
                        description="Get a comprehensive, structured day-wise plan in seconds using the latest generative AI."
                    />
                    <FeatureCard
                        icon={<Clock size={32} color="#00FFFF" />} 
                        title="Personalized Time Modules"
                        color="#00FFFF" 
                        description="Each path is broken down into manageable daily lessons tailored to your learning pace."
                    />
                    <FeatureCard
                        icon={<TrendingUp size={32} color="#C9A9A6" />} 
                        title="Progress Tracking"
                        color="#C9A9A6"
                        description="Monitor your progress and revisit completed lessons to reinforce your knowledge and skills."
                    />
                </section>
                
            </main>

            {/* Login/Register Modal */}
            <LoginModal show={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
}
