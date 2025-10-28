import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, AlertTriangle, ChevronRight, BookOpen, LogOut, Trash, CheckCircle } from 'lucide-react'; // Added CheckCircle
import Loader from './Loader';
import { API_URL } from '../config';
import { toast } from 'react-toastify'

// Assuming Loader component is defined elsewhere or imported from './Loader'

// --- SAGE GREEN PALETTE DEFINITIONS (Matched to previous theme) ---
export const sageGreen = {
	primary: '#10b981', // More Vibrant Emerald Green
	secondary: '#059669', // Darker Vibrant Green
	lightHover: '#34d399', // Brighter Mint Green for hover effect
	shadowPrimary: 'rgba(16, 185, 129, 0.6)', // Vibrant shadow
	shadowSecondary: 'rgba(5, 150, 105, 0.25)', // Shadow for tile hover
	darkBackground: '#0A100F', // Darker background
	darkPanel: '#171c19', // Darker panel/tile background
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
		backgroundColor: sageGreen.darkBackground,
		paddingTop: '64px',
	},
	// Reusable card/tile base
	tile: {
		backgroundColor: sageGreen.darkPanel,
		border: `1px solid ${sageGreen.darkBorder}`,
		borderRadius: '16px',
		boxShadow: '0 10px 15px rgba(0, 0, 0, 0.25)',
		transition: 'all 0.3s ease',
	},
	// Primary button style (Black/White style)
	buttonPrimary: {
		width: '100%',
		padding: '10px',
		fontSize: '16px',
		fontWeight: '700',
		borderRadius: '50px',
		transition: 'all 0.3s ease',
		cursor: 'pointer',
		color: '#ffffff',
		border: 'none',
		background: '#121212', // Solid Black background
		boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
		boxSizing: 'border-box',
		transform: 'scale(1)',
	},
	// Textarea input style
	textarea: {
		width: '100%',
		padding: '16px',
		borderRadius: '12px',
		border: `2px solid ${sageGreen.secondary}80`,
		backgroundColor: sageGreen.darkBackground,
		color: '#ffffff',
		fontSize: '16px',
		resize: 'vertical',
		outline: 'none',
		boxSizing: 'border-box',
	},
	// Suggestion tag button style
	buttonTag: {
		padding: '10px 18px',
		backgroundColor: `rgba(0, 0, 0, 0.15)`,
		border: `1px solid ${sageGreen.secondary}80`,
		color: '#ffffff',
		borderRadius: '9999px',
		fontSize: '14px',
		fontWeight: '500',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		textShadow: `0 0 2px ${sageGreen.primary}70`,
	},
	// Course card link style
	courseCard: {
		display: 'block',
		padding: '24px',
		textDecoration: 'none',
		color: '#eaf0ff',
		borderLeft: '4px solid transparent',
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
		backgroundColor: sageGreen.darkPanel,
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
		color: sageGreen.primary,
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
		color: '#ffffff'
	},
};

// --- NEW DELETION LOADER: Spinner (Red Theme) ---
const DeletionLoader = ({ message }) => (
	<div style={{
		position: 'fixed', inset: 0, zIndex: 60,
		display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(2px)',
	}}>
		<div style={{
			width: '40px', height: '40px', border: `4px solid ${sageGreen.darkBorder}`,
			borderTop: `4px solid #dc2626`, // Fixed to deletion red
			borderRadius: '50%',
			animation: 'spin 1s linear infinite'
		}} />
		<p style={{ color: 'white', marginTop: '16px', fontSize: '18px', fontWeight: '600' }}>
            {message}
        </p>
		<style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
	</div>
);

// Custom Error Modal Component (Unchanged)
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
			backgroundColor: '#374151',
			border: '1px solid #ef4444',
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

