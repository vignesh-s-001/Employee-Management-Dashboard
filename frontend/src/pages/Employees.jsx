import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import SearchFilter from '../components/SearchFilter';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeForm from '../components/EmployeeForm';
import DeleteModal from '../components/DeleteModal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useEmployees } from '../context/EmployeeContext';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 6;

export default function Employees() {
  const { employees, loading, error, fetchEmployees, addEmployee, editEmployee, removeEmployee } = useEmployees();

  /* ---- Search / Filter ---- */
  const [search, setSearch]         = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus]         = useState('');
  const debouncedSearch             = useDebounce(search, 400);

  /* ---- Pagination ---- */
  const [currentPage, setCurrentPage] = useState(1);

  /* ---- Form / Delete Modal ---- */
  const [formOpen, setFormOpen]         = useState(false);
  const [selectedEmp, setSelectedEmp]   = useState(null);
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading]   = useState(false);

  useEffect(() => { if (employees.length === 0) fetchEmployees(); }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, department, status]);

  /* ---- Filtered employees ---- */
  const filtered = useMemo(() => {
    let list = [...employees];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
      );
    }
    if (department) list = list.filter((e) => e.department === department);
    if (status)     list = list.filter((e) => e.status === status);
    return list;
  }, [employees, debouncedSearch, department, status]);

  /* ---- Paginated slice ---- */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ---- Handlers ---- */
  function openAdd()       { setSelectedEmp(null); setFormOpen(true); }
  function openEdit(emp)   { setSelectedEmp(emp);  setFormOpen(true); }
  function openDelete(emp) { setDeleteTarget(emp); setDeleteOpen(true); }

  async function handleFormSubmit(data) {
    setFormLoading(true);
    try {
      if (selectedEmp?.id) {
        await editEmployee(selectedEmp.id, data);
        toast.success('Employee updated successfully!');
      } else {
        await addEmployee(data);
        toast.success('Employee added successfully!');
      }
      setFormOpen(false);
    } catch {
      toast.error('Failed to save employee. Please try again.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    setFormLoading(true);
    try {
      await removeEmployee(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted successfully.`);
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete employee.');
    } finally {
      setFormLoading(false);
    }
  }

  function handleReset() {
    setSearch(''); setDepartment(''); setStatus(''); setCurrentPage(1);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar
        title="Employees"
        subtitle={`${employees.length} total employees registered`}
      />

      <div className="page-wrapper">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Employee Directory</h2>
            <p className="page-subtitle">Manage your team members</p>
          </div>
          <button id="add-employee-btn" className="btn btn-primary" onClick={openAdd}>
            ➕ Add Employee
          </button>
        </div>

        {/* Search & Filter */}
        <SearchFilter
          search={search}         onSearch={setSearch}
          department={department} onDepartment={setDepartment}
          status={status}         onStatus={setStatus}
          onReset={handleReset}
        />

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchEmployees} />
        ) : paginated.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No employees found"
            subtitle={
              search || department || status
                ? 'Try adjusting your search or filters.'
                : 'No employees yet. Add your first employee!'
            }
            action={
              !search && !department && !status && (
                <button className="btn btn-primary" onClick={openAdd}>➕ Add Employee</button>
              )
            }
          />
        ) : (
          <>
            <EmployeeTable employees={paginated} onEdit={openEdit} onDelete={openDelete} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <EmployeeForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedEmp}
        loading={formLoading}
      />
      <DeleteModal
        isOpen={deleteOpen}
        employee={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        loading={formLoading}
      />
    </div>
  );
}
