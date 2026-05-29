import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { SummaryCard } from "../components/SummaryCard";
import { useApiData } from "../hooks/useApiData";

export default function Dashboard() {
  // STUDENTS
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useApiData("/management/students/");

  // ATTENDANCE
  const {
    data: attendance,
    loading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useApiData("/attendance/");

  // LOADING + ERROR STATES
  const loading = studentsLoading || attendanceLoading;
  const error = studentsError || attendanceError;

  // TODAY
  const today = new Date().toISOString().slice(0, 10);

  // PRESENT TODAY
  const presentToday = attendance.filter(
    (item) => item.date === today
  ).length;

  // LATEST ATTENDANCE
  const latestAttendance = attendance
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      student: item.student_name || "Unknown",
      date: item.date,
      time: item.time,
      status: item.status || "present",
    }));

  // REFRESH ALL
  const refreshDashboard = () => {
    refetchStudents();
    refetchAttendance();
  };

  return (
    <section className="page">
      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Overview</p>

          <h1>Dashboard</h1>

          <p className="muted">
            Realtime snapshot of attendance activity and student totals.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="banner banner-error">
            {error}
          </div>
        )}

        <div className="dashboard-actions">
          <Link to="/sessions">
            <button className="primary">
              Manage Sessions
            </button>
          </Link>

          <Link to="/management">
            <button className="primary">
              Manage Students
            </button>
          </Link>

          <div style={{display: "flex", justifyContent: "right", alignItems: "center"}}>
            <button
              className="primary"
              
              onClick={refreshDashboard}
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      

      {/* SUMMARY */}
      <div className="summary-grid">
        <SummaryCard
          title="Total Students"
          value={students.length}
          hint="Managed in database"
        />

        <SummaryCard
          title="Present Today"
          value={presentToday}
          hint={`Date: ${today}`}
        />

        <SummaryCard
          title="Total Attendance Records"
          value={attendance.length}
          hint="All-time"
        />
      </div>

      {/* ATTENDANCE TABLE */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Latest Attendance</h2>

            <p className="muted">
              Most recent check-ins from the recognition system.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="muted">
            Loading dashboard data...
          </p>
        ) : (
          <DataTable
            columns={[
              {
                key: "student",
                label: "Student",
              },
              {
                key: "date",
                label: "Date",
              },
              {
                key: "time",
                label: "Time",
              },
              {
                key: "status",
                label: "Status",
              },
            ]}
            rows={latestAttendance}
            emptyLabel="No attendance records yet."
          />
        )}
      </section>
    </section>
  );
}