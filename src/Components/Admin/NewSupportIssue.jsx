
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewSupportIssue.css";

const STORAGE_KEY = "sarvanam_support_issues";

const FIELDS = [
  "Date",
  "Client Name",
  "Issue",
  "Handler",
  "Contact Person",
  "Contact Number",
  "Status",
  "Is Bug",
  "Forwarded to",
  "Remarks",
  "Extra",
];

const STATUS_OPTIONS = [
  "Solved",
  "Closed",
  "Pending",
  "Incomplete",
  "Resolved",
  "Support Request",
  "Feature Request",
  "Next Update",
  "Feedback",
  "Training Request",
  "Licence Request",
  "Yesterday Request",
];

function NewSupportIssue() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Date: "",
    "Client Name": "",
    Issue: "",
    Handler: "",
    "Contact Person": "",
    "Contact Number": "",
    Status: "Pending",
    "Is Bug": "N",
    "Forwarded to": "",
    Remarks: "",
    Extra: "",
  });

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!form["Client Name"].trim() || !form.Issue.trim()) {
      alert("Please enter Client Name and Issue.");
      return;
    }

    const existing = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const newIssue = {
      ...form,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...existing, newIssue])
    );

    alert("Issue saved successfully!");
    navigate("/admin/issues");
  };

  return (
    <div className="new-issue-page">
      <div className="new-issue-heading">
        <div>
          <button
            type="button"
            className="new-issue-back"
            onClick={() => navigate("/admin/issues")}
          >
            ← Back to Issues
          </button>

          <h1>Create New Support Issue</h1>
          <p>Enter the support issue details below.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="new-issue-grid">
          {FIELDS.map((field) => (
            <div className="new-issue-field" key={field}>
              <label>{field}</label>

              {field === "Status" ? (
                <select
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              ) : field === "Is Bug" ? (
                <select
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                >
                  <option value="N">N</option>
                  <option value="Y">Y</option>
                </select>
              ) : field === "Issue" || field === "Remarks" || field === "Extra" ? (
                <textarea
                  rows="3"
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              ) : (
                <input
                  type={field === "Date" ? "date" : "text"}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="new-issue-footer">
          <button
            type="button"
            className="new-issue-cancel"
            onClick={() => navigate("/admin/issues")}
          >
            Cancel
          </button>

          <button type="submit" className="new-issue-save">
            Save Issue
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewSupportIssue;
