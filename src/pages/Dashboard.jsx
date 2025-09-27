import React, { useState } from "react";
import "./Dashboard.css";
import NodeSidebar from "../components/NodeSidebar";
import FlowEditor from "../components/FlowEditor";

export default function Dashboard() {
  const [flowAction, setFlowAction] = useState(null);

  const handleAddNode = (type) => {
    setFlowAction({ type, action: "add" });
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Cards Section */}
      <div className="dashboard-cards">
        <div className="card">
          <h2>Total Flows</h2>
          <p>12</p>
        </div>

        <div className="card">
          <h2>Active Users</h2>
          <p>58</p>
        </div>

        <div className="card">
          <h2>Executions</h2>
          <p>245</p>
        </div>
      </div>

      {/* Recent Flows Section */}
      <div className="dashboard-section">
        <h2>Recent Flows</h2>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Last Run</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Medical Billing IVR</td>
              <td>✅ Active</td>
              <td>Today</td>
            </tr>
            <tr>
              <td>Appointment Reminder</td>
              <td>🛑 Stopped</td>
              <td>Yesterday</td>
            </tr>
            <tr>
              <td>Customer Survey</td>
              <td>✅ Active</td>
              <td>2 days ago</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Flows Interface inside Dashboard */}
      <div className="dashboard-section">
        <h2>Flow Builder (Preview)</h2>
        <div className="flow-page">
          <NodeSidebar onAddNode={handleAddNode} />
          <FlowEditor flowAction={flowAction} setFlowAction={setFlowAction} />
        </div>
      </div>
    </div>
  );
}