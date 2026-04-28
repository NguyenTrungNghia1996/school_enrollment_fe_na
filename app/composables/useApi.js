export const useApi = () => {
  const userRequest = new RequestUser();
  const adminRequest = new RequestAdmin();

  return {
    s3: useS3Upload("/api/upload"),
    authUser: {
      register(options) {
        return userRequest.post("/api/users/register", options ?? {});
      },
      login(options) {
        return userRequest.post("/api/users/login", options ?? {});
      },
      changePassword(options) {
        return userRequest.post("/api/users/changePassword", options ?? {});
      },
      forgotPassword(options) {
        return userRequest.post("/api/users/forgotPassword", options ?? {});
      },
      activateToken(options) {
        return userRequest.get("/api/users/activate", options ?? {});
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
    communeUser: useCrudApiUser("/api/commune"),
    examUser: useCrudApiUser("/api/exam"),
    applicationUser: {
      ...useCrudApiUser("/api/application"),
      getDetail(options) {
        return userRequest.get("/api/admin/application/detail", options ?? {});
      },
      getQr(options) {
        return userRequest.get("/api/application/qr", options ?? {});
      },
      confirmPayment(options) {
        return userRequest.put("/api/application/confirmPayment", options ?? {});
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
    adminApplication: {
      get(options) {
        return adminRequest.get("/api/admin/application", options ?? {});
      },
      delete(options) {
        return adminRequest.delete("/api/admin/application", options ?? {});
      },
      getById(options) {
        return adminRequest.get("/api/admin/application/detail", options ?? {});
      },
      approve(options) {
        return adminRequest.put("/api/admin/application/approve", options ?? {});
      },
      reject(options) {
        return adminRequest.put("/api/admin/application/reject", options ?? {});
      },
    },
  };
};
