export const useAuthApi = (endpoint) => {
  const request = new Request();

  return {
    login(options) {
      return request.post(endpoint, options ?? {});
    },
  };
};
