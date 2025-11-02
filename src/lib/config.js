// Application Configuration
const API_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5094';
export const API_BASE_URL = `${API_HOST}/api`;

export const CONFIG = {
  API_BASE_URL,
  API_HOST,
  UPLOAD_MAX_SIZE: 600 * 1024 * 1024, // 600 MB
  REQUEST_TIMEOUT: 600000, // 10 minutes
};

export default CONFIG;

