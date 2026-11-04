
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTrainingVideos,
  getCompletedVideos,
} from "../../Utils/trainingVideoStorage";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("sarvanam_logged_in_user") || "User";

  const [courseProgress, setCourseProgress] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Courses displayed on the dashboard.
  const courses = [
    {
      title: "Front Office",
      description: "Reservation and guest management",
      color: "#0757c8",
    },
    {
      title: "Point of Sale",
      description: "Billing and sales operations",
      color: "#ff9f1c",
    },
    {
      title: "Inventory",
      description: "Stock and GRN management",
      color: "#f45135",
    },
    {
      title: "Finance",
      description: "Vouchers and financial reports",
      color: "#08b9df",
    },
  ];

  // Load progress belonging only to the logged-in user.
  
useEffect(() => {
  let mounted = true;

  const loadCourseProgress = async () => {
    try {
      const [allVideos, completedVideos] = await Promise.all([
        getTrainingVideos(),
        getCompletedVideos(username),
      ]);

      const progressData = {};

      courses.forEach((course) => {
        const courseVideos = allVideos.filter(
          (video) =>
            video.isPublished &&
            video.file &&
            (video.course === course.title ||
              (!video.course && video.category === course.title))
        );

        const completedIds = new Set(
          completedVideos
            .filter((item) => item.course === course.title)
            .map((item) => item.videoId)
        );

        const completedCount = courseVideos.filter(
          (video) => completedIds.has(video.id)
        ).length;

        const totalCount = courseVideos.length;

        const percentage =
          totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0;

        progressData[course.title] = {
          percentage,
          completedCount,
          totalCount,
        };
      });

      if (mounted) {
        setCourseProgress(progressData);
      }
    } catch (error) {
      console.error("Unable to load course progress:", error);
    } finally {
      if (mounted) {
        setLoadingProgress(false);
      }
    }
  };

  // Load progress when dashboard opens.
  loadCourseProgress();

  // Listen for video completion events.
  const handleProgressUpdate = (event) => {
    if (event.detail?.username === username) {
      loadCourseProgress();
    }
  };

  window.addEventListener(
    "trainingProgressUpdated",
    handleProgressUpdate
  );

  // Refresh progress when returning to the browser tab.
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      loadCourseProgress();
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    mounted = false;

    window.removeEventListener(
      "trainingProgressUpdated",
      handleProgressUpdate
    );

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, [username]);


  const upcoming = [
    {
      title: "Rights and User Creation",
      time: "Learn user permissions and access",
    },
    {
      title: "Reports",
      time: "Understand reports and their functions",
    },
    {
      title: "Menu, Outlet and Categories",
      time: "Learn POS configuration",
    },
  ];

  const courseList = [
    {
      icon: "▣",
      title: "Front Office",
      detail: "Reservation, Check-in and Check-out",
    },
    {
      icon: "▤",
      title: "Point of Sale",
      detail: "Billing and sales operations",
    },
    {
      icon: "▦",
      title: "Inventory",
      detail: "Stock and store management",
    },
    {
      icon: "▧",
      title: "Finance",
      detail: "Accounting and transactions",
    },
    {
      icon: "⚙",
      title: "General Setup",
      detail: "System configuration",
    },
  ];

  const notifications = [
    {
      time: "10:10",
      text: "Reservation video is still pending",
      color: "#0757c8",
    },
    {
      time: "12:10",
      text: "Reports training video will be launched soon",
      color: "#119c80",
    },
    {
      time: "01:10",
      text: "Additional videos to enhance your learning",
      color: "#08b9df",
    },
  ];

  const openCourse = (courseName) => {
    navigate(`/courses/${encodeURIComponent(courseName)}`);
  };

  return (
    <main className="dashboard">

      {/* Welcome Section */}
      <section className="welcome-dashboard">
        <div>
          <h1>Welcome, {username}!</h1>

          <p>
            Welcome to Sarvanam Learning Platform.
            Learn more and improve your skills every day.
          </p>
        </div>

        <div className="welcome-decoration">✦</div>
      </section>

      {/* Current Running Courses */}
      <section className="courses-section">

        <div className="section-heading">
          <h2>Current Running Courses</h2>

          <button
            type="button"
            className="view-all"
            onClick={() => openCourse("Front Office")}
          >
            View All
          </button>
        </div>

        <div className="course-grid">

          {courses.map((course) => {
            const progress = courseProgress[course.title] || {
              percentage: 0,
              completedCount: 0,
              totalCount: 0,
            };

            return (
              <article
                className="course-card"
                key={course.title}
                onClick={() => openCourse(course.title)}
                style={{ cursor: "pointer" }}
              >

                <div
                  className="course-label"
                  style={{ backgroundColor: course.color }}
                >
                  {course.title}
                </div>

                <h3>{course.description}</h3>

                <div className="course-footer">
                  <span>Learning progress</span>

                  <strong>
                    {loadingProgress
                      ? "..."
                      : `${progress.percentage}%`}
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress.percentage}%`,
                      backgroundColor: course.color,
                    }}
                  />
                </div>

                <small className="course-progress-count">
                  {loadingProgress
                    ? "Loading progress..."
                    : `${progress.completedCount} of ${progress.totalCount} videos completed`}
                </small>

              </article>
            );
          })}

        </div>
      </section>

      {/* Dashboard Bottom Sections */}
      <section className="dashboard-bottom">

        {/* Upcoming Lessons */}
        <div className="dashboard-panel upcoming-panel">

          <div className="section-heading">
            <h2>Upcoming Lessons</h2>

            <button
              type="button"
              className="view-all"
              onClick={() => openCourse("General Setup")}
            >
              View All
            </button>
          </div>

          {upcoming.map((lesson, index) => (
            <article className="lesson-card" key={lesson.title}>

              <div className={`lesson-top lesson-color-${index + 1}`} />

              <div className="lesson-content">
                <h3>{lesson.title}</h3>

                <p>{lesson.time}</p>

                <span className="lesson-number">
                  Lesson {index + 1}
                </span>
              </div>

            </article>
          ))}

        </div>

        {/* Course List */}
        <div className="dashboard-panel course-panel">

          <div className="section-heading">
            <h2>Course</h2>
          </div>

          <div className="course-list">

            {courseList.map((course, index) => (
              <article
                className="course-list-item"
                key={course.title}
                onClick={() => openCourse(course.title)}
                style={{ cursor: "pointer" }}
              >

                <div className={`course-icon course-icon-${index + 1}`}>
                  {course.icon}
                </div>

                <div className="course-list-text">
                  <h3>{course.title}</h3>
                  <p>{course.detail}</p>
                </div>

                <span className="course-arrow">›</span>

              </article>
            ))}

          </div>

        </div>

        {/* Recent Notifications */}
        <div className="dashboard-panel notification-panel">

          <div className="section-heading">
            <h2>Recent Notifications</h2>
          </div>

          {notifications.map((notification) => (
            <article
              className="notification-item"
              key={notification.time}
            >

              <strong>{notification.time}</strong>

              <div
                className="notification-indicator"
                style={{
                  backgroundColor: notification.color,
                }}
              />

              <p>{notification.text}</p>

            </article>
          ))}

        </div>

      </section>

    </main>
  );
}

export default Dashboard;
