import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import SessionsPage from "./pages/SessionsPage";
import AttendanceLogs from "./pages/AttendanceLogs";
import Management from "./pages/Management";
import DeviceLogs from "./pages/DeviceLogs";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<AttendanceLogs />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="management" element={<Management />} />
          <Route path="device-logs" element={<DeviceLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
