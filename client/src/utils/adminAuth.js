export const unlockAdmin = () => {
  localStorage.setItem("admin_unlocked", "true");
};

export const lockAdmin = () => {
  localStorage.removeItem("admin_unlocked");
};

export const isAdminUnlocked = () => {
  return localStorage.getItem("admin_unlocked") === "true";
};
