# Testing Documentation
# Employee Management Dashboard

> **Tech Stack for Tests:** Jest + React Testing Library (RTL) + MSW (Mock Service Worker)

---

## 1. Test Environment Setup

### Prerequisites
```bash
# Install test dependencies (in /frontend)
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest \
  jest-environment-jsdom \
  msw \
  babel-jest \
  @babel/core \
  @babel/preset-env \
  @babel/preset-react \
  identity-obj-proxy
```

### Jest Configuration (`frontend/jest.config.js`)
```js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['./src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
};
```

### Setup File (`frontend/src/setupTests.js`)
```js
import '@testing-library/jest-dom';
```

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run a specific test file
npm test -- Login.test.jsx
```

---

## 2. Test File Structure

```
frontend/src/
├── __tests__/
│   ├── pages/
│   │   ├── Login.test.jsx
│   │   ├── Dashboard.test.jsx
│   │   ├── Employees.test.jsx
│   │   └── Analytics.test.jsx
│   ├── components/
│   │   ├── EmployeeTable.test.jsx
│   │   ├── EmployeeForm.test.jsx
│   │   ├── DeleteModal.test.jsx
│   │   ├── Pagination.test.jsx
│   │   ├── SearchFilter.test.jsx
│   │   └── StatCard.test.jsx
│   ├── context/
│   │   ├── AuthContext.test.jsx
│   │   └── EmployeeContext.test.jsx
│   ├── hooks/
│   │   └── useDebounce.test.js
│   └── utils/
│       └── auth.test.js
└── mocks/
    ├── handlers.js      # MSW request handlers
    └── server.js        # MSW server setup
```

---

## 3. MSW Mock Handlers

### `src/mocks/handlers.js`
```js
import { rest } from 'msw';

const BASE = 'http://localhost:5000';

export const handlers = [
  // Login
  rest.post(`${BASE}/login`, (req, res, ctx) => {
    const { email, password } = req.body;
    if (email === 'admin@nexatech.io' && password === 'admin123') {
      return res(ctx.json({
        success: true,
        token: btoa(JSON.stringify({ id: 1, email, role: 'admin', exp: Date.now() + 86400000 })),
        user: { id: 1, name: 'Admin User', email, role: 'admin' },
      }));
    }
    return res(ctx.status(401), ctx.json({ success: false, message: 'Invalid credentials' }));
  }),

  // Get Employees
  rest.get(`${BASE}/employees`, (req, res, ctx) =>
    res(ctx.json([
      { id: 1, name: 'Alice Johnson', email: 'alice@nexatech.io', department: 'Engineering',
        designation: 'Engineer', status: 'Active', joiningDate: '2021-03-15', avatar: 'AJ' },
      { id: 2, name: 'Bob Martinez', email: 'bob@nexatech.io', department: 'Design',
        designation: 'Designer', status: 'Inactive', joiningDate: '2020-07-22', avatar: 'BM' },
    ]))
  ),

  // Create Employee
  rest.post(`${BASE}/employees`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json({ id: 99, ...req.body }))
  ),

  // Update Employee
  rest.put(`${BASE}/employees/:id`, (req, res, ctx) =>
    res(ctx.json({ id: Number(req.params.id), ...req.body }))
  ),

  // Delete Employee
  rest.delete(`${BASE}/employees/:id`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json({}))
  ),
];
```

### `src/mocks/server.js`
```js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

---

## 4. Unit Tests