// Delete Modal Component (Unchanged)
const DeleteModal = ({ courseTitle, onConfirm, onCancel }) => (
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
			backgroundColor: '#374151',
			border: '1px solid #f87171', // Light red border
			borderRadius: '12px',
			padding: '24px',
			maxWidth: '450px',
			width: '90%',
			boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
		}}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
				<Trash style={{ width: '24px', height: '24px', color: '#fca5a5' }} />
				<h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>Confirm Deletion</h3>
			</div>
			<p style={{ color: '#d1d5db', marginBottom: '24px', fontSize: '15px' }}>
				Are you sure you want to permanently delete the course: <strong style={{ color: 'white' }}>"{courseTitle}"</strong>? This action cannot be undone.
			</p>
			
			{/* Action Buttons */}
			<div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
				{/* Cancel Button */}
				<button
					onClick={onCancel}
					style={{
						padding: '10px 18px',
						borderRadius: '8px',
						backgroundColor: 'transparent',
						color: '#d1d5db',
						border: '1px solid #9ca3af',
						fontWeight: '600',
						cursor: 'pointer',
						transition: 'all 0.2s ease',
						flexGrow: 1,
					}}
					onMouseEnter={(e) => { e.target.style.backgroundColor = '#4b5563'; e.target.style.color = 'white'; }}
					onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#d1d5db'; }}
				>
					Cancel
				</button>

				{/* Confirm Delete Button */}
				<button
					onClick={onConfirm}
					style={{
						padding: '10px 18px',
						borderRadius: '8px',
						backgroundColor: '#dc2626',
						color: 'white',
						fontWeight: '600',
						cursor: 'pointer',
						border: 'none',
						transition: 'background-color 0.2s ease',
						flexGrow: 1,
					}}
					onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
					onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
				>
					Delete Course
				</button>
			</div>
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

// --- NEW COURSE CARD COMPONENT ---
const CourseCard = ({ course, onMarkComplete, onDelete, isActive }) => {
	const statusColor = isActive ? sageGreen.lightHover : '#9ca3af';
	const statusBg = isActive ? '#3b82f620' : '#4b5563';

	return (
		<Link
			key={course.id}
			to={`/course/${course.id}`}
			style={{
				flex: '0 0 calc(33.33% - 21.33px)',
				minWidth: '280px',
				maxWidth: '280px',
				...styles.tile,
				...styles.courseCard,
				borderLeft: '4px solid transparent',
				cursor: 'pointer',
				position: 'relative',
				opacity: isActive ? 1 : 0.65, // Fade completed courses slightly
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderLeftColor = isActive ? sageGreen.primary : '#9ca3af';
				e.currentTarget.style.backgroundColor = '#1f2937';
				e.currentTarget.style.boxShadow = `0 15px 25px ${sageGreen.shadowPrimary}`;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderLeftColor = 'transparent';
				e.currentTarget.style.backgroundColor = styles.tile.backgroundColor;
				e.currentTarget.style.boxShadow = styles.tile.boxShadow;
			}}
		>
			{/* Delete Button (Always top-left) */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					onDelete(course);
				}}
				style={{
					position: 'absolute',
					top: '10px',
					left: '10px',
					background: 'transparent',
					border: 'none',
					color: '#f87171',
					cursor: 'pointer',
					zIndex: 10,
					padding: '5px',
					borderRadius: '50%',
					lineHeight: '1',
					transition: 'background-color 0.2s',
				}}
				onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.2)'; }}
				onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
				title="Delete Course"
			>
				<Trash size={20} />
			</button>

			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingLeft: '30px' }}> {/* Pushed title right */}
				<h4 style={{ fontWeight: '800', fontSize: '20px', color: '#ffffff', paddingRight: '30px' }}>
					{course.title || 'Untitled Course'}
				</h4>
				<ChevronRight style={{ width: '24px', height: '24px', color: '#9ca3af', flexShrink: 0 }} />
			</div>

			<p style={{ fontSize: '16px', color: '#ffffff', marginBottom: '20px', minHeight: '50px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
				{course.prompt}
			</p>

			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#ffffff', marginTop: '16px' }}>
				{/* Status Tag */}
				<span style={{ padding: '4px 10px', backgroundColor: statusBg, color: statusColor, borderRadius: '9999px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
					{isActive ? <CheckCircle size={14} style={{ marginRight: '4px' }} /> : null}
					{isActive ? 'In Progress' : 'Completed'}
				</span>
				
				{/* Mark Complete Button (Only for active courses) */}
				{isActive && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							onMarkComplete(course.id);
						}}
						style={{
							padding: '8px 12px',
							borderRadius: '8px',
							backgroundColor: sageGreen.secondary,
							color: 'white',
							border: 'none',
							fontWeight: '600',
							cursor: 'pointer',
							transition: 'background-color 0.2s ease',
							display: 'flex',
							alignItems: 'center',
						}}
						onMouseEnter={(e) => e.target.style.backgroundColor = sageGreen.primary}
						onMouseLeave={(e) => e.target.style.backgroundColor = sageGreen.secondary}
					>
						<CheckCircle size={16} style={{ marginRight: '4px' }} />
						Done
					</button>
				)}
			</div>
		</Link>
	);
};
// --- END COURSE CARD COMPONENT ---

// const ToastNotification = ({ message, type, onDismiss }) => {
//     if (!message) return null;

//     const isSuccess = type === 'success';
//     const isError = type === 'error';
//     // NEW TYPE: Used for successfully completing a destructive action (like deletion)
//     const isDeletionSuccess = type === 'deletion_success'; 

