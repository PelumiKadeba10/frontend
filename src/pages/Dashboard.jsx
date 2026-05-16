import { DataTable } from "../components/DataTable";
import { SummaryCard } from "../components/SummaryCard";
import { endpoints } from "../api/client";
import { Link } from "react-router-dom";
import { useApiData } from "../hooks/useApiData";

export default function Dashboard() {
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
  } = useApiData(endpoints.students);
  const {
    data: attendance,
    loading: attendanceLoading,
    error: attendanceError,
  } = useApiData(endpoints.attendance);

  const today = new Date().toISOString().slice(0, 10);
  const presentToday = (attendance || []).filter((item) => item.date === today).length;

  const latest = (attendance || []).slice(0, 8).map((item) => ({
    id: item.id,
    student: item.student_name ?? "Unknown",
    date: item.date,
    time: item.time,
    status: item.status ?? "present",
  }));

  const loading = studentsLoading || attendanceLoading;
  const error = studentsError || attendanceError;

  return (
    <section className="page">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="muted">Realtime snapshot of attendance activity and student totals.</p>
        </div>

        <div className="">
          <Link to="/sessions">
            <button
              className="primary"
            >
              Manage Sessions
            </button>
          </Link>
        </div>
      </header>

      {error ? <div className="banner banner-error">{error}</div> : null}

      <div className="summary-grid">
        <SummaryCard title="Total Students" value={students.length || 0} hint="Managed in Supabase" />
        <SummaryCard title="Present Today" value={presentToday} hint={`Date: ${today}`} />
        <SummaryCard title="Total Attendance Records" value={attendance.length || 0} hint="All-time" />
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Latest Attendance</h2>
            <p className="muted">Most recent check-ins from the recognition pipeline.</p>
          </div>
        </div>
        {loading ? (
          <p className="muted">Loading attendance...</p>
        ) : (
          <DataTable
            columns={[
              { key: "student", label: "Student" },
              { key: "date", label: "Date" },
              { key: "time", label: "Time" },
              { key: "status", label: "Status" },
            ]}
            rows={latest}
            emptyLabel="No attendance recorded yet."
          />
        )}
      </section>
    </section>
  );
}
