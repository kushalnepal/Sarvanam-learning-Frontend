
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "./SupportIssues.css";

const HEADERS = [
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
  "Unassigned",
];

const STORAGE_KEY = "sarvanam_support_issues";

// Normalize status capitalization
function normalizeStatus(status) {
  const value = String(status ?? "").trim();

  if (!value) return "Unassigned";

  const matched = STATUS_OPTIONS.find(
    (item) => item.toLowerCase() === value.toLowerCase()
  );

  return matched || value;
}

// Group Solved, Closed and Resolved into Completed
function getStatusGroup(status) {
  const value = normalizeStatus(status).toLowerCase();

  if (["solved", "closed", "resolved"].includes(value)) {
    return "completed";
  }

  return value;
}

// Normalize Yes/No and Y/N values
function normalizeBug(value) {
  const bug = String(value ?? "").trim().toLowerCase();

  if (["y", "yes", "true", "1"].includes(bug)) return "Y";
  if (["n", "no", "false", "0"].includes(bug)) return "N";

  if (!bug) return "";

  return null;
}

// Normalize Excel column headers
function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/\u00A0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Safely load saved records
function loadSavedIssues() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.map((issue) => ({
      ...issue,
      id: issue.id || createId(),
      Status: normalizeStatus(issue.Status),
      "Is Bug": normalizeBug(issue["Is Bug"]) ?? "",
    }));
  } catch (error) {
    console.error("Unable to load saved issues:", error);
    return [];
  }
}

