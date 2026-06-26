# EmpDash – Complete Project Architecture & Flow Guide

> This document explains **how the entire application works** – from the moment a user visits the page to how data is saved and displayed.

---

## 🏗️ Overall Architecture

```
Browser (React App on port 3000)
        │
        │  /api/* requests (proxied by Vite)
        ▼
json-server (Mock Backend on port 5000)
        │
        │  reads/writes
        ▼
    db.json (our "database")
```

The frontend and backend are **two completely separate processes** that run together:

| Process | Port | Technology | Purpose |
|---|---|---|---|
| Frontend | 3000 | React + Vite | UI, routing, state |
| Backend | 5000 | json-server | REST API + data |

---

## 📁 Folder Structure Explained

```
Employee-Management-Dashboard/
│
├── backend/                    ← Mock server
│   ├── db.json                 ← Our "database" (JSON file with users + employees)
│   ├── middleware.js           ← Custom /login and /register logic
│   └── package.json
│
├── frontend/                   ← React application
│   └── src/
│       ├── api/                ← HTTP call functions (Axios)
│       │   ├── axiosInstance.js  ← Configured Axios with base URL + JWT header
│       │   ├── auth.js           ← loginUser(), registerUser() functions
│       │   └── employees.js      ← CRUD functions (getEmployees, create, update, delete)
│       │
│       ├── context/            ← Global React state (shared across all pages)
│       │   ├── AuthContext.jsx   ← Who is logged in? login/signup/logout actions
│       │   └── EmployeeContext.jsx ← All employee data + CRUD dispatch actions
│       │
│       ├── hooks/
│       │   └── useDebounce.js  ← Delays search input by 400ms
│       │
│       ├── pages/              ← Full screen views
│       │   ├── Login.jsx       ← Public page: email + password form
│       │   ├── Signup.jsx      ← Public page: registration form
│       │   ├── Dashboard.jsx   ← Protected: overview + stats
│       │   ├── Employees.jsx   ← Protected: CRUD table + filters
│       │   └── Analytics.jsx   ← Protected: charts (Recharts)
│       │
│       ├── components/         ← Smaller, reusable pieces used in pages
│       │   ├── Sidebar.jsx       ← Left nav links + user info + logout
│       │   ├── Navbar.jsx        ← Top bar with page title + date
│       │   ├── EmployeeTable.jsx ← Renders the employee rows
│       │   ├── EmployeeForm.jsx  ← Add/Edit modal form
│       │   ├── DeleteModal.jsx   ← Confirmation popup before delete
│       │   ├── Pagination.jsx    ← Page number controls
│       │   ├── SearchFilter.jsx  ← Search bar + dropdowns
│       │   ├── StatCard.jsx      ← Colorful KPI cards
│       │   ├── LoadingSpinner.jsx ← Shown during API calls
│       │   ├── ErrorMessage.jsx  ← Shown when API fails
│       │   └── EmptyState.jsx    ← Shown when no data
│       │
│       ├── routes/
│       │   └── ProtectedRoute.jsx ← Redirects to /login if not authenticated
│       │
│       ├── utils/
│       │   └── auth.js         ← localStorage helpers (save/read/clear token)
│       │
│       ├── App.jsx             ← Root: defines all routes
│       ├── main.jsx            ← Entry point: renders App
│       └── index.css           ← All styling (CSS variables, components, animations)
│
└── docs/
    ├── TESTING.md              ← Complete test documentation
    └── PROJECT_FLOW.md         ← This file
```

---

## 🔐 Authentication Flow (Step by Step)

### Login Flow

```
User visits /login
    │
    ▼
Login.jsx renders form
    │
User types email + password → clicks "Sign In"
    │
    ▼
handleSubmit() validates form (client-side: required, email format)
    │
    ▼
login() in AuthContext.jsx is called
    │
    ▼
loginUser() in api/auth.js sends:
    POST /api/login  →  proxied to  →  POST http://localhost:5000/login
    Body: { email, password }
    │
    ▼
middleware.js on backend:
    - Finds user in db.json where email + password match
    - If found: creates mock JWT token (base64 encoded JSON with exp)
    - Returns: { success: true, token, user }
    - If not found: returns 401 { success: false, message }
    │
    ▼
AuthContext receives response:
    - setAuth(token, user)  →  saves to localStorage
    - setUser(user)         →  React state updated
    │
    ▼
isAuthenticated becomes TRUE
    │
    ▼
navigate('/dashboard') → React Router redirects
    │
    ▼
ProtectedRoute checks isAuthenticated → allows access → Dashboard renders
```