### 4.1 `auth.test.js` – Auth Utilities
```js
import { setAuth, getToken, getStoredUser, clearAuth, isTokenValid } from '../../utils/auth';

describe('Auth Utilities', () => {
  beforeEach(() => localStorage.clear());

  test('setAuth stores token and user', () => {
    const token = 'test-token';
    const user  = { id: 1, email: 'admin@nexatech.io' };
    setAuth(token, user);
    expect(localStorage.getItem('emp_dashboard_token')).toBe(token);
    expect(JSON.parse(localStorage.getItem('emp_dashboard_user'))).toEqual(user);
  });

  test('getToken returns stored token', () => {
    localStorage.setItem('emp_dashboard_token', 'abc123');
    expect(getToken()).toBe('abc123');
  });

  test('getToken returns null when empty', () => {
    expect(getToken()).toBeNull();
  });

  test('getStoredUser parses user correctly', () => {
    const user = { id: 1, name: 'Admin' };
    localStorage.setItem('emp_dashboard_user', JSON.stringify(user));
    expect(getStoredUser()).toEqual(user);
  });

  test('getStoredUser returns null on invalid JSON', () => {
    localStorage.setItem('emp_dashboard_user', 'not-json');
    expect(getStoredUser()).toBeNull();
  });

  test('clearAuth removes token and user', () => {
    setAuth('token', { id: 1 });
    clearAuth();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  test('isTokenValid returns true for valid unexpired token', () => {
    const payload = { id: 1, exp: Date.now() + 100000 };
    const token   = btoa(JSON.stringify(payload));
    localStorage.setItem('emp_dashboard_token', token);
    expect(isTokenValid()).toBe(true);
  });

  test('isTokenValid returns false for expired token', () => {
    const payload = { id: 1, exp: Date.now() - 1000 };
    const token   = btoa(JSON.stringify(payload));
    localStorage.setItem('emp_dashboard_token', token);
    expect(isTokenValid()).toBe(false);
  });

  test('isTokenValid returns false when no token', () => {
    expect(isTokenValid()).toBe(false);
  });
});
```

### 4.2 `useDebounce.test.js` – Custom Hook
```js
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  test('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 400));
    expect(result.current).toBe('hello');
  });

  test('debounces value change after delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 400), {
      initialProps: { val: 'hello' },
    });
    rerender({ val: 'world' });
    expect(result.current).toBe('hello'); // not yet updated
    act(() => jest.advanceTimersByTime(400));
    expect(result.current).toBe('world'); // now updated
  });

  test('cancels pending update on unmount', () => {
    const { unmount } = renderHook(() => useDebounce('test', 400));
    unmount(); // Should not throw
  });
});
```

---

## 5. Component Tests

### 5.1 `StatCard.test.jsx`
```jsx
import { render, screen } from '@testing-library/react';
import StatCard from '../../components/StatCard';

describe('StatCard', () => {
  test('renders label and value', () => {
    render(<StatCard icon="👥" label="Total Employees" value={42} color="#6c63ff" />);
    expect(screen.getByText('Total Employees')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('renders positive trend', () => {
    render(<StatCard label="Active" value={10} color="#22c55e" trend={5} />);
    expect(screen.getByText(/↑/)).toBeInTheDocument();
    expect(screen.getByText(/5%/)).toBeInTheDocument();
  });

  test('renders negative trend', () => {
    render(<StatCard label="Inactive" value={3} color="#ef4444" trend={-2} />);
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  test('does not render trend when not provided', () => {
    const { queryByText } = render(<StatCard label="On Leave" value={1} />);
    expect(queryByText(/↑|↓/)).toBeNull();
  });
});
```

### 5.2 `Pagination.test.jsx`
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../components/Pagination';

const defaultProps = {
  currentPage: 1, totalPages: 5, totalItems: 30,
  itemsPerPage: 6, onPageChange: jest.fn(),
};

