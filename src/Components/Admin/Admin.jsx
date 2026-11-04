
import React, { useState } from "react";

import SupportIssues from "./SupportIssues";
import TrainingVideos from "./TrainingVideos";
import UserManagement from "./UserManagement";

import "./Admin.css";

function Admin({ role = "Learner", username = "admin" }) {
  const [activeSection, setActiveSection] = useState("");

  const isAdmin = role === "Admin";
  const canManageTraining = isAdmin || role === "Trainer";

  if (activeSection === "support-issues" && isAdmin) {
    return <SupportIssues onBack={() => setActiveSection("")} />;
  }

  if (activeSection === "training-videos" && canManageTraining) {
    return (
      <TrainingVideos onBack={() => setActiveSection("")} />
    );
  }

  if (activeSection === "user-management" && isAdmin) {
    return (
      <UserManagement
        onBack={() => setActiveSection("")}
        currentUsername={username}
      />
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-breadcrumb">Administration</span>
          <h1>Admin Panel</h1>
          <p>Manage your learning platform and support activities.</p>
        </div>

        <div className="admin-icon">⚙️</div>
      </div>

      <h2>Sections</h2>

      <p className="admin-section-description">
        Select a section to manage its information.
      </p>

      <div className="admin-grid">
        {isAdmin && (
          <button
            type="button"
            className="admin-section-card"
            onClick={() => setActiveSection("support-issues")}
          >
            <div className="admin-card-icon">📋</div>
            <h3>Support Issue Management</h3>
            <p>
              Upload pending and resolved issues from the support team using Excel.
            </p>
            <span className="admin-card-link">Manage Issues →</span>
          </button>
        )}

        {canManageTraining && (
          <button
            type="button"
            className="admin-section-card"
            onClick={() => setActiveSection("training-videos")}
          >
            <div className="admin-card-icon">🎬</div>
            <h3>Training Video Management</h3>
            <p>
              Upload, organize, edit and publish training videos under courses and lessons.
            </p>
            <span className="admin-card-link">Manage Videos →</span>
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            className="admin-section-card"
            onClick={() => setActiveSection("user-management")}
          >
            <div className="admin-card-icon">👥</div>
            <h3>User Management</h3>
            <p>
              Create accounts, assign roles, update users and manage access status.
            </p>
            <span className="admin-card-link">Manage Users →</span>
          </button>
        )}

        {isAdmin && (
          <div className="admin-section-card admin-disabled">
            <div className="admin-card-icon">📊</div>
            <h3>Reports & Analytics</h3>
            <p>View platform activities and reports.</p>
            <span className="admin-coming">Coming Soon</span>
          </div>
        )}
      </div>
    </main>
  );
}

export default Admin;
