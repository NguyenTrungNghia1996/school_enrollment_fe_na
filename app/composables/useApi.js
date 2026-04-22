export const useApi = () => {
  const request = new Request();

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
        return request.post("/api/v1/auth/admin/login", options ?? {});
      },
    },
  };
};
