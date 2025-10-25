// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API URLs
const API_URLS = {
  development: 'http://localhost:4000',
  production: 'https://prompt2learn.onrender.com' // Your actual Render URL
};

// Get the appropriate API URL
export const API_URL = isDevelopment 
  ? API_URLS.development 
  : API_URLS.production;

console.log('Environment:', isDevelopment ? 'Development' : 'Production');
console.log('API URL:', API_URL);
