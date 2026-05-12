# Frontend (Vite + React)

Single-page dashboard for the AI Attendance project. It talks to the Flask API via `VITE_API_URL` and renders three key views: Dashboard, Students, and Attendance Logs.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Then open the Vite dev server shown in the terminal (default `http://localhost:5173`). Set the backend URL via `.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Features

- **Dashboard** - totals for students, today's presence count, and the latest attendance records.
- **Students** - registration form plus Supabase-backed roster table.
- **Attendance Logs** - filterable table with date picker for historical analysis.

The UI uses lightweight CSS (no Tailwind) and the shared `useApiData` hook for data fetching. Update `src/api/client.js` if you need custom headers or auth.
