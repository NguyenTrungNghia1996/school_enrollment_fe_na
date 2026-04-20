import { Request } from "./useRequest";

type RequestOptions = {
  params?: Record<string, any>;
  body?: any;
  key?: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  email: string;
  phone_number: string;
  full_name: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export const useApi = () => {
  const request = new Request();

  return {
    // public
    unitInfo: useCrudApi("/units/public_info"),

    // SuperAdmin
    authAdmin: useAuthApi("/auth/admin"),
    superAdmin: useCrudApi("/admin/superadmins"),
    superAdminMe: useCrudApi("/admin/superadmin_me"),
    superAdminRoleGroup: useCrudApi("/admin/superadmin_role_groups"),
    superAdminMenu: useCrudApi("/admin/superadmin_menus"),
    units: useCrudApi("/admin/units"),
    servicePackages: useCrudApi("/admin/service_packages"),
    servicePackageMenus: useCrudApi("/admin/service_package_menus"),
    s3Admin: useS3Upload("/admin/uploads/presigned_url"),

    // unitAPI
    authUnit: useAuthApi("/auth/unit"),
    s3Unit: useS3Upload("/unit/unit_uploads/presigned_url"),
    unitMenu: useCrudApi("/unit/unit_menus"),
    unitRoleGroup: useCrudApi("/unit/unit_role_groups"),
    unitUsers: useCrudApi("/unit/unit_users"),
    unitMe: useCrudApi("/unit/unit_me"),

    auth: {
      register(options?: RequestOptions) {
        return request.post<unknown>("/api/v1/auth/register", options ?? {});
      },
      login(options?: RequestOptions) {
        return request.post<LoginResponse>("/api/v1/auth/login", options ?? {});
      },
    },
  };
};
