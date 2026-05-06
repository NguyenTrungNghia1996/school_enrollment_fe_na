export const useApi = () => {
  const userRequest = new RequestUser();
  const adminRequest = new RequestAdmin();

  return {
    s3: useS3Upload("/api/upload"),
    authUser: useCrudApiUser("/api/users"),
    ethnicityUser: useCrudApiUser("/api/ethnicity"),
    provinceUser: useCrudApiUser("/api/province"),
    communeUser: useCrudApiUser("/api/commune"),
    examUser: useCrudApiUser("/api/exam"),
    applicationUser: useCrudApiUser("/api/application"),
    authAdmin: useCrudApiAdmin("/api/admin"),
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
    // adminPayment: useCrudApiAdmin("/api/admin/payment"),
    adminApplication: useCrudApiAdmin("/api/admin/application"),
  };
};
