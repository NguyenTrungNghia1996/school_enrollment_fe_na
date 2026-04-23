import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.NUXT_ENCRYPTION_KEY || "your-secret-key";

export const useAuth = () => {
  const saveCredentials = (username, password, role = "user") => {
    const rememberMe = useCookie(`rememberMe_${role}`, {
      maxAge: 60 * 60 * 24 * 30, // 30 ngày
    });

    const encryptedPassword = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();

    const usernameCookie = useCookie(`username_${role}`, {
      secure: true,
      sameSite: "strict",
      maxAge: rememberMe.value ? 60 * 60 * 24 * 30 : undefined,
    });

    const passwordCookie = useCookie(`password_${role}`, {
      secure: true,
      sameSite: "strict",
      maxAge: rememberMe.value ? 60 * 60 * 24 * 30 : undefined,
    });

    usernameCookie.value = username;
    passwordCookie.value = encryptedPassword;
  };

  const getCredentials = (role = "user") => {
    const username = useCookie(`username_${role}`).value;
    const encryptedPassword = useCookie(`password_${role}`).value;

    if (username && encryptedPassword) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
        const password = bytes.toString(CryptoJS.enc.Utf8);

        return { username, password };
      } catch (error) {
        clearCredentials(role);
        return null;
      }
    }
    return null;
  };

  const clearCredentials = (role = "user") => {
    const usernameCookie = useCookie(`username_${role}`);
    const passwordCookie = useCookie(`password_${role}`);
    const rememberMeCookie = useCookie(`rememberMe_${role}`);

    usernameCookie.value = null;
    passwordCookie.value = null;
    rememberMeCookie.value = false;
  };

  const getRememberMe = (role = "user") => {
    return useCookie(`rememberMe_${role}`, {
      default: () => false,
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return {
    getRememberMe,
    saveCredentials,
    getCredentials,
    clearCredentials,
  };
};
