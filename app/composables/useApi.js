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
      getDetailExam(options) {
        return userRequest.get("/api/admin/exam/detail", options ?? {});
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
      changePassword(options) {
        return adminRequest.post("/api/admin/changePassword", options ?? {});
      },
      permission(options) {
        return adminRequest.get("/api/admin/permission", options ?? {});
      },
    },
    adminMenus: useCrudApiAdmin("/api/admin/menus"),
    adminRoles: useCrudApiAdmin("/api/admin/roles"),
    adminManage: useCrudApiAdmin("/api/admin"),
    adminUser: useCrudApiAdmin("/api/users"),
    adminBank: useCrudApiAdmin("/api/banks"),
    adminSubject: useCrudApiAdmin("/api/subject"),
    adminEnrollment: useCrudApiAdmin("/api/admin/exam"),
    adminCandidate: useCrudApiAdmin("/api/admin/examList"),
    adminScore: useCrudApiAdmin("/api/admin/examScore"),
    adminResult: useCrudApiAdmin("/api/admin/exam/result"),
    adminPayment: useCrudApiAdmin("/api/admin/payment"),
    adminApplication: useCrudApiAdmin("/api/admin/application"),
  };
};
