import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateSessionModal from "../components/CreateSessionModal";

export default function SessionsPage() {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchActiveSession = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/sessions/active");
      const data = await res.json();

      if (data.success) {
        setActiveSession(data.session);
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.log(err);
      setActiveSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Attendance Management</p>
          <h1>Sessions</h1>
          <p className="muted">
            Create and manage attendance sessions for courses.
          </p>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gap: "1.5rem",
        }}
      >
        <CreateSessionModal onCreated={fetchActiveSession} />

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Active Session</h2>
              <p className="muted">
                Current attendance session available for monitoring.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="muted">Loading active session...</p>
          ) : activeSession ? (
            <div
              style={{
                border: "1px solid var(--border-color, #2e7d32)",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div>
                <h3 style={{ marginBottom: "0.25rem" }}>
                  {activeSession.course_code}
                </h3>

                <p className="muted">
                  Date: {activeSession.session_date}
                </p>
              </div>

              <div>
                <button
                  className="button button-primary"
                  onClick={() =>
                    navigate(`/sessions/${activeSession.id}`)
                  }
                >
                  View Attendance
                </button>
              </div>
            </div>
          ) : (
            <div className="banner">
              No active attendance session available.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}