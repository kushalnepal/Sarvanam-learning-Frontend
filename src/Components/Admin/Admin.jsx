
import React, { useState } from "react";
import SupportIssues from "./SupportIssues";
import TrainingVideos from "./TrainingVideos";
import "./Admin.css";

function Admin() {
  const [activeSection, setActiveSection] = useState("");

  // Support Issue Management
  if (activeSection === "support-issues") {
    return (
      <SupportIssues
        onBack={() => setActiveSection("")}
      />
    );
  }

  // Training Video Management
  if (activeSection === "training-videos") {
    return (
      <div>
        <TrainingVideos />
      </div>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-breadcrumb">Administration</span>
          <h1>Admin Panel</h1>
          <p>
            Manage your learning platform and support activities.
          </p>
        </div>

        <div className="admin-icon">⚙️</div>
      </div>

      <h2>Sections</h2>

      <p className="admin-section-description">
        Select a section to manage its information.
      </p>

      <div className="admin-grid">

        {/* Support Issue Management */}
        <button
          type="button"
          className="admin-section-card"
          onClick={() => setActiveSection("support-issues")}
        >
          <div className="admin-card-icon">📋</div>

          <h3>Support Issue Management</h3>

          <p>
            Upload pending and resolved issues from the
            support team using Excel.
          </p>

          <span className="admin-card-link">
            Manage Issues →
          </span>
        </button>

        {/* Training Video Management */}
        <button
          type="button"
          className="admin-section-card"
          onClick={() => setActiveSection("training-videos")}
        >
          <div className="admin-card-icon">🎬</div>

          <h3>Training Video Management</h3>

          <p>
            Upload, organize, edit and publish training
            videos under courses and lessons.
          </p>

          <span className="admin-card-link">
            Manage Videos →
          </span>
        </button>

        {/* User Management */}
        <div className="admin-section-card admin-disabled">
          <div className="admin-card-icon">👥</div>

          <h3>User Management</h3>

          <p>
            Manage platform users and permissions.
          </p>

          <span className="admin-coming">
            Coming Soon
          </span>
        </div>

        {/* Reports & Analytics */}
        <div className="admin-section-card admin-disabled">
          <div className="admin-card-icon">📊</div>

          <h3>Reports & Analytics</h3>

          <p>
            View platform activities and reports.
          </p>

          <span className="admin-coming">
            Coming Soon
          </span>
        </div>

      </div>
    </main>
  );
}

export default Admin;
