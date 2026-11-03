
import { useEffect, useState } from "react";
import {
    getTrainingVideos,
    saveTrainingVideo,
    deleteTrainingVideo,
} from "../../Utils/trainingVideoStorage";
import "./TrainingVideos.css";

const COURSES = [
    "Front Office",
    "Point of Sale",
    "Inventory",
    "Finance",
    "General Setup",
];

const LESSONS = {
    "Front Office": [
        "Reservation",
        "Check-in",
        "Check-out",
        "Guest Management",
    ],
    "Point of Sale": [
        "Billing",
        "KOT",
        "Menu Management",
        "Sales",
    ],
    Inventory: [
        "Stock Management",
        "GRN",
        "Purchase",
        "Store Management",
    ],
    Finance: [
        "Vouchers",
        "Transactions",
        "Financial Reports",
        "Accounting",
    ],
    "General Setup": [
        "Rights and Permissions",
        "User Creation",
        "Outlet Configuration",
        "System Configuration",
    ],
};

function TrainingVideos({ onBack }) {
    const [videos, setVideos] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [course, setCourse] = useState("Front Office");
    const [lesson, setLesson] = useState("Reservation");
    const [file, setFile] = useState(null);
    const [isPublished, setIsPublished] = useState(true);

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const data = await getTrainingVideos();
            setVideos(data);
        } catch (error) {
            console.error("Error loading videos:", error);
            setMessage("Unable to load training videos.");
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCourse("Front Office");
        setLesson("Reservation");
        setFile(null);
        setIsPublished(true);
        setEditingId(null);

        const fileInput = document.getElementById("training-video-file");

        if (fileInput) {
            fileInput.value = "";
        }
    };

    const handleCourseChange = (value) => {
        setCourse(value);
        setLesson(LESSONS[value][0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        if (!title.trim()) {
            setMessage("Please enter a video title.");
            return;
        }

        if (!lesson.trim()) {
            setMessage("Please enter a lesson name.");
            return;
        }

        if (!editingId && !file) {
            setMessage("Please select a video file.");
            return;
        }

        if (file && !file.type.startsWith("video/")) {
            setMessage("Please select a valid video file.");
            return;
        }

        setLoading(true);

        try {
            const existingVideo = editingId
                ? videos.find((video) => video.id === editingId)
                : null;

            const videoData = {
                id: editingId || crypto.randomUUID(),
                title: title.trim(),
                description: description.trim(),
                course,
                lesson,
                file: file || existingVideo?.file,
                isPublished,
                createdAt: existingVideo?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await saveTrainingVideo(videoData);

            await loadVideos();

            setMessage(
                editingId
                    ? "Training video updated successfully!"
                    : "Training video uploaded successfully!"
            );

            resetForm();
        } catch (error) {
            console.error("Error saving video:", error);
            setMessage(
                "Unable to save video. The file may be too large for browser storage."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (video) => {
        setEditingId(video.id);
        setTitle(video.title || "");
        setDescription(video.description || "");

        const selectedCourse = COURSES.includes(video.course)
            ? video.course
            : COURSES.includes(video.category)
                ? video.category
                : "Front Office";

        setCourse(selectedCourse);

        const availableLessons = LESSONS[selectedCourse];

        setLesson(
            availableLessons.includes(video.lesson)
                ? video.lesson
                : availableLessons[0]
        );

        setIsPublished(video.isPublished ?? false);
        setFile(null);

        const fileInput = document.getElementById("training-video-file");

        if (fileInput) {
            fileInput.value = "";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this training video?"
        );

        if (!confirmed) return;

        try {
            await deleteTrainingVideo(id);
            await loadVideos();

            if (editingId === id) {
                resetForm();
            }

            setMessage("Training video deleted successfully.");
        } catch (error) {
            console.error("Error deleting video:", error);
            setMessage("Unable to delete training video.");
        }
    };

    const handlePublishToggle = async (video) => {
        try {
            await saveTrainingVideo({
                ...video,
                isPublished: !video.isPublished,
                updatedAt: new Date().toISOString(),
            });

            await loadVideos();
            setMessage("Video publication status updated.");
        } catch (error) {
            console.error("Error updating publication:", error);
            setMessage("Unable to update publication status.");
        }
    };

    return (
        <div className="training-admin-page">
            <div className="training-admin-header">
                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="training-back-button"
                    >
                        ← Back to Admin Panel
                    </button>
                    <h1>Training Video Management</h1>
                    <p>
                        Upload and organize learning videos by course and lesson.
                    </p>
                </div>

                <div className="training-admin-count">
                    <strong>{videos.length}</strong>
                    <span>Total Videos</span>
                </div>
            </div>

            {message && (
                <div className="training-admin-message">
                    {message}
                </div>
            )}

            <div className="training-admin-form-card">
                <h2>{editingId ? "Edit Training Video" : "Upload New Video"}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="training-form-grid">
                        <div className="training-form-group">
                            <label>Video Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Enter video title"
                                required
                            />
                        </div>

                        <div className="training-form-group">
                            <label>Select Course *</label>
                            <select
                                value={course}
                                onChange={(event) =>
                                    handleCourseChange(event.target.value)
                                }
                            >
                                {COURSES.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="training-form-group">
                            <label>Select Lesson *</label>
                            <select
                                value={lesson}
                                onChange={(event) => setLesson(event.target.value)}
                            >
                                {LESSONS[course].map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="training-form-group">
                            <label>Video File {editingId ? "(Optional)" : "*"}</label>
                            <input
                                id="training-video-file"
                                type="file"
                                accept="video/*"
                                onChange={(event) =>
                                    setFile(event.target.files?.[0] || null)
                                }
                                required={!editingId}
                            />
                            {editingId && (
                                <small>
                                    Leave empty to keep the existing video.
                                </small>
                            )}
                        </div>

                        <div className="training-form-group full-width">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Enter video description"
                                rows="4"
                            />
                        </div>
                    </div>

                    <label className="training-publish-option">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(event) =>
                                setIsPublished(event.target.checked)
                            }
                        />
                        Publish this video
                    </label>

                    <div className="training-form-actions">
                        <button type="submit" disabled={loading}>
                            {loading
                                ? "Saving..."
                                : editingId
                                    ? "Update Video"
                                    : "Upload Video"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="training-cancel-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="training-admin-list">
                <h2>Uploaded Training Videos</h2>

                {videos.length === 0 ? (
                    <p className="training-no-videos">
                        No training videos uploaded yet.
                    </p>
                ) : (
                    <div className="training-admin-video-grid">
                        {videos.map((video) => (
                            <div className="training-admin-video-card" key={video.id}>
                                <div className="training-admin-video-icon">
                                    ▶
                                </div>

                                <div className="training-admin-video-info">
                                    <h3>{video.title}</h3>

                                    <p>
                                        {video.course || video.category} / {video.lesson || "General"}
                                    </p>

                                    <span
                                        className={
                                            video.isPublished
                                                ? "training-status published"
                                                : "training-status unpublished"
                                        }
                                    >
                                        {video.isPublished ? "Published" : "Unpublished"}
                                    </span>
                                </div>

                                <div className="training-admin-video-actions">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(video)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handlePublishToggle(video)}
                                    >
                                        {video.isPublished ? "Unpublish" : "Publish"}
                                    </button>

                                    <button
                                        type="button"
                                        className="training-delete-button"
                                        onClick={() => handleDelete(video.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrainingVideos;
