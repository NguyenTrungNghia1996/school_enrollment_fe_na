export const useApi = () => {
  const request = new Request();
  const adminRequest = new RequestAdmin();

  return {
    authUser: {
      register(options) {
        return request.post("/api/v1/auth/register", options ?? {});
      },
      login(options) {
        return request.post("/api/v1/auth/login", options ?? {});
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
        return adminRequest.post("/api/users/login", options ?? {});
      },
      menus(options) {
        return adminRequest.get("/api/menus", options ?? {});
      },
      permission(options) {
        return adminRequest.get("/api/users/permission", options ?? {});
      },
    },
  };
};
