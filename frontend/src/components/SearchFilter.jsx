const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Sales'];
const STATUSES    = ['Active', 'Inactive', 'On Leave'];

export default function SearchFilter({ search, onSearch, department, onDepartment, status, onStatus, onReset }) {
  return (
    <div className="search-filter-bar">
      {/* Search Input */}
      <div className="search-wrapper">
        <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
        <input
          id="search-employees"
          type="text"
          className="input search-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Department Filter */}
      <select
        id="filter-department"
        className="input"
        style={{ width: 180 }}
        value={department}
        onChange={(e) => onDepartment(e.target.value)}
      >
        <option value="">All Departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        id="filter-status"
        className="input"
        style={{ width: 150 }}
        value={status}
        onChange={(e) => onStatus(e.target.value)}
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Reset */}
      {(search || department || status) && (
        <button className="btn btn-ghost btn-sm" onClick={onReset}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}
