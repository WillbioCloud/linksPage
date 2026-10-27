import { auth, googleProvider, signInWithPopup, signOut as fbSignOut } from "@/lib/firebase";

const AUTH_STORAGE_KEY = "home_paraiso_admin_logged";
const AUTH_EMAIL_KEY = "home_paraiso_admin_email";

// E-mails autorizados lidos dinamicamente de variáveis de ambiente
export const getAuthorizedEmails = () => {
  const devEmail = (import.meta.env.VITE_DEV_EMAIL || "").toLowerCase().trim();
  const ownerEmail = (import.meta.env.VITE_OWNER_EMAIL || "").toLowerCase().trim();
  const list = [devEmail, ownerEmail].filter(Boolean);
  return list.length > 0 ? list : ["contato@homeparaiso.com.br", "seuemail@gmail.com"];
};

export const AUTHORIZED_EMAILS = getAuthorizedEmails();

// Identifica o cargo/perfil do usuário logado (dev, proprietaria ou admin)
export const getAdminRole = (email) => {
  const currentEmail = (email || getLoggedEmail() || "").toLowerCase().trim();
  const devEmail = (import.meta.env.VITE_DEV_EMAIL || "").toLowerCase().trim();
  const ownerEmail = (import.meta.env.VITE_OWNER_EMAIL || "").toLowerCase().trim();

  if (currentEmail && devEmail && currentEmail === devEmail) {
    return "dev";
  }
  if (currentEmail && ownerEmail && currentEmail === ownerEmail) {
    return "proprietaria";
  }
  return "admin";
};

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

export const getLoggedEmail = () => {
  try {
    return localStorage.getItem(AUTH_EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

// Login com Conta Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userEmail = (user.email || "").toLowerCase().trim();

    // Verificação de permissão lendo do .env
    const authorizedList = getAuthorizedEmails();
    const isAuthorized = authorizedList.some(
      (email) => email.toLowerCase().trim() === userEmail
    );

    if (isAuthorized) {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      localStorage.setItem(AUTH_EMAIL_KEY, userEmail);
      return { success: true, user };
    } else {
      await fbSignOut(auth);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_EMAIL_KEY);
      return {
        success: false,
        error: `O e-mail ${userEmail} não tem permissão para administrar a Home Paraíso.`,
      };
    }
  } catch (error) {
    console.error("Erro no login Google:", error);
    return {
      success: false,
      error: error.message || "Não foi possível concluir o login com o Google.",
    };
  }
};

// Login com Senha (Fallback tradicional)
export const loginAdmin = (password) => {
  const expectedPassword = getAdminPassword();
  if (password && password.trim() === expectedPassword.trim()) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem(AUTH_EMAIL_KEY, "admin@sistema.local");
    return true;
  }
  return false;
};

export const logoutAdmin = async () => {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.error(e);
  }
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_EMAIL_KEY);
  } catch (e) {
    console.error(e);
  }
};
