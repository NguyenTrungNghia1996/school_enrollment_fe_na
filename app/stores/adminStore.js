import { defineStore } from "pinia";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    admin: {},
  }),

  actions: {
    setAdmin(value) {
      this.admin = value || {};
    },
    logout() {
      this.admin = {};
    },
  },

  getters: {
    token: state => state.admin?.token ?? state.admin?.access_token ?? null,
    name: state => state.admin?.user?.name ?? state.admin?.name ?? "name",
    role: state => state.admin?.user?.role?.name ?? state.admin?.role ?? "role",
    image_url: state => state.admin?.user?.image_url ?? state.admin?.image_url ?? null,
  },

  persist: {
    storage: piniaPluginPersistedstate.cookies(),
  },
});
