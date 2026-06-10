import { Link } from "react-router-dom";

const highlights = [
  "Face recognition attendance capture",
  "Student enrollment and management",
  "Session tracking, reports, and device logs",
];

export default function WelcomePage() {
  return (
    <section className="welcome-page">
      <div className="welcome-card panel">
        <p className="eyebrow">AI Attendance Monitoring System Dashboard</p>
        <p className="name">Kadeba Oluwapelumi Ayobami | 21CJ029219 | Computer Engineering | Covenant University </p>
        <h1 className="welcome-title">Welcome</h1>
        <p className="welcome-copy">
          Monitor students, manage sessions, and review attendance activity from one place. 
          This platform combines embedded hardware, computer vision-based facial recognition, 
          and administrative tools to automate attendance recording, ensuring records remain accurate, organized, and easy to audit.
        </p>

        <div className="welcome-features">
          {highlights.map((item) => (
            <div key={item} className="welcome-feature">
              {item}
            </div>
          ))}
        </div>

        <div className="welcome-actions">
          <Link to="/dashboard" className="primary welcome-button welcome-button-link">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
