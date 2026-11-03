
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import NavBar from "./Components/NavBar/NavBar";
import SlideBar from "./Components/SlideBar/SlideBar";
import Dashboard from "./Components/Dashboard/Dashboard";
import FrontOffice from "./Components/FrontOffice/FrontOffice";
import Admin from "./Components/Admin/Admin";
import SupportIssues from "./Components/Admin/SupportIssues";
import NewSupportIssue from "./Components/Admin/NewSupportIssue";
import CourseDetails from "./Components/Training/CourseDetails";
import Login from "./Components/Login/Login";

import "./App.css";

const LOGIN_STORAGE_KEY = "sarvanam_logged_in_user";

// Logout button
function LogoutBar({ username, onLogout }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "15px",
        padding: "8px 20px",
        background: "#ffffff",
        borderBottom: "1px solid #eee",
      }}
    >
      <span>Welcome, {username}</span>

      <button
        onClick={onLogout}
        style={{
          padding: "8px 16px",
          background: "#dc2626",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

// Main Dashboard Layout
function MainLayout({ username, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;

      case "Front Office":
        return <FrontOffice />;

      default:
        return (
          <main className="coming-soon-page">
            <h1>{activePage}</h1>
            <p>Training content for this module is coming soon.</p>
            <span>Coming Soon</span>
          </main>
        );
    }
  };

  return (
    <div className="app">
      <NavBar username={username} onLogout={onLogout} />

      <div className="app-layout">
        <SlideBar
          activePage={activePage}
          onPageChange={setActivePage}
        />

        {renderPage()}
      </div>
    </div>
  );
}

// Course Details Layout
function CourseLayout({ username, onLogout }) {
  return (
    <div className="app">
      <NavBar username={username} onLogout={onLogout} />
      <CourseDetails />
    </div>
  );
}

// Admin Dashboard
function AdminLayout({ username, onLogout }) {
  return (
    <div className="app">
      <NavBar username={username} onLogout={onLogout} />
      <Admin />
    </div>
  );
}

// Support Issues List
function SupportIssuesLayout({ username, onLogout }) {
  return (
    <div className="app">
      <NavBar username={username} onLogout={onLogout} />
      <SupportIssues />
    </div>
  );
}

// Create New Support Issue
function NewIssueLayout({ username, onLogout }) {
  return (
    <div className="app">
      <NavBar username={username} onLogout={onLogout} />
      <NewSupportIssue />
    </div>
  );
}

// Main App
function App() {
  const [loggedInUser, setLoggedInUser] = useState(
    () => localStorage.getItem(LOGIN_STORAGE_KEY)
  );

  const handleLogin = (username) => {
    localStorage.setItem(LOGIN_STORAGE_KEY, username);
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem(LOGIN_STORAGE_KEY);
    setLoggedInUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            loggedInUser ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/"
          element={
            loggedInUser ? (
              <MainLayout
                username={loggedInUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected Course Details */}
        <Route
          path="/courses/:courseName"
          element={
            loggedInUser ? (
              <CourseLayout
                username={loggedInUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected Admin */}
        <Route
          path="/admin"
          element={
            loggedInUser ? (
              <AdminLayout
                username={loggedInUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected Support Issues */}
        <Route
          path="/admin/issues"
          element={
            loggedInUser ? (
              <SupportIssuesLayout
                username={loggedInUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected New Support Issue */}
        <Route
          path="/admin/new-issue"
          element={
            loggedInUser ? (
              <NewIssueLayout
                username={loggedInUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate to={loggedInUser ? "/" : "/login"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