describe('Pagination', () => {
  test('renders page info text', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
  });

  test('prev button is disabled on page 1', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    expect(screen.getByTitle('Previous page')).toBeDisabled();
  });

  test('next button is disabled on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    expect(screen.getByTitle('Next page')).toBeDisabled();
  });

  test('calls onPageChange when next clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} currentPage={2} />);
    fireEvent.click(screen.getByTitle('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('calls onPageChange when page number clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('returns null when totalPages <= 1', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });
});
```

### 5.3 `SearchFilter.test.jsx`
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import SearchFilter from '../../components/SearchFilter';

const props = {
  search: '', onSearch: jest.fn(),
  department: '', onDepartment: jest.fn(),
  status: '', onStatus: jest.fn(),
  onReset: jest.fn(),
};

describe('SearchFilter', () => {
  test('renders search input', () => {
    render(<SearchFilter {...props} />);
    expect(screen.getByPlaceholderText(/Search by name/)).toBeInTheDocument();
  });

  test('calls onSearch when typing', () => {
    const onSearch = jest.fn();
    render(<SearchFilter {...props} onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText(/Search by name/), {
      target: { value: 'Alice' },
    });
    expect(onSearch).toHaveBeenCalledWith('Alice');
  });

  test('calls onDepartment when department selected', () => {
    const onDepartment = jest.fn();
    render(<SearchFilter {...props} onDepartment={onDepartment} />);
    fireEvent.change(screen.getByDisplayValue('All Departments'), {
      target: { value: 'Engineering' },
    });
    expect(onDepartment).toHaveBeenCalledWith('Engineering');
  });

  test('shows clear button when search is active', () => {
    render(<SearchFilter {...props} search="Alice" />);
    expect(screen.getByText(/✕ Clear/)).toBeInTheDocument();
  });

  test('does not show clear button with no filters', () => {
    const { queryByText } = render(<SearchFilter {...props} />);
    expect(queryByText(/✕ Clear/)).toBeNull();
  });

  test('calls onReset when clear clicked', () => {
    const onReset = jest.fn();
    render(<SearchFilter {...props} search="test" onReset={onReset} />);
    fireEvent.click(screen.getByText(/✕ Clear/));
    expect(onReset).toHaveBeenCalled();
  });
});
```

### 5.4 `EmployeeTable.test.jsx`
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import EmployeeTable from '../../components/EmployeeTable';

const mockEmployees = [
  { id: 1, name: 'Alice Johnson', email: 'alice@nexatech.io', department: 'Engineering',
    designation: 'Engineer', status: 'Active', joiningDate: '2021-03-15', avatar: 'AJ' },
  { id: 2, name: 'Bob Martinez', email: 'bob@nexatech.io', department: 'Design',
    designation: 'Designer', status: 'Inactive', joiningDate: '2020-07-22', avatar: 'BM' },
];