### Signup Flow

```
User visits /signup
    │
    ▼
Signup.jsx renders registration form
    │
User fills: name, email, role, password, confirm password
    │
    ▼
handleSubmit() validates:
    - All fields required
    - Email format valid
    - Password >= 6 chars
    - Passwords match
    │
    ▼
signup() in AuthContext → registerUser() in api/auth.js sends:
    POST /api/register → http://localhost:5000/register
    Body: { name, email, password, role }
    │
    ▼
middleware.js on backend:
    - Validates required fields
    - Checks if email already exists in db.json
    - If duplicate: returns 409 error
    - If new: adds user to db.json, creates token
    - Returns: { success: true, token, user }
    │
    ▼
AuthContext saves token + sets user → auto-logged in
    │
    ▼
navigate('/dashboard') → user is inside the app
```

### Token Storage & Refresh Detection

```javascript
// Stored in localStorage:
emp_dashboard_token  →  base64({ id, email, role, exp: timestamp })
emp_dashboard_user   →  JSON({ id, name, email, role })

// On page refresh – AuthContext initializes:
isTokenValid() checks:
  - Is there a token in localStorage?
  - Is exp (expiry) > Date.now()?
  ├── YES → stays logged in
  └── NO  → user = null → redirected to /login
```

### JWT Attached to Every Request

```javascript
// axiosInstance.js – request interceptor runs before every API call
config.headers.Authorization = `Bearer ${token}`;
```

---

## 👥 Employee CRUD Flow

All employee data lives in **EmployeeContext** (global state). Changes on the Employees page immediately reflect in Dashboard and Analytics.

### Fetch Flow

```
Employees page mounts
    │
    ▼
useEffect → fetchEmployees()
    │
dispatch({ type: 'FETCH_START' }) → loading = true (spinner shown)
    │
GET /api/employees → json-server returns array from db.json
    │
dispatch({ type: 'FETCH_SUCCESS', payload: data }) → employees = data
    │
loading = false → table renders
```

### Add Employee Flow

```
User clicks "Add Employee" → EmployeeForm modal opens (empty)
    │
User fills + submits → validation passes
    │
addEmployee(payload):
    POST /api/employees → json-server adds to db.json, returns new record
    │
dispatch({ type: 'ADD_EMPLOYEE' }) → employees array updated in memory
    │
toast.success + modal closes + table updates instantly
```

### Edit Employee Flow

```
User clicks Edit on a row → selectedEmp = that employee
    │
EmployeeForm modal opens with pre-filled values
    │
User edits + submits
    │
editEmployee(id, newData):
    PUT /api/employees/:id → json-server updates record in db.json
    │
dispatch({ type: 'UPDATE_EMPLOYEE' }) → replaces old record in array
    │
toast.success + modal closes + row updates
```

### Delete Employee Flow

```
User clicks Delete → DeleteModal opens with employee preview
    │
User clicks "Yes, Delete"
    │
removeEmployee(id):
    DELETE /api/employees/:id → json-server removes from db.json
    │
dispatch({ type: 'DELETE_EMPLOYEE' }) → removes from array by id
    │
toast.success + modal closes + row disappears
```

---

## 🔍 Search, Filter & Pagination Flow

All filtering happens **100% in the browser** (no extra API calls):

```
employees[] (all from context)
    │
    ▼
useMemo applies filters:
  1. debouncedSearch (400ms delay) → name.includes(q) || email.includes(q)
  2. department filter              → department === selected
  3. status filter                  → status === selected
    │
    ▼
filtered[] (subset)
    │
    ▼
Pagination slices: filtered.slice((page-1)*6, page*6)
    │
    ▼
paginated[] → rendered in EmployeeTable
```

### Why Debounce?

```
Without debounce: user types "Ali" → 3 filter runs (A, Al, Ali)
With debounce:    user types "Ali" → 1 filter run (after 400ms of silence)
```

