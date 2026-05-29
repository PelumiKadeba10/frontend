import { useState } from "react";
import { api, endpoints } from "../api/client";

export default function CreateSessionModal({ onCreated }) {
  const [courseCode, setCourseCode] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const createSession = async () => {
    if (!courseCode || !date) {
      setMessage({
        type: "error",
        text: "Course code and date are required.",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await api.post(`${endpoints.sessions}`, {
        course_code: courseCode,
        date,
        start_time: startTime || null,
        end_time: endTime || null,
        title: title || null,
        lecturer: lecturer || null,
      });

      if (res.data.success) {
        setMessage({
          type: "success",
          text: "Session created successfully.",
        });

        setCourseCode("");
        setDate("");
        setStartTime("");
        setEndTime("");
        setTitle("");
        setLecturer("");
        onCreated?.();
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Failed to create session.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Server error while creating session.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-session-card panel">
      <div className="create-session-header">
        <p className="eyebrow">Attendance Management</p>
        <h3>Create Session</h3>
        <p className="muted">
          Start a new attendance session for a course.
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div
          className={`banner create-session-banner ${
            message.type === "error"
              ? "banner-error"
              : "banner-success"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* FORM */}
      <div className="create-session-grid">
        <label className="create-session-field create-session-span-2">
          <span className="create-session-label">
            Course Code <span className="create-session-required">*</span>
          </span>
          <input
            className="input"
            type="text"
            placeholder="CSC 501"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
        </label>

        <label className="create-session-field">
          <span className="create-session-label">
            Session Date <span className="create-session-required">*</span>
          </span>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="create-session-field">
          <span className="create-session-label">Start Time</span>
          <input
            className="input"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>

        <label className="create-session-field">
          <span className="create-session-label">End Time</span>
          <input
            className="input"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>

        <label className="create-session-field create-session-span-2">
          <span className="create-session-label">Title (optional)</span>
          <input
            className="input"
            type="text"
            placeholder="e.g. Midterm Attendance"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="create-session-field create-session-span-2">
          <span className="create-session-label">Lecturer (optional)</span>
          <input
            className="input"
            type="text"
            placeholder="Dr. John Doe"
            value={lecturer}
            onChange={(e) => setLecturer(e.target.value)}
          />
        </label>
        <button
          className="primary create-session-submit"
          type="button"
          onClick={createSession}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Session"}
        </button>
      </div>
    </div>
  );
}
