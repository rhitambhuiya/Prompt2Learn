// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';

export const API_URL=isDevelopment
? import.meta.env.VITE_API_URL_DEV
: import.meta.env.VITE_API_URL_PROD

console.log('Environment:', import.meta.env.MODE);
console.log('Using API URL:', API_URL);