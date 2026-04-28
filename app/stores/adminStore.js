import { defineStore } from "pinia";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    admin: {},
    menu: [],
    permissions: [],
    current_permission: 0,
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
      this.current_permission = value;
    },
  },

  getters: {
    permissionState: state => state.current_permission,
    token: state => state.admin?.token ?? null,
    name: state => state.admin?.name ?? "",
    role: state => state.admin?.name ?? "",
    isSuperAdmin: state => state.admin?.isSuperAdmin ?? false,
    image_url: state => state.admin?.image_url ?? null,
    menuItems: state => state.menu,
    menuPermissions: state => state.permissions,
    canViewCurrentPage: state => {
      if (state.admin?.isSuperAdmin) return true;
      const PERMISSION_STATE = { NO_ACCESS: 0, VIEW: 1, EDIT: 2 };
      return state.current_permission === PERMISSION_STATE.VIEW || state.current_permission === PERMISSION_STATE.EDIT;
    },
    canEditCurrentPage: state => {
      if (state.admin?.isSuperAdmin) return true;
      const PERMISSION_STATE = { NO_ACCESS: 0, VIEW: 1, EDIT: 2 };
      return state.current_permission === PERMISSION_STATE.EDIT;
    },
    currentPermission() {
      return this.canEditCurrentPage;
    },
  },

  persist: true,
});
