import { useState } from "react";

export default function CreateSessionModal({ onCreated }) {
  const [courseCode, setCourseCode] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const createSession = async () => {
    if (!courseCode || !date) {
      setMessage({
        type: "error",
        text: "Please fill all fields.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_code: courseCode,
          date,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Session created successfully.",
        });

        setCourseCode("");
        setDate("");

        if (onCreated) {
          onCreated();
        }
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to create session.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Error creating session.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      {/* <header className="page-header">
        <div>
          <p className="muted">
            Create a new attendance session for a course.
          </p>
        </div>
      </header> */}

      {message ? (
        <div
          className={`banner ${
            message.type === "error"
              ? "banner-error"
              : "banner-success"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Session Details</h2>
            <p className="muted">
              Fill in the course code and session date to create a new attendance session.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            maxWidth: "500px",
          }}
        >
          <div>
            <label className="muted">Course Code</label>

            <input
              type="text"
              placeholder="e.g. CSC 501"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="muted">Session Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <button
              onClick={createSession}
              disabled={loading}
              className="button button-primary"
            >
              {loading ? "Creating..." : "Create Session"}
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}