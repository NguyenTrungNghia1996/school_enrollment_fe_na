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
    token: state => state.admin?.token ?? state.admin?.access_token ?? null,
    name: state => state.admin?.item?.hoten ?? state.admin?.user?.name ?? state.admin?.name ?? "Admin",
    role: state => state.admin?.user?.role?.name ?? state.admin?.role ?? "Admin",
    image_url: state => state.admin?.user?.image_url ?? state.admin?.image_url ?? null,
    menuItems: state => state.menu,
    menuPermissions: state => state.permissions,
  },

  persist: true,
});
