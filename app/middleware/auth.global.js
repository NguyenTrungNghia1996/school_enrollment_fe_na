import { useJwt } from "@vueuse/integrations/useJwt";
import { PERMISSION_STATE, resolveAdminRoutePermission } from "~/composables/useAdminRoutePermission";

export default defineNuxtRouteMiddleware(async to => {
  const adminStore = useAdminStore();
  const userStore = useUserStore();
  const safeMessage = useSafeMessage();

  const publicRoutes = ["/login", "/", "/activate"]; // Thêm các route công khai tại đây
  const publicStartWithRoutes = ["/test/", "/user/application/"];
  const isPublicRoute = publicRoutes.includes(to.path) || publicStartWithRoutes.some(prefix => to.path.startsWith(prefix));
  const isAdminRoute = to.path.startsWith("/admin");
  const isUserRoute = to.path.startsWith("/user");

  const checkToken = token => {
    if (!token) return false;
    try {
      const { payload } = useJwt(token);
      const exp = payload.value?.exp;
      return typeof exp === "number" && Date.now() / 1000 < exp;
    } catch {
      return false;
    }
  };

  const isAdminAuthenticated = checkToken(adminStore.token);
  const isUserAuthenticated = checkToken(userStore.token);

  if (isPublicRoute && to.path === "/login") {
    if (isAdminAuthenticated) return navigateTo("/admin");
  }
  if (isPublicRoute) return;
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      adminStore.logout();
      return navigateTo("/login");
    }
    const { loadMenu } = useMenu();
    const { loadPermissions, setPermissions } = usePermissions();
    const tasks = [];
    if (!adminStore.menu?.length) tasks.push(loadMenu());
    if (!adminStore.menuPermissions?.length) tasks.push(loadPermissions());
    if (tasks.length) await Promise.all(tasks);
    if (typeof setPermissions === "function" && adminStore.menuPermissions?.length) {
      setPermissions(adminStore.menuPermissions);
    }

    const { permission } = resolveAdminRoutePermission({
      menu: adminStore.menu,
      permissions: adminStore.menuPermissions,
      path: to.path,
      isSuperAdmin: adminStore.isSuperAdmin,
    });

    adminStore.setCurrentPermission(permission);

    if (permission === PERMISSION_STATE.NO_ACCESS) {
      safeMessage.warning("Bạn không có quyền truy cập trang này");
      return navigateTo("/admin");
    }

    return;
  }
  if (isUserRoute) {
    if (!isUserAuthenticated) {
      userStore.logout();
      return navigateTo("/");
    }
    return;
  }
});
