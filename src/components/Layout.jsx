
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/students", label: "Student Enrollment" },
  { to: "/management", label: "Student Management" },
  { to: "/attendance", label: "Attendance Logs" },
  { to: "/sessions", label: "Class Sessions" },
  { to: "/device-logs", label: "Device Logs" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Mobile Sidebar Overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar (mobile: overlay, desktop: island) */}
      <aside className={`sidebar glassy${sidebarOpen ? " open" : ""}`}>
        <div className="brand">AI Attendance System</div>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Hamburger for mobile */}
      <button
        className="sidebar-toggle"
        aria-label="Open navigation menu"
        onClick={() => setSidebarOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
