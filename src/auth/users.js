// Hardcoded users - will be replaced with SQL database later
export const USERS = [
  {
    id: "user_001",
    username: "Hassan.Iftikhar",
    email: "hassan.iftikhar@ascend.com",
    password: "password123",
    name: "Hassan Iftikhar",
    role: "admin",
    avatar:
      "https://ui-avatars.com/api/?name=John+Doe&background=4ECDC4&color=fff",
    department: "Operations",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "user_002",
    username: "Maarij.Sarfraz",
    email: "maarij.sarfraz@ascend.com",
    password: "password123",
    name: "Maarij Sarfraz",
    role: "editor",
    avatar:
      "https://ui-avatars.com/api/?name=Sarah+Smith&background=FF6B6B&color=fff",
    department: "Customer Service",
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "user_003",
    username: "Moazzam.Iliyas",
    email: "moazzam.ilyas@ascend.com",
    password: "password123",
    name: "Moazzam Iliyas",
    role: "viewer",
    avatar:
      "https://ui-avatars.com/api/?name=Mike+Wilson&background=8b5cf6&color=fff",
    department: "Quality Assurance",
    createdAt: "2024-03-10T10:00:00Z",
  },
];

export const ROLES = {
  admin: {
    name: "Admin",
    permissions: [
      "create",
      "edit",
      "delete",
      "comment",
      "manage_users",
      "view_analytics",
    ],
    color: "#4ECDC4",
  },
  editor: {
    name: "Editor",
    permissions: ["create", "edit", "comment", "view_analytics"],
    color: "#FF6B6B",
  },
  viewer: {
    name: "Viewer",
    permissions: ["comment"],
    color: "#8b5cf6",
  },
};

// Helper functions
export const authenticateUser = (username, password) => {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Don't return password in authenticated user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  return null;
};

export const getUserById = (userId) => {
  const user = USERS.find((u) => u.id === userId);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

export const getAllUsers = () => {
  return USERS.map(({ password: _, ...user }) => user);
};

export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  const role = ROLES[user.role];
  return role && role.permissions.includes(permission);
};
