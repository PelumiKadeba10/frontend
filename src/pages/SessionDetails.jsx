import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SessionDetails() {
  const { id } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(
        `/api/sessions/${id}/attendance`
      );
      const data = await res.json();

      if (data.success) {
        setAttendance(data.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Session Attendance</h1>

      {loading ? (
        <p>Loading...</p>
      ) : attendance.length === 0 ? (
        <p>No attendance yet</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Name</th>
              <th>Matric No</th>
              <th>Confidence</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((item) => (
              <tr key={item.id}>
                <td>{item.students?.name}</td>
                <td>{item.students?.matric_no}</td>
                <td>{item.confidence}</td>
                <td>{item.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}