---

## 📊 Analytics Flow

```
Analytics page mounts → fetchEmployees() if list is empty
    │
    ▼
useMemo computes from employees[]:

  total, active, inactive, onLeave  →  StatCards

  deptMap: { Engineering:5, Design:2, ... }
  mapped to [{ name, value }]        →  Bar Chart

  statusData: [{ Active:9 }, ...]    →  Pie/Donut Chart

  monthlyMap: { Jan:2, Feb:2, Mar:2, Apr:2, May:3, Jun:4 }
  mapped to [{ month, joined }]      →  Area Chart
    │
    ▼
Recharts renders all 3 charts with computed data
```

---

## 🛡️ Route Protection Flow

```
App.jsx defines routes:
  /login   → public  → Login.jsx
  /signup  → public  → Signup.jsx

  /dashboard  → ProtectedRoute → Dashboard.jsx
  /employees  → ProtectedRoute → Employees.jsx
  /analytics  → ProtectedRoute → Analytics.jsx
    │
    ▼
ProtectedRoute checks isAuthenticated (from AuthContext)
  ├── TRUE  → render the page
  └── FALSE → Navigate to="/login" (saves intended URL for redirect back after login)
```

---

## 📡 API Proxy (How Frontend Talks to Backend)

Vite's dev server has a **proxy** configured in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    rewrite: (path) => path.replace(/^\/api/, ''),
  }
}
```

This means:
```
Frontend calls:   /api/employees
     Vite rewrites to:
Backend receives: http://localhost:5000/employees
```

No hardcoded ports in the frontend code!

---

## 🗄️ Backend (json-server) Explained

json-server reads `db.json` and **auto-creates a full REST API**:

| db.json key | Auto-generated routes |
|---|---|
| `"users"` | GET/POST/PUT/DELETE `/users` and `/users/:id` |
| `"employees"` | GET/POST/PUT/DELETE `/employees` and `/employees/:id` |

`middleware.js` intercepts two special routes:
- `POST /login` – validates credentials, returns mock JWT
- `POST /register` – checks for duplicate email, creates user, returns JWT

All other requests pass through to json-server normally.

---

## 🔄 State Management (Context API)

Two Context providers wrap the entire app:

```jsx
<AuthProvider>         ← manages: user, token, login, signup, logout
  <EmployeeProvider>   ← manages: employees[], loading, error, CRUD actions
    <App />
  </EmployeeProvider>
</AuthProvider>
```

Any component can access these via hooks:
```javascript
const { user, login, logout } = useAuth();
const { employees, addEmployee, removeEmployee } = useEmployees();
```

EmployeeContext uses `useReducer` for predictable state transitions:

```javascript
dispatch({ type: 'FETCH_START' })           // loading = true
dispatch({ type: 'FETCH_SUCCESS', payload }) // employees = payload
dispatch({ type: 'ADD_EMPLOYEE', payload })  // [...employees, payload]
dispatch({ type: 'UPDATE_EMPLOYEE', payload }) // replace by id
dispatch({ type: 'DELETE_EMPLOYEE', payload }) // filter by id
```

---

## ⚡ Performance Patterns Used

| Pattern | Where | Why |
|---|---|---|
| `useMemo` | Employees + Analytics | Prevents re-filtering on every render |
| `useCallback` | AuthContext, EmployeeContext | Prevents functions from being recreated |
| `useDebounce` | Search input | Reduces filter calls while typing |
| Pagination (6/page) | Employees table | Only renders 6 rows at a time |
| Lazy fetch | All pages | Only fetches employees if list is empty |

---

## 🎯 Key Interview Points

1. **JWT is mocked** – token is base64-encoded JSON (not cryptographically signed). In production use `jsonwebtoken` with a secret key.
2. **Passwords are plain text** in db.json – in production use `bcrypt` hashing.
3. **json-server auto-reloads** when db.json changes (live database).
4. **Context API** replaces Redux for this scale – simpler, built into React.
5. **Protected routes** use React Router's `Navigate` component.
6. **Debounced search** prevents performance issues with large datasets.
7. **All filtering/pagination is client-side** – in production you'd pass `?name_like=&department=` query params to the API.
