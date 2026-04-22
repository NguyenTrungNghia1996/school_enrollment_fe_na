import { defineStore } from "pinia";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    admin: {},
    menu: [],
    permissions: [],
    currentPermission: 0,
  }),

  actions: {
    setAdmin(value) {
      this.admin = value || {};
    },
    logout() {
      this.admin = {};
    },
    setMenu(value) {
      this.menu = value;
    },
    setPermissions(value) {
      this.permissions = value;
    },
    setCurrentPermission(value) {
      this.currentPermission = value;
    },
  },

  getters: {
    token: state => state.admin?.token ?? null,
    name: state => state.admin?.name ?? "",
    role: state => state.admin?.name ?? "",
    isSuperAdmin: state => state.admin?.isSuperAdmin ?? false,
    image_url: state => state.admin?.image_url ?? null,
    menuItems: state => state.menu,
    menuPermissions: state => state.permissions,
  },

  persist: true,
});
