export const useApi = () => {
  const userRequest = new RequestUser();
  const adminRequest = new RequestAdmin();

  return {
    authUser: {
      register(options) {
        return userRequest.post("/api/v1/auth/register", options ?? {});
      },
      login(options) {
        return userRequest.post("/api/users/login", options ?? {});
      },
      activate(options) {
        return userRequest.post("/api/v1/auth/activate", options ?? {});
      },
      resendActivation(options) {
        return userRequest.post("/api/v1/auth/resend-activation", options ?? {});
      },
    },
    ethnicityUser: useCrudApiUser("/api/ethnicity"),
    provinceUser: useCrudApiUser("/api/province"),
    authAdmin: {
      login(options) {
        return adminRequest.post("/api/admin/login", options ?? {});
      },
      permission(options) {
        return adminRequest.get("/api/admin/permission", options ?? {});
      },
    },
    adminMenus: useCrudApiAdmin("/api/admin/menus"),
    adminRoles: useCrudApiAdmin("/api/admin/roles"),
    adminManage: useCrudApiAdmin("/api/admin"),
    adminUser: useCrudApiAdmin("/api/users"),
    adminSubject: useCrudApiAdmin("/api/subject"),
    adminEnrollment: useCrudApiAdmin("/api/exam"),
    adminApplication: {
      get(options) {
        return adminRequest.get("/api/application", options ?? {});
      },
      delete(options) {
        return adminRequest.delete("/api/application", options ?? {});
      },
      getById(options) {
        return adminRequest.get("/api/application/detail", options ?? {});
      },
    },
  };
};
