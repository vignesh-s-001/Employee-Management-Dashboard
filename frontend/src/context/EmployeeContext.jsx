import { createContext, useContext, useReducer, useCallback } from 'react';
import {
  getEmployees as apiGetAll,
  createEmployee as apiCreate,
  updateEmployee as apiUpdate,
  deleteEmployee as apiDelete,
} from '../api/employees';

/* ---- State shape ---- */
const initialState = {
  employees: [],
  loading: false,
  error: null,
};

/* ---- Reducer ---- */
function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, employees: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter((e) => e.id !== action.payload),
      };
    default:
      return state;
  }
}

/* ---- Context ---- */
const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchEmployees = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await apiGetAll();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Failed to fetch employees' });
    }
  }, []);

  const addEmployee = useCallback(async (employeeData) => {
    const newEmployee = await apiCreate(employeeData);
    dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
    return newEmployee;
  }, []);

  const editEmployee = useCallback(async (id, employeeData) => {
    const updated = await apiUpdate(id, employeeData);
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: updated });
    return updated;
  }, []);

  const removeEmployee = useCallback(async (id) => {
    await apiDelete(id);
    dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
  }, []);

  return (
    <EmployeeContext.Provider
      value={{
        ...state,
        fetchEmployees,
        addEmployee,
        editEmployee,
        removeEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider');
  return ctx;
}
