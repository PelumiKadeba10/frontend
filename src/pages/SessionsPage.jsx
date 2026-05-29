import { useMemo } from "react";

import CreateSessionModal from "../components/CreateSessionModal";
import { endpoints } from "../api/client";
import { useApiData } from "../hooks/useApiData";

export default function SessionsPage() {
  // ALL SESSIONS
  const {
    data: sessionsData,
    loading,
    error,
    refetch,
  } = useApiData(endpoints.sessions);

  // FORMAT SESSIONS
  const sessions = useMemo(() => {
    return (sessionsData || []).map((s) => ({
      id: s.id,
      course_code: s.course_code,
      title: s.title,
      lecturer: s.lecturer,
      date: s.session_date,
      start_time: s.start_time,
      end_time: s.end_time,
      status: s.status,
    }));
  }, [sessionsData]);

  return (
    <section className="page">
      {/* HEADER */}
      <header className="page-header">
        <div>
          <p className="eyebrow">Attendance Management</p>
          <h1>Sessions</h1>
          <p className="muted">
            Create, monitor, and manage attendance sessions.
          </p>
        </div>
      </header>

      <div>
        {/* ACTIONS */}
        <section
          className=""
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <CreateSessionModal onCreated={refetch} />
        </section>

        {/* SESSION HISTORY */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Session History</h2>
              <p className="muted">All created attendance sessions.</p>
            </div>

            <button className="primary" onClick={refetch}>
              Refresh
            </button>
          </div>

          {error && <div className="banner banner-error">{error}</div>}

          {loading ? (
            <p className="muted">Loading sessions...</p>
          ) : (
            <div className="table-wrapper sessions-table-wrapper">
              <table className="table sessions-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Lecturer</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.length === 0 ? (
                    <tr>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.course_code}</td>
                        <td>{s.lecturer || "-"}</td>
                        <td>{s.title || "-"}</td>
                        <td>{s.date}</td>
                        <td>{s.start_time || "-"}</td>
                        <td>{s.end_time || "-"}</td>
                        <td>
                          {s.status === "active" ? (
                            <span style={{ color: "green", fontWeight: "600" }}>
                              Active
                            </span>
                          ) : (
                            <span style={{ color: "gray" }}>Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
