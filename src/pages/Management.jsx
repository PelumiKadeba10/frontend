import { useApiData } from "../hooks/useApiData";
import { useState } from "react";
import { api } from "../api/client";

export default function StudentsPage() {
  const {
    data: students,
    loading,
    error,
    refetch,
  } = useApiData("/management/students/");

   // EDIT STATE
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    matric_no: "",
    department: "",
  });

  // PAGINATION STATE
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(students.length / pageSize);

  const paginatedStudents = students.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // OPEN EDIT MODAL
  const openEdit = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      matric_no: student.matric_no,
      department: student.department,
    });
  };

  // HANDLE UPDATE
  const handleUpdate = async () => {
    try {
      const res = await api.put(
        `/management/students/${editingStudent.id}`,
        form
      );

      if (res?.data?.success) {
        alert("Updating Student...");
        setEditingStudent(null);
        refetch();
        alert("Student updated successfully");
      } else {
        alert(res?.data?.message || "Update failed");
      }
    } catch (err) {
      alert("Error updating student");
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const res = await api.delete(`/management/students/${id}`);
      const data = res?.data;

      if (data.success) {
        refetch();
        alert("Student deleted successfully");
      } else {
        alert(data.message || "Failed to delete student");
      }
    } catch (err) {
      alert("Error deleting student");
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Student Management</p>
          <h1>Students</h1>
          <p className="muted">View, manage, and maintain enrolled students.</p>
        </div>
      </header>
      {error && <div className="banner banner-error">{error}</div>}

      <>
      {/* TABLE HEADER ACTIONS */}
      <div className="table-toolbar">
        <div>
          <h3>All Students</h3>
        </div>

        <button
          className="primary"
          onClick={refetch}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>S/N</th>
            <th>Name</th>
            <th>Matric No</th>
            <th>Department</th>
            <th>Image No</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedStudents.length > 0 ? (
            paginatedStudents.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.matric_no}</td>
                <td>{s.department}</td>
                <td>{s.image_count}</td>
                <td style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => openEdit(s)} disabled={loading}>
                    Edit
                  </button>

                  <button onClick={() => deleteStudent(s.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                {loading ? "Loading students..." : "No students found, check error code"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION CONTROLS */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span style={{ marginTop: "0.5rem" }}>
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </>

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Student</h2>

            <label>Name</label>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <label>Matric No</label>
            <input
              placeholder="Matric No"
              value={form.matric_no}
              onChange={(e) =>
                setForm({ ...form, matric_no: e.target.value })
              }
            />

            <label>Department</label>
            <input
              placeholder="Department"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
            />

            <div style={{ display: "flex", gap: 10,justifyContent: "center", marginTop: 20 }}>
              <button onClick={handleUpdate} className="primary">
                Save
              </button>
              <button onClick={() => setEditingStudent(null)} className="secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}