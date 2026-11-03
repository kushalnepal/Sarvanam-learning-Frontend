
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getTrainingVideos,
  getCompletedVideos,
  markVideoCompleted,
} from "../../Utils/trainingVideoStorage";

import "./CourseDetails.css";

const COURSE_DETAILS = {
  "Front Office": {
    description:
      "Learn reservation, guest management and front office operations.",
    lessons: [
      "Reservation",
      "Check-in",
      "Check-out",
      "Guest Management",
    ],
  },

  "Point of Sale": {
    description:
      "Learn billing, KOT, menu management and sales operations.",
    lessons: [
      "Billing",
      "KOT",
      "Menu Management",
      "Sales",
    ],
  },

  Inventory: {
    description:
      "Learn stock management, GRN, purchasing and store operations.",
    lessons: [
      "Stock Management",
      "GRN",
      "Purchase",
      "Store Management",
    ],
  },

  Finance: {
    description:
      "Understand vouchers, transactions and financial reports.",
    lessons: [
      "Vouchers",
      "Transactions",
      "Financial Reports",
      "Accounting",
    ],
  },

  "General Setup": {
    description:
      "Learn user permissions and system configuration.",
    lessons: [
      "Rights and Permissions",
      "User Creation",
      "Outlet Configuration",
      "System Configuration",
    ],
  },
};

// Get upload date from available video properties.
const getUploadTime = (video) => {
  const date =
    video.createdAt ||
    video.CreatedAt ||
    video.uploadedAt ||
    video.uploaded_at;

  if (!date) return null;

  const timestamp = new Date(date).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
};

// FIFO: oldest uploaded video comes first.
const sortVideosFIFO = (videoList) => {
  return videoList
    .map((video, originalIndex) => ({
      ...video,
      originalIndex,
    }))
    .sort((a, b) => {
      const dateA = getUploadTime(a);
      const dateB = getUploadTime(b);

      if (dateA === null && dateB === null) {
        return a.originalIndex - b.originalIndex;
      }

      if (dateA === null) return 1;
      if (dateB === null) return -1;

      return dateA - dateB || a.originalIndex - b.originalIndex;
    })
    .map(({ originalIndex, ...video }) => video);
};

