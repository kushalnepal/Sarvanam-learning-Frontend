
const USERS_STORAGE_KEY = "sarvanam_users";

// TODO: DATABASE INTEGRATION
// Replace localStorage operations with API/database requests later.

const DEFAULT_USERS = [
  {
    id: "1",
    username: "admin",
    password: "12345",
    role: "Admin",
    status: "Active",
  },
  {
    id: "2",
    username: "ramesh",
    password: "12345",
    role: "Learner",
    status: "Active",
  },
  {
    id: "3",
    username: "suresh",
    password: "12345",
    role: "Learner",
    status: "Active",
  },
  {
    id: "4",
    username: "dipesh",
    password: "12345",
    role: "Trainer",
    status: "Active",
  },
];

export function getUsers() {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);

  if (!storedUsers) {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(DEFAULT_USERS)
    );

    return DEFAULT_USERS;
  }

  const users = JSON.parse(storedUsers);

  // Add missing demo accounts without overwriting existing accounts.
  const updatedUsers = [...users];

  DEFAULT_USERS.forEach((defaultUser) => {
    const exists = updatedUsers.some(
      (user) =>
        user.username.toLowerCase() ===
        defaultUser.username.toLowerCase()
    );

    if (!exists) {
      updatedUsers.push(defaultUser);
    }
  });

  if (updatedUsers.length !== users.length) {
    localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(updatedUsers)
    );
  }

  return updatedUsers;
}

export function saveUsers(users) {
  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users)
  );
}

export function authenticateUser(username, password) {
  const users = getUsers();

  const user = users.find(
    (item) =>
      item.username.toLowerCase() ===
        username.trim().toLowerCase() &&
      item.password === password
  );

  if (!user || user.status !== "Active") {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export function addUser(user) {
  const users = getUsers();

  const exists = users.some(
    (item) =>
      item.username.toLowerCase() ===
      user.username.trim().toLowerCase()
  );

  if (exists) {
    throw new Error("Username already exists.");
  }

  const newUser = {
    ...user,
    id: crypto.randomUUID(),
  };

  saveUsers([...users, newUser]);

  return newUser;
}

export function updateUser(updatedUser) {
  const users = getUsers();

  const duplicate = users.some(
    (item) =>
      item.id !== updatedUser.id &&
      item.username.toLowerCase() ===
        updatedUser.username.trim().toLowerCase()
  );

  if (duplicate) {
    throw new Error("Username already exists.");
  }

  const updatedUsers = users.map((item) =>
    item.id === updatedUser.id ? updatedUser : item
  );

  saveUsers(updatedUsers);
}

export function deleteUser(id) {
  const users = getUsers();

  const updatedUsers = users.filter(
    (user) => user.id !== id
  );

  saveUsers(updatedUsers);
}
