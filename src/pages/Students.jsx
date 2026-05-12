import { useState } from "react";
import { api, endpoints } from "../api/client";
import { DataTable } from "../components/DataTable";
import { useApiData } from "../hooks/useApiData";

export default function Students() {
  const { data: students, loading, error, refetch } = useApiData(endpoints.students);
  const [form, setForm] = useState({ name: "", matricNo: "", department: "" });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.post(endpoints.students, {
        name: form.name,
        matric_no: form.matricNo,
        department: form.department,
      });
      setForm({ name: "", matricNo: "", department: "" });
      setFeedback({ type: "success", message: "Student added." });
      refetch();
    } catch (err) {
      setFeedback({ type: "error", message: err.response?.data?.error ?? "Failed to add student." });
    } finally {
      setSubmitting(false);
    }
  };

  const rows = students.map((student) => ({
    id: student.id,
    name: student.name,
    matric_no: student.matric_no,
    department: student.department,
    created_at: student.created_at ? new Date(student.created_at).toLocaleString() : "—",
  }));

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Enrollment</p>
          <h1>Students</h1>
          <p className="muted">Manage students synced with Supabase.</p>
        </div>
      </header>

      {feedback ? <div className={`banner banner-${feedback.type}`}>{feedback.message}</div> : null}
      {error ? <div className="banner banner-error">{error}</div> : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Register New Student</h2>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
          </label>
          <label>
            Matric Number
            <input
              name="matricNo"
              value={form.matricNo}
              onChange={handleChange}
              required
              placeholder="ENG/1234"
            />
          </label>
          <label>
            Department
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              placeholder="Computer Engineering"
            />
          </label>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save Student"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>All Students</h2>
        </div>
        {loading ? (
          <p className="muted">Loading students...</p>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "matric_no", label: "Matric No" },
              { key: "department", label: "Department" },
              { key: "created_at", label: "Created" },
            ]}
            rows={rows}
            emptyLabel="No students found."
          />
        )}
      </section>
    </section>
  );
}
