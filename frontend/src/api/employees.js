import axiosInstance from './axiosInstance';

/**
 * Fetch all employees (with optional query params for filtering)
 */
export async function getEmployees(params = {}) {
  const response = await axiosInstance.get('/employees', { params });
  return response.data;
}

/**
 * Fetch a single employee by ID
 */
export async function getEmployee(id) {
  const response = await axiosInstance.get(`/employees/${id}`);
  return response.data;
}

/**
 * Create a new employee
 */
export async function createEmployee(data) {
  const response = await axiosInstance.post('/employees', data);
  return response.data;
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id, data) {
  const response = await axiosInstance.put(`/employees/${id}`, data);
  return response.data;
}

/**
 * Delete an employee by ID
 */
export async function deleteEmployee(id) {
  await axiosInstance.delete(`/employees/${id}`);
  return id;
}
