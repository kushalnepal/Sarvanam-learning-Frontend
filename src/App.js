
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
import Admin from "./Components/Admin/Admin";
import SupportIssues from "./Components/Admin/SupportIssues";
import NewSupportIssue from "./Components/Admin/NewSupportIssue";
import CourseDetails from "./Components/Training/CourseDetails";
import Login from "./Components/Login/Login";

import "./App.css";

const LOGIN_STORAGE_KEY = "sarvanam_logged_in_user";
const ROLE_STORAGE_KEY = "sarvanam_logged_in_role";

// Main Dashboard Layout
function MainLayout({ username, role, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;

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
          role={role}
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

// Admin Layout
function AdminLayout({ username, role, onLogout }) {
  return (
    <div className="app">
      <NavBar username={username} onLogout={onLogout} />
      <Admin role={role} username={username} />
    </div>
  );
}

// Support Issues Layout
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

function App() {
  const [loggedInUser, setLoggedInUser] = useState(
    () => localStorage.getItem(LOGIN_STORAGE_KEY)
  );

  const [loggedInRole, setLoggedInRole] = useState(
    () => localStorage.getItem(ROLE_STORAGE_KEY) || "Learner"
  );

  // TODO: DATABASE INTEGRATION
  // Later, receive the authenticated user and role from the backend API.

  const handleLogin = (user) => {
    localStorage.setItem(LOGIN_STORAGE_KEY, user.username);
    localStorage.setItem(ROLE_STORAGE_KEY, user.role);

    setLoggedInUser(user.username);
    setLoggedInRole(user.role);
  };

  const handleLogout = () => {
    localStorage.removeItem(LOGIN_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);

    setLoggedInUser(null);
    setLoggedInRole(null);
  };

  const isAdmin = loggedInRole === "Admin";

  const canAccessTrainingManagement =
    isAdmin || loggedInRole === "Trainer";

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

        {/* Dashboard */}
        <Route
          path="/"
          element={
            loggedInUser ? (
              <MainLayout
                username={loggedInUser}
                role={loggedInRole}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Course Details */}
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

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            !loggedInUser ? (
              <Navigate to="/login" replace />
            ) : canAccessTrainingManagement ? (
              <AdminLayout
                username={loggedInUser}
                role={loggedInRole}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Support Issues */}
        <Route
          path="/admin/issues"
          element={
            !loggedInUser ? (
              <Navigate to="/login" replace />
            ) : isAdmin ? (
              <SupportIssuesLayout
                username={loggedInUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* New Support Issue */}
        <Route
          path="/admin/new-issue"
          element={
            !loggedInUser ? (
              <Navigate to="/login" replace />
            ) : isAdmin ? (
              <NewIssueLayout
                username={loggedInUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Unknown Routes */}
        <Route
          path="*"
          element={
            <Navigate
              to={loggedInUser ? "/" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
