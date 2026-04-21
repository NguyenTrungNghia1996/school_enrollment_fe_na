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
    },
    authAdmin: {
      login(options) {
        return request.post("/api/v1/auth/admin/login", options ?? {});
      },
    },
  };
};