function SupportIssues({ onBack }) {
  const navigate = useNavigate();

  const [issues, setIssues] = useState(loadSavedIssues);
  const [activeStatus, setActiveStatus] = useState("All Issues");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Save changes whenever issues are updated
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  // Create status tabs without separate Solved/Closed/Resolved tabs
  const statusTabs = useMemo(() => {
    const standardTabs = [
      "All Issues",
      "Completed",
      "Pending",
      "Incomplete",
      "Support Request",
      "Feature Request",
      "Next Update",
      "Feedback",
      "Training Request",
      "Licence Request",
      "Yesterday Request",
      "Unassigned",
    ];

    const extraStatuses = [
      ...new Set(
        issues
          .map((issue) => normalizeStatus(issue.Status))
          .filter((status) => {
            const group = getStatusGroup(status);

            return !standardTabs.some(
              (tab) => tab.toLowerCase() === group
            );
          })
      ),
    ];

    return [...standardTabs, ...extraStatuses];
  }, [issues]);

  // Filter issues by selected status
  const filteredIssues = useMemo(() => {
    if (activeStatus === "All Issues") {
      return issues;
    }

    return issues.filter(
      (issue) =>
        getStatusGroup(issue.Status) === activeStatus.toLowerCase()
    );
  }, [issues, activeStatus]);

  // Count issues in each tab
  const getCount = (status) => {
    if (status === "All Issues") {
      return issues.length;
    }

    return issues.filter(
      (issue) =>
        getStatusGroup(issue.Status) === status.toLowerCase()
    ).length;
  };

  // Download Excel template
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      HEADERS,
      ["", "", "", "", "", "", "Pending", "N", "", "", ""],
    ]);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Support Issues"
    );

    XLSX.writeFile(
      workbook,
      "Sarvanam_Support_Issues_Template.xlsx"
    );
  };

  // Upload Excel file
  const handleUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, {
          type: "array",
          cellDates: true,
        });

        const worksheet =
          workbook.Sheets[workbook.SheetNames[0]];

        if (!worksheet) {
          throw new Error("No worksheet found in the Excel file.");
        }

        // Read Excel as rows
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        if (!rows.length) {
          throw new Error("The Excel file is empty.");
        }

        // Normalize uploaded headers
        const uploadedHeaders = rows[0].map(normalizeHeader);

        // Find required column positions
        const columnIndexes = HEADERS.map((header) =>
          uploadedHeaders.indexOf(normalizeHeader(header))
        );

        // Validate required headers
        const missingHeaders = HEADERS.filter(
          (_, index) => columnIndexes[index] === -1
        );

        if (missingHeaders.length > 0) {
          throw new Error(
            "Missing required columns:\n" +
              missingHeaders.join(", ")
          );
        }

        // Convert Excel rows into issue objects
        const importedIssues = [];

        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex];

          // Ignore completely empty rows
          const isEmpty = columnIndexes.every(
            (index) =>
              String(row[index] ?? "").trim() === ""
          );

          if (isEmpty) continue;

          const issue = {};

          HEADERS.forEach((header, index) => {
            issue[header] = row[columnIndexes[index]] ?? "";
          });

          // Normalize status
          issue.Status = normalizeStatus(issue.Status);

          // Validate Is Bug
          const bugValue = normalizeBug(issue["Is Bug"]);

          if (bugValue === null) {
            throw new Error(
              `Invalid Is Bug value at Excel row ${
                rowIndex + 1
              }. Use Yes, No, Y, N, True or False.`
            );
          }

          issue["Is Bug"] = bugValue;
          issue.id = createId();

          importedIssues.push(issue);
        }

        if (importedIssues.length === 0) {
          throw new Error("No issue records found in the Excel file.");
        }

        // Add uploaded issues to existing records
        setIssues((previous) => [
          ...previous,
          ...importedIssues,
        ]);

        alert(
          `${importedIssues.length} issues imported successfully!`
        );
      } catch (error) {
        console.error("Excel import error:", error);
        alert(error.message || "Unable to read this Excel file.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Start editing
  const startEditing = (issue) => {
    setEditingId(issue.id);
    setEditForm({ ...issue });
  };

  // Update edited values
  const handleEditChange = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Save edited issue
  const saveEdit = () => {
    if (
      !String(editForm["Client Name"] ?? "").trim() ||
      !String(editForm.Issue ?? "").trim()
    ) {
      alert("Client Name and Issue are required.");
      return;
    }

    const bugValue = normalizeBug(editForm["Is Bug"]);

    if (bugValue === null) {
      alert("Is Bug must be Yes, No, Y or N.");
      return;
    }

    setIssues((previous) =>
      previous.map((issue) =>
        issue.id === editingId
          ? {
              ...editForm,
              Status: normalizeStatus(editForm.Status),
              "Is Bug": bugValue,
            }
          : issue
      )
    );

    setEditingId(null);
    setEditForm({});
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Delete issue
  const deleteIssue = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this issue?"
      )
    ) {
      return;
    }

    setIssues((previous) =>
      previous.filter((issue) => issue.id !== id)
    );

    if (editingId === id) {
      cancelEdit();
    }
  };

  return (
    <div className="support-issues-page">

      {/* Header */}
      <div className="support-header">
        <div>
          <button
            className="back-button"
            onClick={() =>
              onBack ? onBack() : navigate("/admin")
            }
          >
            ← Back
          </button>

          <h1>Support Issue Management</h1>

          <p>
            Manage, categorize and update support issues.
          </p>
        </div>

        {/* Actions */}
        <div className="support-actions">

          <button
            className="template-button"
            onClick={downloadTemplate}
          >
            Download Excel Template
          </button>

          <button
            className="add-issue-button"
            onClick={() => navigate("/admin/new-issue")}
          >
            + Add New Issue
          </button>

          <label className="upload-button">
            Upload Excel

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              hidden
            />
          </label>

        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        {statusTabs.map((status) => (
          <button
            key={status}
            className={`status-tab ${
              activeStatus === status ? "active" : ""
            }`}
            onClick={() => {
              setActiveStatus(status);
              cancelEdit();
            }}
          >
            <span>{status}</span>

            <span className="tab-count">
              {getCount(status)}
            </span>
          </button>
        ))}
      </div>

      {/* Issues Table */}
      <div className="issues-table-wrapper">

        <div className="table-heading">
          <h2>{activeStatus}</h2>

          <span>
            {filteredIssues.length} issue(s)
          </span>
        </div>

        <div className="table-scroll">
          <table className="issues-table">

            <thead>
              <tr>
                {HEADERS.map((header) => (
                  <th key={header}>{header}</th>
                ))}

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredIssues.map((issue) => (
                <tr key={issue.id}>

                  {HEADERS.map((field) => (
                    <td key={field}>

                      {editingId === issue.id ? (

                        field === "Status" ? (

                          <select
                            value={
                              editForm.Status || "Unassigned"
                            }
                            onChange={(e) =>
                              handleEditChange(
                                field,
                                e.target.value
                              )
                            }
                          >
                            {!STATUS_OPTIONS.includes(
                              editForm.Status
                            ) && (
                              <option value={editForm.Status}>
                                {editForm.Status}
                              </option>
                            )}

                            {STATUS_OPTIONS.map((status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            ))}
                          </select>

                        ) : field === "Is Bug" ? (

                          <select
                            value={editForm[field] ?? ""}
                            onChange={(e) =>
                              handleEditChange(
                                field,
                                e.target.value
                              )
                            }
                          >
                            <option value="">Blank</option>
                            <option value="Y">Yes (Y)</option>
                            <option value="N">No (N)</option>
                          </select>

                        ) : (

                          <input
                            type="text"
                            value={editForm[field] ?? ""}
                            onChange={(e) =>
                              handleEditChange(
                                field,
                                e.target.value
                              )
                            }
                          />

                        )

                      ) : field === "Status" ? (

                        <span
                          className={`status-label status-${normalizeStatus(
                            issue.Status
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {normalizeStatus(issue.Status)}
                        </span>

                      ) : (

                        issue[field]

                      )}

                    </td>
                  ))}

                  {/* Actions */}
                  <td className="action-cell">

                    {editingId === issue.id ? (

                      <>
                        <button
                          className="save-button"
                          onClick={saveEdit}
                        >
                          Save
                        </button>

                        <button
                          className="cancel-button"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>

                    ) : (

                      <>
                        <button
                          className="edit-button"
                          onClick={() => startEditing(issue)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteIssue(issue.id)}
                        >
                          Delete
                        </button>
                      </>

                    )}

                  </td>

                </tr>
              ))}

              {/* Empty List */}
              {filteredIssues.length === 0 && (
                <tr>
                  <td
                    colSpan={HEADERS.length + 1}
                    className="empty-table"
                  >
                    No issues found in this category.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SupportIssues;
