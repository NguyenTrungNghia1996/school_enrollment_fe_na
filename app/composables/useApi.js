export const useApi = () => {
  const userRequest = new RequestUser();
  const adminRequest = new RequestAdmin();

  return {
    s3: useS3Upload("/api/upload"),
    authUser: useCrudApiUser("/api/users"),
    ethnicityUser: useCrudApiUser("/api/ethnicity"),
    provinceUser: useCrudApiUser("/api/province"),
    communeUser: useCrudApiUser("/api/commune"),
    subjectUser: useCrudApiUser("/api/subject"),
    examUser: useCrudApiUser("/api/exam"),
    applicationUser: useCrudApiUser("/api/application"),
    applicationReviewUser: useCrudApiUser("/api/application/review"),
    examScoreUser: useCrudApiUser("/api/examScore"),
    //admin
    authAdmin: useCrudApiAdmin("/api/admin"),
    adminMenus: useCrudApiAdmin("/api/admin/menus"),
    adminRoles: useCrudApiAdmin("/api/admin/roles"),
    adminManage: useCrudApiAdmin("/api/admin"),
    adminUser: useCrudApiAdmin("/api/users"),
    adminBank: useCrudApiAdmin("/api/banks"),
    adminSubject: useCrudApiAdmin("/api/subject"),
    adminEnrollment: useCrudApiAdmin("/api/admin/exam"),
    adminDashboard: useCrudApiAdmin("/api/admin/dashboard"),
    adminCandidate: useCrudApiAdmin("/api/admin/examList"),
    adminScore: useCrudApiAdmin("/api/admin/examScore"),
    adminResult: useCrudApiAdmin("/api/admin/exam/result"),
    // adminPayment: useCrudApiAdmin("/api/admin/payment"),
    adminApplication: useCrudApiAdmin("/api/admin/application"),
    adminApplicationReview: useCrudApiAdmin("/api/admin/application/review"),
  };
};
