import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SchedulerApp() {
  const [processes, setProcesses] = useState([]);
  const [pid, setPid] = useState("");
  const [arrival, setArrival] = useState("");
  const [burst, setBurst] = useState("");
  const [priority, setPriority] = useState("");
  const [result, setResult] = useState(null);

  const addProcess = () => {
    if (!pid || !arrival || !burst || !priority) return;

    setProcesses([
      ...processes,
      {
        pid: String(pid),   // ✅ FIXED
        arrival: parseInt(arrival),
        burst: parseInt(burst),
        remaining: parseInt(burst),
        priority: parseFloat(priority),
        waiting: 0,
        turnaround: 0
      }
    ]);

    setPid(""); 
    setArrival(""); 
    setBurst(""); 
    setPriority("");
  };

  const runScheduler = () => {
    let time = 0, completed = 0;
    let n = processes.length;
    let proc = processes.map(p => ({ ...p }));
    let gantt = [];

    while (completed < n) {
      let idx = -1;
      let highest = Infinity;

      for (let i = 0; i < n; i++) {
        if (proc[i].arrival <= time && proc[i].remaining > 0) {
          if (proc[i].priority < highest) {
            highest = proc[i].priority;
            idx = i;
          }
        }
      }

      // Aging
      proc.forEach(p => {
        if (p.arrival <= time && p.remaining > 0) {
          p.priority = Math.max(1, p.priority - 0.05);
        }
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

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Priority Scheduling with Aging</h2>

      {/* Input */}
      <div className="card p-3 shadow mb-4">
        <div className="row g-2">
          <div className="col">
            <input className="form-control" placeholder="PID" value={pid} onChange={e => setPid(e.target.value)} />
          </div>
          <div className="col">
            <input className="form-control" placeholder="Arrival" value={arrival} onChange={e => setArrival(e.target.value)} />
          </div>
          <div className="col">
            <input className="form-control" placeholder="Burst" value={burst} onChange={e => setBurst(e.target.value)} />
          </div>
          <div className="col">
            <input className="form-control" placeholder="Priority" value={priority} onChange={e => setPriority(e.target.value)} />
          </div>
          <div className="col">
            <button className="btn btn-primary w-100" onClick={addProcess}>Add</button>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <button className="btn btn-success" onClick={runScheduler}>Run</button>
      </div>

      {/* Process Table */}
      {processes.length > 0 && (
        <div className="card p-3 shadow mb-4">
          <h5>Processes</h5>
          <table className="table table-bordered">
            <thead>
              <tr><th>PID</th><th>Arrival</th><th>Burst</th><th>Priority</th></tr>
            </thead>
            <tbody>
              {processes.map((p, i) => (
                <tr key={i}>
                  <td>{p.pid}</td>
                  <td>{p.arrival}</td>
                  <td>{p.burst}</td>
                  <td>{p.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Results Table */}
          <div className="card p-3 shadow mb-4">
            <h5>Results Table</h5>
            <table className="table table-striped">
              <thead>
                <tr><th>PID</th><th>Waiting Time</th><th>Turnaround Time</th></tr>
              </thead>
              <tbody>
                {result?.proc?.map((p, i) => (
                  <tr key={i}>
                    <td>{p.pid}</td>
                    <td>{p.waiting}</td>
                    <td>{p.turnaround}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gantt Chart */}
          <div className="card p-3 shadow mb-4 d-flex flex-column align-items-center">
            <h5>Gantt Chart</h5>
            <div className="d-flex flex-wrap text-center">
              {result.gantt.map((g, i) => (
                <div key={i} className="border p-2 text-center" style={{ minWidth: '60px' }}>
                  <div>{g.pid === "Idle" ? "Idle" : `P${g.pid}`}</div>
                  <small>{g.time}</small>
                </div>
              ))}
            </div>
          </div>

         
        </>
      )}
    </div>
  );
}