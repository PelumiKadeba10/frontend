import { useEffect, useMemo, useState } from "react";

import { api, endpoints } from "../api/client";

const POLLING_INTERVAL_SECONDS = 10;
const DEFAULT_LIMIT = 200;

function formatTimestamp(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString();
}

function groupLogsByDevice(logs) {
  return logs.reduce((acc, log) => {
    const deviceId = log.device_id || "UNKNOWN";
    if (!acc[deviceId]) {
      acc[deviceId] = [];
    }
    acc[deviceId].push(log);
    return acc;
  }, {});
}

export default function DeviceLogs() {
  const [logs, setLogs] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("PI-001");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);

  const fetchLogs = async () => {
    setError(null);

    try {
      const response = await api.get(endpoints.deviceLogs, {
        params: { limit: DEFAULT_LIMIT },
      });

      const payload = response?.data;
      if (payload?.success === false) {
        throw new Error(payload.message || "Failed to load device logs");
      }

      const rows = Array.isArray(payload?.data) ? payload.data : [];
      setLogs(rows);

      if (rows.length > 0 && !selectedDevice) {
        setSelectedDevice(rows[0].device_id || "UNKNOWN");
      }

      setLastRefreshAt(new Date());
    } catch (err) {
      setError(err?.message || "Failed to load device logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const timer = setInterval(fetchLogs, POLLING_INTERVAL_SECONDS * 1000);
    return () => clearInterval(timer);
  }, []);

  const groupedLogs = useMemo(() => groupLogsByDevice(logs), [logs]);
  const deviceIds = useMemo(() => Object.keys(groupedLogs).sort(), [groupedLogs]);
  const activeLogs = groupedLogs[selectedDevice] || [];

  useEffect(() => {
    if (deviceIds.length > 0 && !groupedLogs[selectedDevice]) {
      setSelectedDevice(deviceIds[0]);
    }
  }, [deviceIds, groupedLogs, selectedDevice]);

  const latestTimestamp = activeLogs[0]?.timestamp || null;
  const latestTimestampMs = latestTimestamp ? new Date(latestTimestamp).getTime() : null;
  const isOnline =
    latestTimestampMs !== null &&
    !Number.isNaN(latestTimestampMs) &&
    Date.now() - latestTimestampMs <= POLLING_INTERVAL_SECONDS * 2000;

  const statusLabel = deviceIds.length === 0
    ? "No device online"
    : isOnline
      ? "Online"
      : "No device online";

  return (
    <section className="page device-logs-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Observability</p>
          <h1>Device Logs</h1>
          <p className="muted">
            Real-time device events from Raspberry Pi clients with offline detection.
          </p>
        </div>

        <div className={`device-status-pill ${isOnline ? "online" : "offline"}`}>
          {statusLabel}
        </div>
      </header>

      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-title">Selected Device</p>
          <p className="summary-value">{selectedDevice}</p>
          <p className="summary-hint">{deviceIds.length} device(s) in current feed</p>
        </div>

        <div className="summary-card">
          <p className="summary-title">Last Log</p>
          <p className="summary-value">{latestTimestamp ? formatTimestamp(latestTimestamp) : "-"}</p>
          <p className="summary-hint">
            Polling every {POLLING_INTERVAL_SECONDS} seconds
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-title">Feed Status</p>
          <p className="summary-value">{isOnline ? "Live" : "Offline"}</p>
          <p className="summary-hint">
            {lastRefreshAt ? `Refreshed at ${lastRefreshAt.toLocaleTimeString()}` : "Waiting for data"}
          </p>
        </div>
      </div>

      {error ? <div className="banner banner-error">{error}</div> : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Devices</h2>
            <p className="muted">Select a device to inspect its recent events.</p>
          </div>

          <button type="button" className="primary" onClick={fetchLogs} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="device-chip-row">
          {deviceIds.length === 0 ? (
            <p className="muted">No device logs available yet.</p>
          ) : (
            deviceIds.map((deviceId) => {
              const deviceLatest = groupedLogs[deviceId]?.[0]?.timestamp || null;
              const deviceLatestMs = deviceLatest ? new Date(deviceLatest).getTime() : null;
              const deviceOnline =
                deviceLatestMs !== null &&
                !Number.isNaN(deviceLatestMs) &&
                Date.now() - deviceLatestMs <= POLLING_INTERVAL_SECONDS * 2000;

              return (
                <button
                  key={deviceId}
                  type="button"
                  className={`device-chip ${selectedDevice === deviceId ? "active" : ""}`}
                  onClick={() => setSelectedDevice(deviceId)}
                >
                  <span>{deviceId}</span>
                  <small>{deviceOnline ? "ONLINE" : "OFFLINE"}</small>
                </button>
              );
            })
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>{selectedDevice} Events</h2>
            <p className="muted">
              {activeLogs.length} log entry(ies) in the current window.
            </p>
          </div>
          <div className={`device-status-pill ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "Live updates" : "Updates paused"}
          </div>
        </div>

        {loading && logs.length === 0 ? (
          <p className="muted">Loading device logs...</p>
        ) : activeLogs.length === 0 ? (
          <p className="muted">No logs for this device yet.</p>
        ) : (
          <div className="device-log-list">
            {activeLogs.map((entry) => (
              <article key={entry.id} className="device-log-item">
                <div className="device-log-head">
                  <div>
                    <p className="device-log-type">{entry.event_type}</p>
                    <p className="device-log-time">{formatTimestamp(entry.timestamp)}</p>
                  </div>
                  <span className="device-log-id">#{entry.id}</span>
                </div>

                <p className="device-log-message">{entry.message || "No message provided."}</p>

                {entry.metadata && Object.keys(entry.metadata).length > 0 ? (
                  <details className="device-log-metadata">
                    <summary>Metadata</summary>
                    <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
                  </details>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