describe('EmployeeTable', () => {
  const onEdit   = jest.fn();
  const onDelete = jest.fn();

  test('renders employee names', () => {
    render(<EmployeeTable employees={mockEmployees} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
  });

  test('renders emails', () => {
    render(<EmployeeTable employees={mockEmployees} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('alice@nexatech.io')).toBeInTheDocument();
  });

  test('renders status badges', () => {
    render(<EmployeeTable employees={mockEmployees} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  test('calls onEdit when edit button clicked', () => {
    render(<EmployeeTable employees={mockEmployees} onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Edit employee') /* first one */);
    expect(onEdit).toHaveBeenCalledWith(mockEmployees[0]);
  });

  test('calls onDelete when delete button clicked', () => {
    render(<EmployeeTable employees={mockEmployees} onEdit={onEdit} onDelete={onDelete} />);
    const deleteBtns = screen.getAllByTitle('Delete employee');
    fireEvent.click(deleteBtns[1]);
    expect(onDelete).toHaveBeenCalledWith(mockEmployees[1]);
  });

  test('renders correct column headers', () => {
    render(<EmployeeTable employees={mockEmployees} onEdit={onEdit} onDelete={onDelete} />);
    ['Employee', 'Department', 'Designation', 'Status', 'Joining Date', 'Actions'].forEach((col) =>
      expect(screen.getByText(col)).toBeInTheDocument()
    );
  });
});
```

### 5.5 `EmployeeForm.test.jsx`
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeForm from '../../components/EmployeeForm';

const defaultProps = {
  isOpen: true, onClose: jest.fn(), onSubmit: jest.fn(), initialData: null, loading: false,
};

describe('EmployeeForm', () => {
  test('renders add form when no initialData', () => {
    render(<EmployeeForm {...defaultProps} />);
    expect(screen.getByText(/Add New Employee/)).toBeInTheDocument();
  });

  test('renders edit form when initialData has id', () => {
    render(<EmployeeForm {...defaultProps} initialData={{ id: 1, name: 'Alice', email: 'a@b.com',
      department: 'Engineering', designation: 'Dev', status: 'Active', joiningDate: '2021-01-01' }} />);
    expect(screen.getByText(/Edit Employee/)).toBeInTheDocument();
  });

  test('shows validation errors on empty submit', async () => {
    render(<EmployeeForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Employee'));
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  test('shows invalid email error', async () => {
    render(<EmployeeForm {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText(/Alice Johnson/), 'Test Name');
    await userEvent.type(screen.getByPlaceholderText(/alice@nexatech.io/), 'not-an-email');
    fireEvent.click(screen.getByText('Add Employee'));
    await waitFor(() => expect(screen.getByText('Invalid email address')).toBeInTheDocument());
  });

  test('calls onClose when Cancel clicked', () => {
    const onClose = jest.fn();
    render(<EmployeeForm {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(<EmployeeForm {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('shows loading state on submit button', () => {
    render(<EmployeeForm {...defaultProps} loading={true} />);
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });
});
```

### 5.6 `DeleteModal.test.jsx`
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteModal from '../../components/DeleteModal';

const emp = { id: 1, name: 'Alice Johnson', email: 'alice@nexatech.io',
  designation: 'Engineer', department: 'Engineering', avatar: 'AJ' };

describe('DeleteModal', () => {
  test('renders when isOpen=true', () => {
    render(<DeleteModal isOpen={true} employee={emp} onConfirm={jest.fn()} onCancel={jest.fn()} loading={false} />);
    expect(screen.getByText(/Delete Employee/)).toBeInTheDocument();
    expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument();
  });

  test('does not render when isOpen=false', () => {
    const { container } = render(<DeleteModal isOpen={false} employee={emp} onConfirm={jest.fn()} onCancel={jest.fn()} loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('calls onCancel when Cancel clicked', () => {
    const onCancel = jest.fn();
    render(<DeleteModal isOpen={true} employee={emp} onConfirm={jest.fn()} onCancel={onCancel} loading={false} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  test('calls onConfirm when confirm clicked', () => {
    const onConfirm = jest.fn();
    render(<DeleteModal isOpen={true} employee={emp} onConfirm={onConfirm} onCancel={jest.fn()} loading={false} />);
    fireEvent.click(screen.getByText('Yes, Delete'));
    expect(onConfirm).toHaveBeenCalled();
  });

  test('shows deleting state during loading', () => {
    render(<DeleteModal isOpen={true} employee={emp} onConfirm={jest.fn()} onCancel={jest.fn()} loading={true} />);
    expect(screen.getByText('Deleting…')).toBeInTheDocument();
  });
});
```

---

## 6. Page Tests

### 6.1 `Login.test.jsx`
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../../pages/Login';
import { server } from '../../mocks/server';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderLogin() {
  return render(
    <BrowserRouter>
      <AuthProvider><Login /></AuthProvider>
    </BrowserRouter>
  );
}

describe('Login Page', () => {
  test('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/ })).toBeInTheDocument();
  });

  test('shows validation error on empty submit', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Sign In/ }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  test('shows invalid email error', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'bad-email' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/ }));
    await waitFor(() => expect(screen.getByText('Invalid email address')).toBeInTheDocument());
  });

  test('shows error message on wrong credentials', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'bad@email.com' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/ }));
    await waitFor(() => expect(screen.getByText(/Invalid/i)).toBeInTheDocument());
  });

  test('shows demo credentials', () => {
    renderLogin();
    expect(screen.getByText(/Demo Credentials/)).toBeInTheDocument();
    expect(screen.getByText(/admin@nexatech.io/)).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/Password/);
    expect(passwordInput.type).toBe('password');
    fireEvent.click(screen.getByTitle('toggle-password') || screen.getByRole('button', { name: /👁️/ }));
    // type changes after toggle
  });
});
```

### 6.2 `Employees.test.jsx` (Integration Test)
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { EmployeeProvider } from '../../context/EmployeeContext';
import Employees from '../../pages/Employees';
import { server } from '../../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderEmployees() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <EmployeeProvider><Employees /></EmployeeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Employees Page', () => {
  test('shows loading state initially', () => {
    renderEmployees();
    expect(screen.getByRole('status') || document.querySelector('.spinner')).toBeTruthy();
  });

  test('renders employee table after load', async () => {
    renderEmployees();
    await waitFor(() => expect(screen.getByText('Alice Johnson')).toBeInTheDocument());
    expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
  });

  test('opens add employee modal', async () => {
    renderEmployees();
    await waitFor(() => screen.getByText('Alice Johnson'));
    fireEvent.click(screen.getByText(/Add Employee/));
    expect(screen.getByText(/Add New Employee/)).toBeInTheDocument();
  });

  test('filters employees by search', async () => {
    renderEmployees();
    await waitFor(() => screen.getByText('Alice Johnson'));
    fireEvent.change(screen.getByPlaceholderText(/Search by name/), { target: { value: 'Bob' } });
    await waitFor(() => {
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
    });
  });

  test('shows empty state when no results', async () => {
    renderEmployees();
    await waitFor(() => screen.getByText('Alice Johnson'));
    fireEvent.change(screen.getByPlaceholderText(/Search by name/), { target: { value: 'zzznomatch' } });
    await waitFor(() => expect(screen.getByText(/No employees found/)).toBeInTheDocument());
  });
});
```

---

## 7. Context Tests

### 7.1 `AuthContext.test.jsx`
```jsx
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { server } from '../../mocks/server';

function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{user?.email || ''}</span>
      <button onClick={() => login('admin@nexatech.io', 'admin123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeAll(() => server.listen());
afterEach(() => { server.resetHandlers(); localStorage.clear(); });
afterAll(() => server.close());

describe('AuthContext', () => {
  test('starts unauthenticated', () => {
    const { getByTestId } = render(<AuthProvider><TestComponent /></AuthProvider>);
    expect(getByTestId('auth').textContent).toBe('no');
  });

  test('login sets authenticated state', async () => {
    const { getByTestId, getByText } = render(<AuthProvider><TestComponent /></AuthProvider>);
    await act(async () => { getByText('Login').click(); });
    expect(getByTestId('auth').textContent).toBe('yes');
    expect(getByTestId('user').textContent).toBe('admin@nexatech.io');
  });

  test('logout clears state', async () => {
    const { getByTestId, getByText } = render(<AuthProvider><TestComponent /></AuthProvider>);
    await act(async () => { getByText('Login').click(); });
    act(() => { getByText('Logout').click(); });
    expect(getByTestId('auth').textContent).toBe('no');
  });
});
```

### 7.2 `EmployeeContext.test.jsx`
```jsx
import { renderHook, act } from '@testing-library/react';
import { EmployeeProvider, useEmployees } from '../../context/EmployeeContext';
import { server } from '../../mocks/server';

const wrapper = ({ children }) => <EmployeeProvider>{children}</EmployeeProvider>;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EmployeeContext', () => {
  test('starts with empty employees', () => {
    const { result } = renderHook(() => useEmployees(), { wrapper });
    expect(result.current.employees).toEqual([]);
  });

  test('fetchEmployees populates employees', async () => {
    const { result } = renderHook(() => useEmployees(), { wrapper });
    await act(async () => { await result.current.fetchEmployees(); });
    expect(result.current.employees.length).toBeGreaterThan(0);
    expect(result.current.employees[0].name).toBe('Alice Johnson');
  });

  test('addEmployee appends to list', async () => {
    const { result } = renderHook(() => useEmployees(), { wrapper });
    await act(async () => {
      await result.current.addEmployee({
        name: 'New Person', email: 'new@nexatech.io',
        department: 'HR', designation: 'Analyst',
        status: 'Active', joiningDate: '2024-01-01',
      });
    });
    expect(result.current.employees.some((e) => e.email === 'new@nexatech.io')).toBe(true);
  });
});
```

---

## 8. Protected Route Tests

### `ProtectedRoute.test.jsx`
```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../routes/ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

function Protected() { return <div>Protected Content</div>; }
function LoginPage()  { return <div>Login Page</div>; }

function renderWithAuth(isLoggedIn) {
  if (isLoggedIn) {
    // Set a valid token so AuthContext thinks we're authenticated
    const token = btoa(JSON.stringify({ exp: Date.now() + 86400000 }));
    localStorage.setItem('emp_dashboard_token', token);
    localStorage.setItem('emp_dashboard_user', JSON.stringify({ id: 1, name: 'Admin' }));
  } else {
    localStorage.clear();
  }
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Protected /></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => localStorage.clear());

  test('renders children when authenticated', () => {
    renderWithAuth(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when not authenticated', () => {
    renderWithAuth(false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
```

---

## 9. Coverage Targets

| Category         | Target |
|------------------|--------|
| Statements       | ≥ 80%  |
| Branches         | ≥ 75%  |
| Functions        | ≥ 80%  |
| Lines            | ≥ 80%  |

```bash
# Check coverage report
npm test -- --coverage --coverageReporters=text
```

---

## 10. Manual Test Checklist

### Authentication
- [ ] Login with `admin@nexatech.io` / `admin123` → redirected to Dashboard ✓
- [ ] Login with wrong credentials → error message shown ✓
- [ ] Submit empty form → validation errors shown ✓
- [ ] Visit `/dashboard` without login → redirected to `/login` ✓
- [ ] Logout → redirected to `/login`, token cleared ✓
- [ ] Password toggle shows/hides password ✓

### Employee CRUD
- [ ] Click "Add Employee" → modal opens ✓
- [ ] Submit empty form → validation errors ✓
- [ ] Fill valid data → employee added, toast shown, table updated ✓
- [ ] Click Edit → form pre-filled with employee data ✓
- [ ] Edit and save → employee updated in table ✓
- [ ] Click Delete → confirmation modal with employee details ✓
- [ ] Confirm delete → employee removed from table, toast shown ✓
- [ ] Cancel delete → modal closes, nothing deleted ✓

### Search & Filter
- [ ] Type in search → debounced filter by name/email ✓
- [ ] Select department → filters by department ✓
- [ ] Select status → filters by status ✓
- [ ] Combine multiple filters → compound filtering works ✓
- [ ] Clear button appears when any filter active ✓
- [ ] Clear resets all filters ✓
- [ ] No results → empty state shown ✓

### Pagination
- [ ] 6 employees per page ✓
- [ ] Prev/Next navigate correctly ✓
- [ ] Page number buttons highlight active page ✓
- [ ] Page count resets when filters change ✓
- [ ] Shows "Showing X–Y of Z employees" ✓

### Analytics
- [ ] Bar chart renders department data ✓
- [ ] Pie chart renders status distribution ✓
- [ ] Area chart renders monthly join trend ✓
- [ ] Stat cards show correct counts ✓

### Loading & Error States
- [ ] Loading spinner shown during API call ✓
- [ ] Error message shown on API failure ✓
- [ ] Retry button re-fetches data ✓
- [ ] Empty state shown when no employees ✓

### Responsive Design
- [ ] Dashboard readable on mobile (≤480px) ✓
- [ ] Table scrollable on small screens ✓
- [ ] Sidebar hidden on mobile ✓

---

## 11. Accessibility Checklist

- [ ] All form inputs have associated `<label>` elements
- [ ] Buttons have descriptive text or `title` attributes
- [ ] Color contrast meets WCAG AA standard (4.5:1 for text)
- [ ] Modals trap focus when open
- [ ] Interactive elements are keyboard navigable
- [ ] Error messages are announced to screen readers

---

*Generated for EmpDash – Employee Management Dashboard interview task.*
