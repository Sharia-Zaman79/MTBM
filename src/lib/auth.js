const USERS_STORAGE_KEY = "mtbmUsers";
const CURRENT_USER_STORAGE_KEY = "mtbmCurrentUser";

export const loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const setCurrentUser = (user) => {
  if (!user) return;

  const safeUser = {
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    organization: user.organization,
  };

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(safeUser));
};

export const loadCurrentUser = () => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
};
