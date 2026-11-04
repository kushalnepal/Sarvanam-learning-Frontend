
const DB_NAME = "SarvanamLearningDB";
const VIDEO_STORE = "trainingVideos";
const COMPLETED_STORE = "completedVideos";
const USER_COMPLETED_STORE = "completedVideosByUser";
const DB_VERSION = 3;

// Get the logged-in username
export function getCurrentUsername() {
  return localStorage.getItem("sarvanam_logged_in_user") || "User";
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        db.createObjectStore(VIDEO_STORE, {
          keyPath: "id",
        });
      }

      // Keep the old completion store for data preservation.
      // New completions use a composite user + video key.
      if (!db.objectStoreNames.contains(COMPLETED_STORE)) {
        db.createObjectStore(COMPLETED_STORE, {
          keyPath: "videoId",
        });
      }

      if (!db.objectStoreNames.contains(USER_COMPLETED_STORE)) {
        db.createObjectStore(USER_COMPLETED_STORE, {
          keyPath: ["username", "videoId"],
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all training videos (shared by all users)
export async function getTrainingVideos() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(VIDEO_STORE, "readonly");
    const request = transaction.objectStore(VIDEO_STORE).getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

// Save or update a training video
export async function saveTrainingVideo(video) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(VIDEO_STORE, "readwrite");
    const store = transaction.objectStore(VIDEO_STORE);
    const getRequest = store.get(video.id);

    let videoToSave;

    getRequest.onsuccess = () => {
      const existingVideo = getRequest.result;

      videoToSave = {
        ...video,
        createdAt:
          existingVideo?.createdAt ||
          video.createdAt ||
          new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.put(videoToSave);
    };

    transaction.oncomplete = () => {
      db.close();
      resolve(videoToSave);
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

// Delete a video and all users' completion records for that video
export async function deleteTrainingVideo(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [VIDEO_STORE, USER_COMPLETED_STORE],
      "readwrite"
    );

    transaction.objectStore(VIDEO_STORE).delete(id);

    const completedStore = transaction.objectStore(USER_COMPLETED_STORE);
    const request = completedStore.getAll();

    request.onsuccess = () => {
      request.result
        .filter((item) => item.videoId === id)
        .forEach((item) => {
          completedStore.delete([item.username, item.videoId]);
        });
    };

    transaction.oncomplete = () => {
      db.close();
      resolve(true);
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

// Get completed videos for a specific user
export async function getCompletedVideos(
  username = getCurrentUsername()
) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      USER_COMPLETED_STORE,
      "readonly"
    );

    const request = transaction
      .objectStore(USER_COMPLETED_STORE)
      .getAll();

    request.onsuccess = () => {
      const userVideos = (request.result || []).filter(
        (item) => item.username === username
      );

      resolve(userVideos);
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

// Mark a video as completed for the logged-in user

export async function markVideoCompleted(
  video,
  username = getCurrentUsername()
) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      USER_COMPLETED_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(USER_COMPLETED_STORE);
    const request = store.get([username, video.id]);

    let completionRecord;

    request.onsuccess = () => {
      completionRecord = request.result || {
        username,
        videoId: video.id,
        title: video.title,
        course: video.course,
        lesson: video.lesson,
        completedAt: new Date().toISOString(),
      };

      store.put(completionRecord);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();

      // Notify the dashboard that progress has changed.
      window.dispatchEvent(
        new CustomEvent("trainingProgressUpdated", {
          detail: {
            username,
            videoId: video.id,
          },
        })
      );

      resolve(completionRecord);
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}


// Check completion for a specific user
export async function isVideoCompleted(
  videoId,
  username = getCurrentUsername()
) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      USER_COMPLETED_STORE,
      "readonly"
    );

    const request = transaction
      .objectStore(USER_COMPLETED_STORE)
      .get([username, videoId]);

    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

/*
FUTURE DATABASE INTEGRATION (SQL SERVER + API)

Suggested table: TrainingVideos

Id
Title
Description
Course
Lesson
VideoUrl
ThumbnailUrl
IsPublished
CreatedAt
UpdatedAt

Suggested table: TrainingVideoCompletions

Id
UserId
VideoId
Course
CompletedAt

Suggested API:

GET    /api/training-videos
POST   /api/training-videos
PUT    /api/training-videos/:id
DELETE /api/training-videos/:id

GET    /api/training-progress
POST   /api/training-progress/complete

For multiple users, completion records should be linked
to UserId so each user's progress is tracked separately.

Upload video files through the API using multipart/form-data.
Store actual video files in server/cloud storage and save
their URLs in SQL Server.
*/
