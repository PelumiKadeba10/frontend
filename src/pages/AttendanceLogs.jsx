import { useCallback, useEffect, useMemo, useState } from "react";

import { api, endpoints } from "../api/client";
import { DataTable } from "../components/DataTable";

export default function AttendanceLogs() {
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(endpoints.attendance);
      const payload = res?.data;

      if (payload?.success === false) {
        throw new Error(payload.message || "Failed to load attendance");
      }

      setSession(payload?.session ?? null);

      const attendanceRows = Array.isArray(payload?.data) ? payload.data : [];
      setRows(
        attendanceRows.map((entry, index) => ({
          id: entry.id ?? `${entry.session_id ?? "row"}-${entry.matric_no ?? entry.student_id ?? index}`,
          student_name: entry.student_name ?? entry.student ?? "Unknown",
          matric_no: entry.matric_no ?? entry.student_id ?? "-",
          session_id: entry.session_id ?? payload?.session?.id ?? "-",
          date: entry.date ?? "-",
          time: entry.time ?? "-",
          confidence:
            typeof entry.confidence === "number"
              ? entry.confidence.toFixed(4)
              : entry.confidence ?? "-",
          status: entry.status ?? "present",
        }))
      );
    } catch (err) {
      setRows([]);
      setSession(null);
      setError(err?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const totalPresent = rows.length;

  const sessionInfo = useMemo(() => {
    if (!session) return null;

    return {
      courseCode: session.course_code ?? "-",
      title: session.title ?? "-",
      lecturer: session.lecturer ?? "-",
      date: session.session_date ?? "-",
      startTime: session.start_time ?? "-",
      endTime: session.end_time ?? "-",
      status: session.status ?? "-",
      id: session.id ?? "-",
    };
  }, [session]);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Logs</p>
          <h1>Attendance</h1>
          <p className="muted">
            Attendance records returned by the backend for the currently active session.
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
            {sessionInfo ? `${sessionInfo.date} ${sessionInfo.startTime} - ${sessionInfo.endTime}` : "No active session"}
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-title">Session Status</p>
          <p className="summary-value">{sessionInfo?.status ?? "Idle"}</p>
          <p className="summary-hint">{sessionInfo ? sessionInfo.title : "Waiting for a session to begin"}</p>
        </div>
      </div>

      {sessionInfo ? (
        <section className="panel" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <div>
              <h2>Current Session</h2>
              <p className="muted">Session details for the current attendance window.</p>
            </div>
            <button type="button" className="primary" onClick={fetchAttendance} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="form-grid">
            <label>
              <span>Session ID</span>
              <input value={sessionInfo.id} readOnly />
            </label>
            <label>
              <span>Course Code</span>
              <input value={sessionInfo.courseCode} readOnly />
            </label>
            <label>
              <span>Lecturer</span>
              <input value={sessionInfo.lecturer} readOnly />
            </label>
            <label>
              <span>Title</span>
              <input value={sessionInfo.title} readOnly />
            </label>
            <label>
              <span>Session Date</span>
              <input value={sessionInfo.date} readOnly />
            </label>
            <label>
              <span>Status</span>
              <input value={sessionInfo.status} readOnly />
            </label>
          </div>
        </section>
      ) : (
        <section className="panel" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <div>
              <h2>Current Session</h2>
              <p className="muted">No active session is currently available.</p>
            </div>
            <button type="button" className="primary" onClick={fetchAttendance} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>
      )}

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
