import { useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useEmployees } from '../context/EmployeeContext';

const COLORS = ['#6c63ff', '#4facfe', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Custom tooltip for all charts
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      fontSize: '0.85rem',
      boxShadow: 'var(--shadow-soft)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--color-text)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { employees, loading, error, fetchEmployees } = useEmployees();

  useEffect(() => { if (employees.length === 0) fetchEmployees(); }, []);

  const stats = useMemo(() => {
    const total    = employees.length;
    const active   = employees.filter((e) => e.status === 'Active').length;
    const inactive = employees.filter((e) => e.status === 'Inactive').length;
    const onLeave  = employees.filter((e) => e.status === 'On Leave').length;

    // Department-wise count
    const deptMap = {};
    employees.forEach((e) => { deptMap[e.department] = (deptMap[e.department] || 0) + 1; });
    const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

    // Status distribution for pie
    const statusData = [
      { name: 'Active',   value: active,   color: '#22c55e' },
      { name: 'Inactive', value: inactive, color: '#ef4444' },
      { name: 'On Leave', value: onLeave,  color: '#f59e0b' },
    ].filter((d) => d.value > 0);

    // Monthly joining trend – current year (2026)
    const year = new Date().getFullYear();
    const monthlyMap = {};
    MONTHS.forEach((m) => { monthlyMap[m] = 0; }); // seed all 12 months with 0
    employees.forEach((e) => {
      const d = new Date(e.joiningDate);
      if (d.getFullYear() === year) {
        const monthName = MONTHS[d.getMonth()];
        monthlyMap[monthName] = (monthlyMap[monthName] || 0) + 1;
      }
    });
    const monthlyData = MONTHS.map((m) => ({ month: m, joined: monthlyMap[m] }));

    return { total, active, inactive, onLeave, deptData, statusData, monthlyData };
  }, [employees]);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Analytics" subtitle="Employee data insights" />
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Analytics" subtitle="Employee data insights" />
      <ErrorMessage message={error} onRetry={fetchEmployees} />
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Analytics" subtitle="Employee data insights" />

      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h2 className="page-title">Analytics Dashboard</h2>
            <p className="page-subtitle">Visual breakdown of your employee data</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <StatCard icon="👥" label="Total Employees" value={stats.total}    color="#6c63ff" />
          <StatCard icon="✅" label="Active"           value={stats.active}   color="#22c55e" />
          <StatCard icon="❌" label="Inactive"         value={stats.inactive} color="#ef4444" />
          <StatCard icon="🏖️" label="On Leave"         value={stats.onLeave}  color="#f59e0b" />
        </div>

        <div className="chart-grid">
          {/* Department-wise Bar Chart */}
          <div className="chart-card">
            <div className="chart-card-title">🏢 Employees by Department</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.deptData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10, angle: -35, textAnchor: 'end', dy: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Employees" radius={[6, 6, 0, 0]}>
                  {stats.deptData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Pie Chart */}
          <div className="chart-card">
            <div className="chart-card-title">📊 Employee Status Distribution</div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ cx, cy, midAngle, outerRadius, name, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="var(--color-text)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={{ stroke: 'var(--color-text-muted)' }}
                >
                  {stats.statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Joining Area Chart */}
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <div className="chart-card-title">📅 Monthly Joining Trend (This Year)</div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorJoined" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="joined"
                  name="Joined"
                  stroke="#6c63ff"
                  strokeWidth={2.5}
                  fill="url(#colorJoined)"
                  dot={{ fill: '#6c63ff', r: 4 }}
                  activeDot={{ r: 6, fill: '#6c63ff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
