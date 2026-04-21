import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: {},
    authModal: {
      isOpen: false,
      mode: "login",
    },
  }),

  actions: {
    setUser(value) {
      this.user = value || {};
    },
    logout() {
      this.user = {};
    },
    openLogin() {
      this.authModal.isOpen = true;
      this.authModal.mode = "login";
    },
    openRegister() {
      this.authModal.isOpen = true;
      this.authModal.mode = "register";
    },
    closeAuthModal() {
      this.authModal.isOpen = false;
    },
  },

  getters: {
    token: state => state.user?.token ?? state.user?.access_token ?? null,
    name: state => state.user?.user?.name ?? null,
    is_admin: state => state.user?.user?.is_admin ?? null,
    image_url: state => state.user?.user?.image_url ?? "",
  },

  persist: {
    storage: piniaPluginPersistedstate.cookies(),
  },
});
