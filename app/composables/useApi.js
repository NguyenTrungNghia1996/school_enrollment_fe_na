export const useApi = () => {
  const request = new Request();
  const adminRequest = new RequestAdmin();

  return {
    authUser: {
      register(options) {
        return request.post("/api/v1/auth/register", options ?? {});
      },
      login(options) {
        return request.post("/api/users/login", options ?? {});
      },
      activate(options) {
        return request.post("/api/v1/auth/activate", options ?? {});
      },
      resendActivation(options) {
        return request.post("/api/v1/auth/resend-activation", options ?? {});
      },
    },
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
  };
};
