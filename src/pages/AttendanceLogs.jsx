import { useEffect, useMemo, useRef, useState } from "react";
import { endpoints } from "../api/client";
import { DataTable } from "../components/DataTable";
import { useApiData } from "../hooks/useApiData";

export default function AttendanceLogs() {
  const [selectedDate, setSelectedDate] = useState("");

  // BUILD API PATH
  const path = selectedDate
    ? `${endpoints.attendance}?date=${selectedDate}`
    : endpoints.attendance;

  // API DATA
  const {
    data,
    loading,
    error,
    refetch,
  } = useApiData(path);

  // LOCAL TABLE STATE
  // prevents entire table flashing/reloading
  const [tableRows, setTableRows] = useState([]);

  // INITIAL LOAD TRACKER
  const firstLoad = useRef(true);

  // UPDATE ONLY ROWS
  useEffect(() => {
    const formatted = data.map((entry) => ({
      id: entry.id,
      student: entry.student_name,
      matric_no: entry.matric_no,
      date: entry.date,
      time: entry.time,
      confidence: entry.confidence,
      status: entry.status,
    }));
    setTableRows(formatted);

    firstLoad.current = false;
  }, [data]);

  // AUTO REFRESH
  // pulls latest attendance from Raspberry Pi
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refetch();
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [refetch]);

  // TOTAL PRESENT TODAY
  const totalToday = useMemo(() => {
    const today = new Date()
      .toISOString()
      .slice(0, 10);

    return tableRows.filter(
      (row) => row.date === today
    ).length;
  }, [tableRows]);

  return (
    <section className="page">
      {/* HEADER */}
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Logs
          </p>

          <h1>Attendance</h1>

          <p className="muted">
            Live attendance stream from the
            recognition pipeline.
          </p>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="banner banner-error">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div
        className="summary-grid"
        style={{ marginBottom: "1rem" }}
      >
        <div className="summary-card">
          <p>Total Records</p>
          <h2>{tableRows.length}</h2>
        </div>

        <div className="summary-card">
          <p>Present Today</p>
          <h2>{totalToday}</h2>
        </div>
      </div>

      {/* TABLE */}
      <section className="panel">
        {/* FILTER BAR */}
        <div className="panel-header filter-bar">
          <label>
            Filter by Date

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
            />
          </label>

          <div className="filter-actions">
            <button
              type="button"
              className="secondary"
              onClick={() =>
                setSelectedDate("")
              }
            >
              Clear Date Filter
            </button>

            <button
              type="button"
              className="primary"
              onClick={refetch}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ONLY SHOW LOADER ON FIRST LOAD */}
        {loading && firstLoad.current ? (
          <p className="muted">
            Loading attendance...
          </p>
        ) : (
          <DataTable
            columns={[
              { key: "student", label: "Student" },
              { key: "matric_no", label: "Matric No" },
              { key: "date", label: "Date" },
              { key: "time", label: "Time" },
              { key: "confidence", label: "Confidence" },
              { key: "status", label: "Status" },
            ]}
            rows={tableRows}
            emptyLabel="No attendance entries yet."
          />
        )}
      </section>
    </section>
  );
}