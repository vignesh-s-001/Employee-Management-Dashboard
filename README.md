# EmpDash – Employee Management Dashboard

A full-stack **React + json-server** Employee Management Dashboard built as a technical interview assessment. Features authentication, full CRUD, analytics charts, debounced search, filtering, pagination, and more.

---

## 🚀 Live Demo

| Screen | Route |
|---|---|
| Login | `/login` |
| Dashboard Overview | `/dashboard` |
| Employee Management | `/employees` |
| Analytics | `/analytics` |

**Demo Credentials:**
- `admin@nexatech.io` / `admin123`
- `hr@nexatech.io` / `hr123`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router DOM v6 |
| State | Context API + useReducer |
| HTTP | Axios |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Backend (Mock) | json-server |
| Styling | Custom CSS (Dark Glassmorphism) |

---

## ✅ Features Implemented

### 1. Authentication Module
- ✅ Login page with email + password fields
- ✅ Form validation (required, email format)
- ✅ Mock JWT token generation + storage in localStorage
- ✅ Authenticated users redirected to dashboard
- ✅ Logout functionality (sidebar + navbar)
- ✅ Password show/hide toggle

### 2. Employee Management
- ✅ Employee listing table with: Name, Email, Department, Designation, Status, Joining Date
- ✅ Avatar initials auto-generated

### 3. CRUD Operations
- ✅ **Create** – Add employee modal with full validation
- ✅ **Edit** – Pre-filled update modal
- ✅ **Delete** – Confirmation popup with employee preview

### 4. Search & Filter
- ✅ Debounced search by employee name / email
- ✅ Filter by department (6 departments)
- ✅ Filter by status (Active / Inactive / On Leave)
- ✅ Clear all filters button

### 5. Analytics Dashboard
- ✅ Total / Active / Inactive / On Leave stat cards
- ✅ Department-wise bar chart (Recharts)
- ✅ Employee status donut pie chart
- ✅ Monthly joining area chart

### 6. Pagination
- ✅ 6 employees per page
- ✅ Page numbers with ellipsis
- ✅ Prev / Next buttons
- ✅ Resets on filter change

### 7. Loading & Error Handling
- ✅ Loading spinner for all API calls
- ✅ Error messages with retry button
- ✅ Empty state for no results

### Bonus Features
- ✅ Context API + useReducer (global state)
- ✅ Protected Routes (unauthenticated redirect)
- ✅ Debounced Search (400ms)
- ✅ Responsive Design
- ✅ Toast notifications for CRUD actions
- ✅ SEO meta tags

---

## 📁 Project Structure

```
Employee-Management-Dashboard/
├── backend/
│   ├── db.json           # 15 mock employees + 2 users
│   ├── middleware.js      # /login endpoint handler
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance + API calls
│   │   │   ├── axiosInstance.js
│   │   │   ├── auth.js
│   │   │   └── employees.js
│   │   ├── components/   # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── EmployeeTable.jsx
│   │   │   ├── EmployeeForm.jsx
│   │   │   ├── DeleteModal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchFilter.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── context/      # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── EmployeeContext.jsx
│   │   ├── hooks/
│   │   │   └── useDebounce.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   └── Analytics.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── utils/
│   │   │   └── auth.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── vite.config.js
└── docs/
    └── TESTING.md        # Complete test documentation
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9


### 1. Install & Start Backend (json-server)

```bash
# Option A – Command Prompt (recommended on Windows)
cd backend
npm install
npm run serve

# Option B – PowerShell
cmd /c "npm install"
cmd /c "npm run serve"
# Runs at http://localhost:5000
```

### 2. Install & Start Frontend

```bash
# Option A – Command Prompt (recommended on Windows)
cd frontend
npm install
npm run dev

# Option B – PowerShell
cmd /c "npm install"
cmd /c "npm run dev"
# Runs at http://localhost:3000
```

### 3. Open in browser
Navigate to **http://localhost:3000** and log in with demo credentials.

---

## 🧪 Testing

See [docs/TESTING.md](./docs/TESTING.md) for the complete test documentation including:
- Test environment setup (Jest + React Testing Library + MSW)
- Unit tests for utilities and hooks
- Component tests for all UI components
- Integration tests for pages
- Context tests
- Manual test checklist
- Coverage targets

```bash
# Quick install test dependencies
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jest jest-environment-jsdom msw

# Run tests
npm test
```

---

## 🎨 Design

- **Theme**: Dark glassmorphism with purple accent (`#6c63ff`)
- **Font**: Inter (Google Fonts)
- **Animations**: Slide-up modals, fade-in overlays, spin loader, hover transforms
- **Responsive**: Mobile-first, sidebar hidden on `<768px`

---

## 📝 API Endpoints (json-server)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Authenticate user (`admin@nexatech.io` / `admin123`), returns JWT |
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create new employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

---

## 📄 License

MIT – Built for interview assessment purposes.