import { useAdminStore } from "~/stores/adminStore";
import { useApi } from "~/composables/useApi";

export const usePermissions = () => {
  const { authAdmin } = useApi();
  const adminStore = useAdminStore();
  const DEFAULT_PERMISSIONS = [
    {
      key: "menu",
      permissionValue: 11184810,
    },
    {
      key: "menu-plvuxq63o0",
      permissionValue: 0,
    },
    {
      key: "menu-c8u2jgnoto",
      permissionValue: 715827883,
    },
    {
      key: "menu-f5fh5fri05",
      permissionValue: 170,
    },
    {
      key: "menu-uo6qpdsokz",
      permissionValue: 2,
    },
    {
      key: "menu-0b2mfbuz99",
      permissionValue: 2,
    },
    {
      key: "menu-wejufr0sjj",
      permissionValue: 170,
    },
    {
      key: "menu-thpw1w4jwz",
      permissionValue: 2,
    },
    {
      key: "menu-he9uf7muku",
      permissionValue: 0,
    },
    {
      key: "menu-t46urvaqzl",
      permissionValue: 2730,
    },
    {
      key: "menu-v3hzdg1pob",
      permissionValue: 10,
    },
    {
      key: "menu-82y00wdbmj",
      permissionValue: 11,
    },
    {
      key: "menu-irfvkq3395",
      permissionValue: 43690,
    },
  ];
  const loadPermissions = async () => {
    try {
      const { data } = await authAdmin.permission({
        // key: `admin-permission-${Date.now()}`,
      });
      if (data.value?.success) {
        const permission = data?.value?.data?.permission;
        adminStore.setPermissions(permission);
      } else {
        console.warn("Không có dữ liệu permission trả về");
      }
    } catch (error) {
      console.error("Lỗi loadPermissions:", error);
    }
  };

  const setPermissions = perms => {
    adminStore.setPermissions(perms || DEFAULT_PERMISSIONS);
  };

  return { loadPermissions, setPermissions };
};
