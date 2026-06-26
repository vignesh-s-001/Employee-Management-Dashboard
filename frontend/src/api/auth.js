import axiosInstance from './axiosInstance';

/**
 * Login with email + password.
 */
export async function loginUser(email, password) {
  const response = await axiosInstance.post('/login', { email, password });
  return response.data; // { success, token, user }
}

/**
 * Register a new user account.
 */
export async function registerUser(name, email, password, role = 'employee') {
  const response = await axiosInstance.post('/register', { name, email, password, role });
  return response.data; // { success, token, user }
}
