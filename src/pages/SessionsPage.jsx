import { useMemo, useState } from "react";

import CreateSessionModal from "../components/CreateSessionModal";
import { api, endpoints } from "../api/client";
import { useApiData } from "../hooks/useApiData";

export default function SessionsPage() {
  const [updatingSessionId, setUpdatingSessionId] = useState(null);

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

  const toggleSessionStatus = async (session) => {
    const nextStatus = session.status === "active" ? "inactive" : "active";
    const confirmed = window.confirm(
      `Switch session "${session.title || session.course_code}" to ${nextStatus}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingSessionId(session.id);
      await api.patch(`${endpoints.sessions}/${session.id}/status`, {
        status: nextStatus,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to update session status", err);
      alert("Failed to update session status.");
    } finally {
      setUpdatingSessionId(null);
    }
  };

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
                    {/* <th>Status</th> */}
                    <th style={{ textAlign: "center" }}>Action</th>
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
                      {/* <td>-</td> */}
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
                        {/* <td>
                          {s.status === "active" ? (
                            <span style={{ color: "green", fontWeight: "600" }}>
                              Active
                            </span>
                          ) : (
                            <span style={{ color: "gray" }}>Inactive</span>
                          )}
                        </td> */}
                        <td>
                          <button
                            type="button"
                            className={`status-toggle ${
                              s.status === "active"
                                ? "status-toggle-active"
                                : "status-toggle-inactive"
                            }`}
                            onClick={() => toggleSessionStatus(s)}
                            disabled={updatingSessionId === s.id}
                            aria-pressed={s.status === "active"}
                            aria-label={`Switch session ${s.course_code} to ${
                              s.status === "active" ? "inactive" : "active"
                            }`}
                          >
                            <span className="status-toggle-option status-toggle-option-active">
                              Active
                            </span>
                            <span className="status-toggle-option status-toggle-option-inactive">
                              Inactive
                            </span>
                            <span className="status-toggle-knob" aria-hidden="true" />
                          </button>
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
