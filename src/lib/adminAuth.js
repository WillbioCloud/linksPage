/**
 * Sistema simples e seguro de autenticação para o painel administrativo da proprietária.
 */

const AUTH_STORAGE_KEY = "home_paraiso_admin_logged";

export const getAdminPassword = () => {
  return import.meta.env.VITE_ADMIN_PASSWORD || "paraiso2026";
};

export const isAdminAuthenticated = () => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch (e) {
    return false;
  }
};

export const loginAdmin = (password) => {
  const expectedPassword = getAdminPassword();
  if (password && password.trim() === expectedPassword.trim()) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    return true;
  }
  return false;
};

export const logoutAdmin = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
};
