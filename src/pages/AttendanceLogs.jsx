import { useCallback, useEffect, useMemo, useState } from "react";
import { api, endpoints } from "../api/client"; 
import { DataTable } from "../components/DataTable";

export default function AttendanceLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Hit strictly the attendance endpoint (with trailing slash to avoid CORS redirects)
      const res = await api.get((endpoints.attendance || "/attendance") + "/");
      const payload = res?.data;

      // Adaptable parsing depending on if your Flask backend wraps it in a .data key or returns a raw array
      const rawRows = Array.isArray(payload) 
        ? payload 
        : Array.isArray(payload?.data) 
          ? payload.data 
          : [];

      setRows(
        rawRows.map((entry, index) => ({
          id: entry.id ?? `${entry.session_id ?? "row"}-${entry.matric_no ?? index}`,
          student_name: entry.student_name ?? entry.students?.name ?? "Unknown Student",
          matric_no: entry.matric_no ?? "-",
          session_id: entry.session_id ?? "-",
          date: entry.date ?? entry.session_date ?? "-",
          time: entry.time ?? entry.first_seen ?? "-",
          confidence:
            typeof entry.confidence === "number"
              ? entry.confidence.toFixed(4)
              : entry.confidence ?? "-",
          status: entry.status ?? "PRESENT",
          // Temporarily retain raw session metadata elements on the row object for useMemo below
          _raw_course: entry.course_code ?? entry.sessions?.course_code,
          _raw_title: entry.title ?? entry.sessions?.title,
          _raw_lecturer: entry.lecturer ?? entry.sessions?.lecturer,
          _raw_start: entry.start_time ?? entry.sessions?.start_time,
          _raw_end: entry.end_time ?? entry.sessions?.end_time,
          _raw_status: entry.session_status ?? entry.sessions?.status
        }))
      );
    } catch (err) {
      setRows([]);
      setError(err?.message || "Failed to load attendance logs from the edge infrastructure.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const totalPresent = rows.length;

  // 2. Extract session metadata context dynamically out of the active data rows
  const sessionInfo = useMemo(() => {
    if (rows.length === 0) return null;
    
    // Grab a reference sample from the first item in the collection
    const sample = rows[0];
    
    return {
      courseCode: sample._raw_course ?? "CEN511", // Your pilot course code fallback
      title: sample._raw_title ?? "Embedded and Control Systems Engineering Lab",
      lecturer: sample._raw_lecturer ?? "Dr. Aris",
      date: sample.date ?? "-",
      startTime: sample._raw_start ?? "14:00:00",
      endTime: sample._raw_end ?? "16:00:00",
      status: sample._raw_status ?? "ACTIVE",
    };
  }, [rows]);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Logs</p>
          <h1>Attendance</h1>
          <p className="muted">
            Real-time biometric attendance metrics queried directly from the edge processor log ledger.
          </p>
        </div>
      </header>

      {error ? <div className="banner banner-error">{error}</div> : null}

      <div className="summary-grid" style={{ marginBottom: "1rem" }}>
        <div className="summary-card">
          <p className="summary-title">Total Records</p>
          <p className="summary-value">{totalPresent}</p>
        </div>

        <div className="summary-card">
          <p className="summary-title">Active Session</p>
          <p className="summary-value">{sessionInfo ? sessionInfo.courseCode : "None"}</p>
          <p className="summary-hint">
            {sessionInfo ? `${sessionInfo.date} ${sessionInfo.startTime} - ${sessionInfo.endTime}` : "No records to display"}
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-title">Session Status</p>
          <p className="summary-value" style={{ textTransform: "uppercase" }}>{sessionInfo?.status ?? "IDLE"}</p>
          <p className="summary-hint">{sessionInfo ? sessionInfo.title : "Waiting for edge client updates"}</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Attendance Rows</h2>
            <p className="muted">Recent attendance records for the active session.</p>
          </div>
          <button type="button" className="primary" onClick={fetchAttendance} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading attendance...</p>
        ) : (
          <DataTable
            columns={[
              { key: "student_name", label: "Student" },
              { key: "matric_no", label: "Matric No" },
              { key: "session_id", label: "Session ID" },
              { key: "date", label: "Date" },
              { key: "time", label: "Time" },
              { key: "confidence", label: "Confidence" },
              { key: "status", label: "Status" },
            ]}
            rows={rows}
            emptyLabel="No attendance entries for the active session yet."
          />
        )}
      </section>
    </section>
  );
}