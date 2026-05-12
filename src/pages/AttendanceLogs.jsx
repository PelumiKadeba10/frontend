import { useMemo, useState } from "react";
import { endpoints } from "../api/client";
import { DataTable } from "../components/DataTable";
import { useApiData } from "../hooks/useApiData";

export default function AttendanceLogs() {
  const [selectedDate, setSelectedDate] = useState("");
  const path = selectedDate ? `${endpoints.attendance}?date=${selectedDate}` : endpoints.attendance;
  const { data, loading, error, refetch } = useApiData(path);

  const rows = useMemo(
    () =>
      data.map((entry) => ({
        id: entry.id,
        student: entry.student_name ?? entry.student_id,
        date: entry.date,
        time: entry.time,
        status: entry.status ?? "present",
      })),
    [data]
  );

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Logs</p>
          <h1>Attendance</h1>
          <p className="muted">Filter the consolidated attendance timeline.</p>
        </div>
      </header>

      {error ? <div className="banner banner-error">{error}</div> : null}

      <section className="panel">
        <div className="panel-header filter-bar">
          <label>
            Filter by Date
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </label>
          <div className="filter-actions">
            <button type="button" className="secondary" onClick={() => setSelectedDate("")}>
              Clear
            </button>
            <button type="button" className="primary" onClick={refetch}>
              Refresh
            </button>
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
            rows={rows}
            emptyLabel="No attendance entries yet."
          />
        )}
      </section>
    </section>
  );
}