//     // Determine colors
//     let bgColor = isError ? '#dc2626' : '#16a34a'; // Default green, red for error
    
//     if (isDeletionSuccess) {
//         bgColor = '#b91c1c'; // Use a deep red for the deletion confirmation
//     } else if (isSuccess) {
//         bgColor = '#16a34a'; // Green for normal success
//     }

//     // Determine icon
//     let icon = <AlertTriangle size={20} />;
    
//     if (isSuccess || isDeletionSuccess) {
//         icon = <CheckCircle size={20} />; // Checkmark for any successful action (Green or Red)
//     }

//     return (
//         <div 
//             style={{
//                 position: 'fixed',
//                 bottom: '24px',
//                 right: '24px',
//                 zIndex: 1000,
//                 backgroundColor: bgColor,
//                 color: 'white',
//                 padding: '16px 20px',
//                 borderRadius: '12px',
//                 boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 maxWidth: '350px',
//                 animation: 'slideIn 0.3s ease-out',
//             }}
//         >
//             <style>{`
//                 @keyframes slideIn {
//                     from { transform: translateX(100%); opacity: 0; }
//                     to { transform: translateX(0); opacity: 1; }
//                 }
//             `}</style>
//             {icon}
//             <span style={{ flexGrow: 1, fontWeight: '500', fontSize: '15px' }}>{message}</span>
//             <button
//                 onClick={onDismiss}
//                 style={{
//                     background: 'none',
//                     border: 'none',
//                     color: 'white',
//                     cursor: 'pointer',
//                     padding: '4px',
//                 }}
//             >
//                 <X size={16} />
//             </button>
//         </div>
//     );
// };

