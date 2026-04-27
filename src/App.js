import React, { useState, useEffect } from "react";
import './App.css';

export default function SchedulerApp() {
  const [dark, setDark] = useState(true);
  const [processes, setProcesses] = useState([]);
  const [pid, setPid] = useState("");
  const [arrival, setArrival] = useState("");
  const [burst, setBurst] = useState("");
  const [priority, setPriority] = useState("");
  const [result, setResult] = useState(null);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = dark ? "dark" : "light";
  }, [dark]);

  /* ── Add Process ── */
  const addProcess = () => {
    if (!pid || !arrival || !burst || !priority) return;
    setProcesses([
      ...processes,
      {
        pid: String(pid),
        arrival: parseInt(arrival),
        burst: parseInt(burst),
        remaining: parseInt(burst),
        priority: parseFloat(priority),
        waiting: 0,
        turnaround: 0,
      },
    ]);
    setPid(""); setArrival(""); setBurst(""); setPriority("");
  };

  /* ── Run Scheduler (Priority + Aging) ── */
  const runScheduler = () => {
    let time = 0, completed = 0;
    const n = processes.length;
    const proc = processes.map(p => ({ ...p }));
    const gantt = [];

    while (completed < n) {
      let idx = -1, highest = Infinity;
      for (let i = 0; i < n; i++) {
        if (proc[i].arrival <= time && proc[i].remaining > 0) {
          if (proc[i].priority < highest) { highest = proc[i].priority; idx = i; }
        }
      }
      // Aging
      proc.forEach(p => {
        if (p.arrival <= time && p.remaining > 0)
          p.priority = Math.max(1, p.priority - 0.05);
      });

      if (idx !== -1) {
        proc[idx].remaining--;
        gantt.push({ time, pid: proc[idx].pid });
        if (proc[idx].remaining === 0) {
          completed++;
          proc[idx].turnaround = time + 1 - proc[idx].arrival;
          proc[idx].waiting = proc[idx].turnaround - proc[idx].burst;
        }
      } else {
        gantt.push({ time, pid: "Idle" });
      }
      time++;
    }
    setResult({ proc, gantt });
  };

  /* ── Averages ── */
  const avgWT = result ? (result.proc.reduce((s, p) => s + p.waiting, 0) / result.proc.length).toFixed(2) : null;
  const avgTAT = result ? (result.proc.reduce((s, p) => s + p.turnaround, 0) / result.proc.length).toFixed(2) : null;

  return (
    <>
      {/* Theme Toggle */}
      <button className="theme-toggle" onClick={() => setDark(!dark)} id="theme-toggle-btn">
        <span className="icon">{dark ? "☀️" : "🌙"}</span>
        {dark ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="scheduler-app">
        <h1 className="app-heading">
          Priority Scheduling <span>with Aging</span>
        </h1>

        {/* ── Input Card ── */}
        <div className="theme-card">
          <h5>➕ Add Process</h5>
          <div className="row g-2">
            {[
              { label: "PID", val: pid, set: setPid },
              { label: "Arrival", val: arrival, set: setArrival },
              { label: "Burst", val: burst, set: setBurst },
              { label: "Priority", val: priority, set: setPriority },
            ].map(({ label, val, set }) => (
              <div className="col" key={label}>
                <input
                  id={`input-${label.toLowerCase()}`}
                  className="form-control theme-input"
                  placeholder={label}
                  value={val}
                  onChange={e => set(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addProcess()}
                />
              </div>
            ))}
            <div className="col-auto">
              <button id="add-btn" className="btn btn-add w-100 h-100" onClick={addProcess}>Add</button>
            </div>
          </div>
        </div>

        {/* ── Run Button ── */}
        <div className="text-center mb-4">
          <button id="run-btn" className="btn btn-run" onClick={runScheduler} disabled={processes.length === 0}>
            ▶ Run Scheduler
          </button>
        </div>

        {/* ── Process Table ── */}
        {processes.length > 0 && (
          <div className="theme-card">
            <h5>📋 Process Queue</h5>
            <table className="theme-table">
              <thead>
                <tr><th>PID</th><th>Arrival</th><th>Burst</th><th>Priority</th></tr>
              </thead>
              <tbody>
                {processes.map((p, i) => (
                  <tr key={i}>
                    <td><strong>{p.pid}</strong></td>
                    <td>{p.arrival}</td>
                    <td>{p.burst}</td>
                    <td>{p.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <>
            {/* Results Table + Averages */}
            <div className="theme-card">
              <h5>📊 Scheduling Results</h5>
              <table className="theme-table">
                <thead>
                  <tr><th>PID</th><th>Waiting Time</th><th>Turnaround Time</th></tr>
                </thead>
                <tbody>
                  {result.proc.map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.pid}</strong></td>
                      <td>{p.waiting}</td>
                      <td>{p.turnaround}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Average Cards */}
              <div className="avg-cards">
                <div className="avg-card wt">
                  <div className="label">Avg Waiting Time</div>
                  <div className="value">{avgWT}</div>
                  <div className="unit">time units</div>
                </div>
                <div className="avg-card tat">
                  <div className="label">Avg Turnaround Time</div>
                  <div className="value">{avgTAT}</div>
                  <div className="unit">time units</div>
                </div>
              </div>
            </div>

            {/* Gantt Chart */}
            <div className="theme-card">
              <h5>⏱ Gantt Chart</h5>
              <div className="gantt-wrap">
                {result.gantt.map((g, i) => (
                  <div key={i} className={`gantt-cell ${g.pid === "Idle" ? "idle" : ""}`}>
                    {g.pid === "Idle" ? "Idle" : `P${g.pid}`}
                    <small>{g.time}</small>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}