function CourseDetails() {
  const { courseName } = useParams();
  const navigate = useNavigate();

  const course = decodeURIComponent(courseName || "");
  const details = COURSE_DETAILS[course];

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [completedVideoIds, setCompletedVideoIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load published videos and completion records.
  useEffect(() => {
    let mounted = true;

    const loadVideos = async () => {
      setLoading(true);
      setError("");

      try {
        const [data, completedData] = await Promise.all([
          getTrainingVideos(),
          getCompletedVideos(),
        ]);

        if (mounted) {
          const publishedVideos = data.filter(
            (video) =>
              video.isPublished &&
              video.file &&
              (video.course === course ||
                (!video.course && video.category === course))
          );

          setVideos(sortVideosFIFO(publishedVideos));

          setCompletedVideoIds(
            completedData
              .filter((item) =>
                publishedVideos.some(
                  (video) => video.id === item.videoId
                )
              )
              .map((item) => item.videoId)
          );
        }
      } catch (err) {
        console.error("Unable to load course videos:", err);

        if (mounted) {
          setError("Unable to load course videos.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadVideos();

    return () => {
      mounted = false;
    };
  }, [course]);

  // Create video URL for the selected video.
  const videoUrl = useMemo(() => {
    if (!selectedVideo?.file) return "";

    return URL.createObjectURL(selectedVideo.file);
  }, [selectedVideo]);

  // Release video URL when switching or closing videos.
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // FIFO playlist: oldest uploaded video first.
  const playlist = useMemo(() => {
    return videos;
  }, [videos]);

  const currentVideoIndex = playlist.findIndex(
    (video) => video.id === selectedVideo?.id
  );

  // Check whether a video has been completed.
  const isCompleted = (videoId) => {
    return completedVideoIds.includes(videoId);
  };

  // Play selected video.
  const playVideo = (video) => {
    setSelectedVideo(video);
  };

  // Previous video in FIFO sequence.
  const playPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      playVideo(playlist[currentVideoIndex - 1]);
    }
  };

  // Next video in FIFO sequence.
  const playNextVideo = () => {
    if (currentVideoIndex < playlist.length - 1) {
      playVideo(playlist[currentVideoIndex + 1]);
    }
  };

  // Mark current video completed and automatically play next.
  const handleVideoEnded = async () => {
    if (!selectedVideo) return;

    try {
      await markVideoCompleted(selectedVideo);

      setCompletedVideoIds((previous) => {
        if (previous.includes(selectedVideo.id)) {
          return previous;
        }

        return [...previous, selectedVideo.id];
      });
    } catch (err) {
      console.error(
        "Unable to save video completion:",
        err
      );
    }

    // Automatically play the next FIFO video.
    if (currentVideoIndex < playlist.length - 1) {
      playNextVideo();
    }
  };

  // Close video player.
  const closePlayer = () => {
    setSelectedVideo(null);
  };

  // Get videos belonging to a particular lesson.
  const getLessonVideos = (lesson) => {
    return videos.filter((video) => video.lesson === lesson);
  };

  // Course completion summary.
  const totalVideos = videos.length;
  const completedCount = completedVideoIds.length;

  const courseProgress =
    totalVideos > 0
      ? Math.round((completedCount / totalVideos) * 100)
      : 0;

  if (!details) {
    return (
      <div className="course-details-page">
        <h2>Course not found</h2>

        <button onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="course-details-page">

      <button
        className="course-back-button"
        onClick={() => navigate("/")}
      >
        ← Back to Dashboard
      </button>

      {/* Course Header */}
      <div className="course-details-header">

        <span className="course-details-label">
          LEARNING COURSE
        </span>

        <h1>{course}</h1>

        <p>{details.description}</p>

        <div className="course-details-stats">

          <div>
            <strong>{details.lessons.length}</strong>
            <span>Total Lessons</span>
          </div>

          <div>
            <strong>{videos.length}</strong>
            <span>Published Videos</span>
          </div>

          <div>
            <strong>{completedCount}</strong>
            <span>Completed Videos</span>
          </div>

        </div>

        {/* Course Progress */}
        <div className="course-progress-section">

          <div className="course-progress-heading">
            <strong>Course Progress</strong>
            <strong>{courseProgress}%</strong>
          </div>

          <div className="course-progress-bar">
            <div
              className="course-progress-fill"
              style={{ width: `${courseProgress}%` }}
            />
          </div>

          <p>
            {completedCount} of {totalVideos} videos completed
          </p>

        </div>

      </div>

      {/* Course Lessons */}
      <div className="course-lessons-section">

        <h2>Course Lessons</h2>

        <p className="course-lessons-subtitle">
          Select a lesson to watch its training videos.
        </p>

        {loading ? (
          <p className="course-empty-message">
            Loading lessons...
          </p>
        ) : error ? (
          <p className="course-empty-message">
            {error}
          </p>
        ) : (
          details.lessons.map((lesson, index) => {
            const lessonVideos = getLessonVideos(lesson);

            const lessonCompleted = lessonVideos.filter(
              (video) => isCompleted(video.id)
            ).length;

            return (
              <div
                className="course-lesson-card"
                key={lesson}
              >

                <div className="course-lesson-heading">

                  <div className="course-lesson-number">
                    {index + 1}
                  </div>

                  <div className="course-lesson-info">

                    <h3>{lesson}</h3>

                    <span>
                      {lessonVideos.length}{" "}
                      {lessonVideos.length === 1
                        ? "video"
                        : "videos"}
                      {" "} · {lessonCompleted} completed
                    </span>

                  </div>

                </div>

                {lessonVideos.length > 0 ? (
                  <div className="course-lesson-videos">

                    {lessonVideos.map((video) => (
                      <div
                        className="course-video-item"
                        key={video.id}
                      >

                        <div className="course-video-item-icon">
                          ▶
                        </div>

                        <div className="course-video-item-info">

                          <h4>
                            {video.title}

                            {isCompleted(video.id) && (
                              <span className="video-completed-label">
                                ✓ Completed
                              </span>
                            )}
                          </h4>

                          <p>
                            {video.description || "Training video"}
                          </p>

                        </div>

                        <button
                          className="course-watch-button"
                          onClick={() => playVideo(video)}
                        >
                          Watch
                        </button>

                      </div>
                    ))}

                  </div>
                ) : (
                  <p className="course-lesson-empty">
                    No published videos for this lesson yet.
                  </p>
                )}

              </div>
            );
          })
        )}

      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div
          className="course-video-overlay"
          onClick={closePlayer}
          role="presentation"
        >

          <div
            className="course-video-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedVideo.title}
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="course-video-modal-header">

              <div>
                <span>{selectedVideo.lesson}</span>
                <h2>{selectedVideo.title}</h2>

                {isCompleted(selectedVideo.id) && (
                  <span className="video-completed-label">
                    ✓ Completed
                  </span>
                )}
              </div>

              <button
                className="course-video-close"
                onClick={closePlayer}
                aria-label="Close video"
              >
                ×
              </button>

            </div>

            <div className="course-video-layout">

              {/* Main Video */}
              <div className="course-video-main">

                <video
                  key={selectedVideo.id}
                  className="course-video-player"
                  src={videoUrl}
                  controls
                  autoPlay
                  onEnded={handleVideoEnded}
                >
                  Your browser does not support video playback.
                </video>

                {selectedVideo.description && (
                  <p className="course-video-description">
                    {selectedVideo.description}
                  </p>
                )}

                {/* FIFO Navigation */}
                <div className="course-video-navigation">

                  <button
                    type="button"
                    onClick={playPreviousVideo}
                    disabled={currentVideoIndex <= 0}
                  >
                    ← Previous
                  </button>

                  <span>
                    Video {currentVideoIndex + 1} of{" "}
                    {playlist.length}
                  </span>

                  <button
                    type="button"
                    onClick={playNextVideo}
                    disabled={
                      currentVideoIndex === -1 ||
                      currentVideoIndex >= playlist.length - 1
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

              {/* FIFO Playlist */}
              <aside className="course-video-playlist">

                <h3>Course Playlist</h3>

                <p className="course-playlist-count">
                  {playlist.length} training videos
                </p>

                {playlist.length > 0 ? (
                  playlist.map((video, index) => (
                    <button
                      type="button"
                      key={video.id}
                      className={`course-playlist-item ${
                        selectedVideo.id === video.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => playVideo(video)}
                    >

                      <span className="course-playlist-number">
                        {index + 1}
                      </span>

                      <div>

                        <strong>{video.title}</strong>

                        <small>{video.lesson}</small>

                        {isCompleted(video.id) && (
                          <small className="video-completed-label">
                            ✓ Completed
                          </small>
                        )}

                      </div>

                      <span className="course-playlist-play">
                        {selectedVideo.id === video.id
                          ? "▶"
                          : "▷"}
                      </span>

                    </button>
                  ))
                ) : (
                  <p>No videos available.</p>
                )}

              </aside>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default CourseDetails;