// Main Dashboard Component
export default function DashboardPage() {
	// Utility function to get user from local storage
	const getUser = () => JSON.parse(localStorage.getItem('p2l_user') || 'null');
	const user = useMemo(getUser, []);
	
	const [prompt, setPrompt] = useState('');
	// MODIFIED: Replaced `loading` with `isGenerating` and added `isDeleting`
	const [isGenerating, setIsGenerating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	
	// Course structure updated to include a simulated `status` for client-side filtering
	const [courses, setCourses] = useState([]); 
	const [error, setError] = useState(null);
	const [courseToDelete, setCourseToDelete] = useState(null); 
	
	const navigate = useNavigate();

	/**
	 * Filters courses into active and completed lists for rendering.
	 */
	const { activeCourses, completedCourses } = useMemo(() => {
		const active = courses.filter(c => c.status !== 'completed');
		const completed = courses.filter(c => c.status === 'completed');
		return { activeCourses: active, completedCourses: completed };
	}, [courses]);


	/**
	 * Handles logging out the user (simulated).
	 */
	const handleLogout = () => {
		localStorage.removeItem('p2l_user');
		navigate('/login');
	}

	/**
	 * Helper function to simulate saving the course list to mimic persistence.
	 * In a real app, this would be an API call (PUT/PATCH).
	 */
	const saveCoursesToStorage = (newCourses) => {
		const userData = getUser();
		if (userData) {
			localStorage.setItem(`p2l_courses_${userData.id}`, JSON.stringify(newCourses));
		}
	};
	
	/**
	 * Loads existing courses for the authenticated user.
	 * Loads from simulated local storage persistence.
	 */
	async function loadCourses() {
		if (!user || !user.id) return;
		try {
			// 1. Fetch from the actual (simulated) API
			const apiUrl = API_URL;
			const resp = await fetch(`${apiUrl}/api/courses?userId=${user.id}`);
			const data = await resp.json();
			
			// 2. Load statuses from simulated local storage persistence
			const storedStatuses = JSON.parse(localStorage.getItem(`p2l_courses_${user.id}`) || '[]');
			const statusMap = new Map(storedStatuses.map(c => [c.id, c.status]));

			// 3. Merge API data with status data, defaulting to 'active'
			const coursesWithStatus = Array.isArray(data) ? data.map(course => ({
				...course,
				// Default to 'active'. If status is found in storage, use it.
				status: statusMap.get(course.id) || 'active', 
			})) : [];

			setCourses(coursesWithStatus);
		} catch (e) {
			console.error('Failed to load courses:', e);
		}
	}

	useEffect(() => {
		if (!user) {
			console.error("User not found in localStorage.");
			// navigate('/login'); // Uncomment in full production flow
			return;
		}
		loadCourses();
	}, [user]);

	useEffect(() => {
		const showToastFlag = localStorage.getItem('showWelcomeToast');
		if (showToastFlag === 'true' && user){
			const username = user.username;
			toast.info(`Welcome back, ${username}! Let's generate a new plan.`, {
                autoClose: 5000, 
                icon: '👋',
            });

			localStorage.removeItem('showWelcomeToast')
		}
	}, [user]);

	/**
	 * Generates a new course plan based on the user prompt.
	 */
	async function generate() {
		if (!prompt.trim()) {
			setError('Please enter a topic to generate a learning plan.');
			return;
		}
		// UPDATED: Use setIsGenerating
		setIsGenerating(true);
		setError(null);

		try {
			const apiUrl = API_URL;
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
			
			// Reload courses to include the newly generated course
			await loadCourses(); 
			navigate(`/course/${data.courseId}`);

		} catch (e) {
			setError(e.message);
		} finally {
			// UPDATED: Use setIsGenerating
			setIsGenerating(false);
		}
	}

	/**
	 * Handles marking a course as completed. (Unchanged)
	 */
	const handleMarkComplete = (courseId) => {
		const completedCourse = courses.find(c => c.id == courseId)
		const newCourses = courses.map(c => 
			c.id === courseId ? { ...c, status: 'completed' } : c
		);
		setCourses(newCourses);
		
		// Update persistent storage with new status
		saveCoursesToStorage(newCourses.map(c => ({ id: c.id, status: c.status })));

		toast.success(`Course "${completedCourse.title || 'Untitled'}" completed!`, { icon: '🎉' });
	};

	/**
	 * Executes the course deletion after confirmation.
	 */
	const handleDeleteCourse = async () => {
		if (!courseToDelete) return;

		// UPDATED: Use setIsDeleting
		setIsDeleting(true);
		setError(null);
		const courseId = courseToDelete.id;
		const courseTitle = courseToDelete.title;
		setCourseToDelete(null); // Close the modal immediately

		try {
			const apiUrl = API_URL;
			const response = await fetch(`${apiUrl}/api/courses/${courseId}`, {
				method: 'DELETE',
			});

			const data = await response.json();

			if (response.ok) {
				// Successful deletion: Update state and local storage immediately.
				const newCourses = courses.filter(c => c.id !== courseId);
				setCourses(newCourses);
				saveCoursesToStorage(newCourses.map(c => ({ id: c.id, status: c.status })));
				toast.error(`Course "${courseTitle || 'Untitled'}" successfully deleted!`, { icon: '🗑️' });
			} else {
				// Deletion Failed
				setError(`Deletion Failed: ${data.message || 'Unknown error occurred.'}`);
			}
		} catch (error) {
			console.error('Error deleting course:', error);
			setError('A network error occurred. Failed to delete the course.');
		} finally {
			// UPDATED: Use setIsDeleting
			setIsDeleting(false);
		}
	};

	return (
		<div style={{ backgroundColor: styles.container.backgroundColor, minHeight: styles.container.minHeight }}>
			{/* UPDATED: Conditionally render the correct loader with distinct styles */}
			{isGenerating && <Loader/>}
			{isDeleting && <DeletionLoader message="Deleting Course..." />}
			
			{/* Fixed Header */}
			<AppHeader user={user} onLogout={handleLogout} />

			{/* Error Modal */}
			{error && <ErrorModal message={error} onClose={() => setError(null)} />}

			{/* Delete Confirmation Modal */}
			{courseToDelete && (
				<DeleteModal
					courseTitle={courseToDelete.title || 'Untitled Course'}
					onConfirm={handleDeleteCourse}
					onCancel={() => setCourseToDelete(null)}
				/>
			)}

			{/* Content Wrapper to apply max-width, centering, and PADDING */}
			<div style={styles.contentWrapper}>

				{/* Header (Content below fixed header) */}
				<header style={{ marginBottom: '48px', paddingTop: '16px' }}>
					<h1 style={{ fontSize: '32px', '@media (min-width: 640px)': { fontSize: '36px' }, fontWeight: '800', color: sageGreen.lightText, marginBottom: '8px' }}>
						Your Personalized Learning Dashboard
					</h1>
					<p style={{ fontSize: '18px', color: '#9ca3af' }}>
						Generate day-wise AI-powered learning plans on any topic.
					</p>
				</header>

				{/* Prompt Generator Panel (Updated loading status checks) */}
				<section style={{ ...styles.tile, padding: '32px', marginBottom: '48px' }}>
					<div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
						<textarea
							rows={4}
							style={{
								...styles.textarea,
								marginBottom: 0,
								flexGrow: 1,
							}}
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="e.g. Learn Python for Data Analysis as a complete beginner."
							disabled={isGenerating}
						/>
						<button
							onClick={generate}
							style={{
								...styles.buttonPrimary,
								width: 'auto',
								flexShrink: 0,
								alignSelf: 'stretch',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								minWidth: '200px',
								// UPDATED: Use isGenerating
								opacity: isGenerating ? 0.7 : 1,
								cursor: isGenerating ? 'not-allowed' : 'pointer',
								transform: isGenerating ? 'scale(1)' : styles.buttonPrimary.transform,
								background: '#121212',
								color: '#ffffff',
							}}
							onMouseEnter={(e) => {
								// UPDATED: Use isGenerating
								if (!isGenerating) {
									e.target.style.background = '#282828';
									e.target.style.transform = 'scale(1.02) translateY(-2px)';
									e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.7)';
									e.target.style.border = '1px solid #ffffff30';
								}
							}}
							onMouseLeave={(e) => {
								// UPDATED: Use isGenerating
								if (!isGenerating) {
									e.target.style.background = '#362e2eff';
									e.target.style.transform = 'scale(1)';
									e.target.style.boxShadow = styles.buttonPrimary.boxShadow;
									e.target.style.border = 'none';
								}
							}}
							// UPDATED: Use isGenerating
							disabled={isGenerating}
						>
							{/* UPDATED: Use isGenerating */}
							{isGenerating ? 'Generating Plan...' : '✨ Generate New Plan'}
						</button>
					</div>
					{/* End Side-by-Side Panel */}

					{/* Suggestion Tags (Unchanged) */}
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
										e.target.style.backgroundColor = 'rgba(2, 2, 2, 0.15)';
										e.target.style.color = '#ffffff';
										e.target.style.transform = 'translateY(0)';
									}}
								>
									{p}
								</button>
							))}
						</div>
					</div>
				</section>

				{/* ---------------- NEW: Active Courses Section ---------------- */}
				<section style={{ marginTop: '48px' }}>
					<h3 style={{ display: 'flex', alignItems: 'center', fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
						<BookOpen style={{ width: '24px', height: '24px', marginRight: '8px', color: sageGreen.primary }} />
						Active Learning Paths ({activeCourses.length})
					</h3>

					{activeCourses.length === 0 ? (
						<div style={{ ...styles.tile, padding: '40px', color: '#9ca3af', textAlign: 'center', fontSize: '18px' }}>
							You have no active courses. Generate a new plan to get started!
						</div>
					) : (
						<div style={{
							display: 'flex',
							flexWrap: 'wrap',
							justifyContent: 'flex-start',
							gap: '32px'
						}}>
							{activeCourses.map((c) => (
								<CourseCard
									key={c.id}
									course={c}
									isActive={true}
									onDelete={() => setCourseToDelete(c)}
									onMarkComplete={handleMarkComplete}
								/>
							))}
						</div>
					)}
				</section>
				
				{/* --- Divider --- */}
				{completedCourses.length > 0 && <hr style={{ border: `1px solid ${sageGreen.darkBorder}`, margin: '64px 0' }} />}

				{/* ---------------- NEW: Completed Courses Section ---------------- */}
				<section style={{ marginTop: completedCourses.length > 0 ? '0' : '48px' }}>
					<h3 style={{ display: 'flex', alignItems: 'center', fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', opacity: completedCourses.length > 0 ? 1 : 0.5 }}>
						<CheckCircle style={{ width: '24px', height: '24px', marginRight: '8px', color: '#9ca3af' }} />
						Completed Learning Paths ({completedCourses.length})
					</h3>
					
					{completedCourses.length === 0 ? (
						<div style={{ ...styles.tile, padding: '40px', color: '#9ca3af', textAlign: 'center', fontSize: '18px' }}>
							Courses you complete will appear here. Keep up the great work!
						</div>
					) : (
						<div style={{
							display: 'flex',
							flexWrap: 'wrap',
							justifyContent: 'flex-start',
							gap: '32px'
						}}>
							{completedCourses.map((c) => (
								<CourseCard
									key={c.id}
									course={c}
									isActive={false}
									onDelete={() => setCourseToDelete(c)}
									onMarkComplete={() => {}} // Completed courses don't need the button
								/>
							))}
						</div>
					)}
				</section>
				{/* ---------------------------------------------------------------- */}

				{/* Profile Section (Unchanged) */}
				<section style={{ marginTop: '64px' }}>
					<div style={{ ...styles.tile, padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
						<div style={{
							width: '56px',
							height: '56px',
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: `linear-gradient(to br, ${sageGreen.secondary}, ${sageGreen.primary})`,
							color: 'white',
							fontWeight: 'bold',
							fontSize: '24px'
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
