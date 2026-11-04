
import React, { useEffect, useState } from "react";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../../Utils/userStorage";

import "./UserManagement.css";

const emptyForm = {
  username: "",
  password: "",
  role: "Learner",
  status: "Active",
};

function UserManagement({ onBack, currentUsername = "admin" }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setForm({
      username: user.username,
      password: "",
      role: user.role,
      status: user.status,
    });

    setEditingId(user.id);
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const username = form.username.trim();

    if (!username) {
      setError("Username is required.");
      return;
    }

    if (!editingId && !form.password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      if (editingId) {
        const existingUser = users.find(
          (user) => user.id === editingId
        );

        updateUser({
          ...existingUser,
          username,
          password: form.password.trim()
            ? form.password
            : existingUser.password,
          role: form.role,
          status: form.status,
        });

        setMessage("User updated successfully.");
      } else {
        addUser({
          username,
          password: form.password,
          role: form.role,
          status: form.status,
        });

        setMessage("User created successfully.");
      }

      loadUsers();
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleDelete = (user) => {
    if (user.username === currentUsername) {
      setError("You cannot delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.username}?`
    );

    if (!confirmed) return;

    deleteUser(user.id);
    loadUsers();
    setMessage("User deleted successfully.");
    setError("");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <main className="user-management">
      <div className="um-header">
        <div>
          <button className="um-back" onClick={onBack}>
            ← Back to Admin
          </button>

          <h1>User Management</h1>
          <p>Manage users, account roles and access status.</p>
        </div>

        <button className="um-add-button" onClick={openAddForm}>
          + Add New User
        </button>
      </div>

      <div className="um-stats">
        <div className="um-stat-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>

        <div className="um-stat-card">
          <span>Active Users</span>
          <strong>{activeUsers}</strong>
        </div>

        <div className="um-stat-card">
          <span>Trainers</span>
          <strong>
            {users.filter((user) => user.role === "Trainer").length}
          </strong>
        </div>

        <div className="um-stat-card">
          <span>Learners</span>
          <strong>
            {users.filter((user) => user.role === "Learner").length}
          </strong>
        </div>
      </div>

      {message && <div className="um-success">{message}</div>}
      {error && <div className="um-error">{error}</div>}

      {showForm && (
        <form className="um-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit User" : "Create New User"}</h2>

          <div className="um-form-grid">
            <div className="um-field">
              <label>Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="um-field">
              <label>
                Password {editingId && "(Leave blank to keep current password)"}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={editingId ? "Optional new password" : "Enter password"}
                required={!editingId}
              />
            </div>

            <div className="um-field">
              <label>Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Admin">Admin</option>
                <option value="Trainer">Trainer</option>
                <option value="Learner">Learner</option>
              </select>
            </div>

            <div className="um-field">
              <label>Account Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="um-form-actions">
            <button type="submit" className="um-save-button">
              {editingId ? "Update User" : "Create User"}
            </button>

            <button
              type="button"
              className="um-cancel-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="um-table-section">
        <div className="um-table-header">
          <div>
            <h2>All Users</h2>
            <p>View and manage registered platform users.</p>
          </div>

          <div className="um-filters">
            <input
              type="search"
              placeholder="Search username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Trainer">Trainer</option>
              <option value="Learner">Learner</option>
            </select>
          </div>
        </div>

        <div className="um-table-wrapper">
          <table className="um-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="um-user-name">
                        <div className="um-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <strong>{user.username}</strong>
                        {user.username === currentUsername && (
                          <span className="um-you">You</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`um-role um-role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`um-status ${
                          user.status === "Active"
                            ? "um-active"
                            : "um-inactive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className="um-actions">
                        <button
                          className="um-edit"
                          onClick={() => openEditForm(user)}
                        >
                          Edit
                        </button>

                        <button
                          className="um-delete"
                          onClick={() => handleDelete(user)}
                          disabled={user.username === currentUsername}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="um-empty">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default UserManagement;
