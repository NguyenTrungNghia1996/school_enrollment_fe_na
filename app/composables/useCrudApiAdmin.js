export const useCrudApiAdmin = endpoint => {
  const request = new RequestAdmin();

  return {
    get(options) {
      return request.get(endpoint, options ?? {});
    },
    getByRest(id, options) {
      return request.get(`${endpoint}/${id}`, options ?? {});
    },
    post(options) {
      return request.post(endpoint, options ?? {});
    },
    postByRest(id, options) {
      return request.post(`${endpoint}/${id}`, options ?? {});
    },
    put(options) {
      return request.put(endpoint, options ?? {});
    },
    putByRest(id, options) {
      return request.put(`${endpoint}/${id}`, options ?? {});
    },
    patch(options) {
      return request.patch(endpoint, options ?? {});
    },
    patchByRest(id, options) {
      return request.patch(`${endpoint}/${id}`, options ?? {});
    },
    delete(options) {
      return request.delete(endpoint, options ?? {});
    },
    deleteByRest(id, options) {
      return request.delete(`${endpoint}/${id}`, options ?? {});
    },
  };
};
