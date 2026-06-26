import { useState, useEffect } from 'react';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance', 'Sales'];
const STATUSES    = ['Active', 'Inactive', 'On Leave'];

const EMPTY_FORM = {
  name: '', email: '', department: '', designation: '', status: 'Active', joiningDate: '', phone: '',
};

function getInitials(name) {
  return name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '??';
}

function validate(form) {
  const errors = {};
  if (!form.name.trim())        errors.name        = 'Name is required';
  if (!form.email.trim())       errors.email       = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email address';
  if (!form.department)         errors.department  = 'Department is required';
  if (!form.designation.trim()) errors.designation = 'Designation is required';
  if (!form.status)             errors.status      = 'Status is required';
  if (!form.joiningDate)        errors.joiningDate = 'Joining date is required';
  return errors;
}

export default function EmployeeForm({ isOpen, onClose, onSubmit, initialData, loading }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen, initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    const payload = { ...form, avatar: getInitials(form.name) };
    await onSubmit(payload);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="employee-form-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem' }}>
            {isEditing ? '✏️ Edit Employee' : '➕ Add New Employee'}
          </h2>
          <button id="modal-close-btn" className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <form id="employee-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Name */}
              <div className="input-group full-width">
                <label className="input-label" htmlFor="emp-name">Full Name *</label>
                <input id="emp-name" name="name" className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Alice Johnson" value={form.name} onChange={handleChange} />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="input-group">
                <label className="input-label" htmlFor="emp-email">Email *</label>
                <input id="emp-email" name="email" type="email" className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="alice@nexatech.io" value={form.email} onChange={handleChange} />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="input-group">
                <label className="input-label" htmlFor="emp-phone">Phone</label>
                <input id="emp-phone" name="phone" className="input"
                  placeholder="+1-555-0000" value={form.phone} onChange={handleChange} />
              </div>

              {/* Department */}
              <div className="input-group">
                <label className="input-label" htmlFor="emp-department">Department *</label>
                <select id="emp-department" name="department" className={`input ${errors.department ? 'input-error' : ''}`}
                  value={form.department} onChange={handleChange}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className="error-text">{errors.department}</span>}
              </div>

              {/* Designation */}
              <div className="input-group">
                <label className="input-label" htmlFor="emp-designation">Designation *</label>
                <input id="emp-designation" name="designation" className={`input ${errors.designation ? 'input-error' : ''}`}
                  placeholder="e.g. Software Engineer" value={form.designation} onChange={handleChange} />
                {errors.designation && <span className="error-text">{errors.designation}</span>}
              </div>

              {/* Status */}
              <div className="input-group">
                <label className="input-label" htmlFor="emp-status">Status *</label>
                <select id="emp-status" name="status" className={`input ${errors.status ? 'input-error' : ''}`}
                  value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.status && <span className="error-text">{errors.status}</span>}
              </div>

              {/* Joining Date */}
              <div className="input-group">
                <label className="input-label" htmlFor="emp-joiningDate">Joining Date *</label>
                <input id="emp-joiningDate" name="joiningDate" type="date" className={`input ${errors.joiningDate ? 'input-error' : ''}`}
                  value={form.joiningDate} onChange={handleChange} />
                {errors.joiningDate && <span className="error-text">{errors.joiningDate}</span>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" id="modal-cancel-btn" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="modal-submit-btn" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEditing ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
