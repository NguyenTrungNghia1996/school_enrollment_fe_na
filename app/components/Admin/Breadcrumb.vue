<template>
  <div class="p-2">
    <a-breadcrumb class="flex h-full items-center px-2">
      <a-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index" class="flex h-full items-center">
        <span v-if="index < breadcrumbItems.length - 1 && item.path" class="flex items-center text-gray-500 transition-colors duration-200 hover:text-gray-800 hover:text-primary" @click="() => navigateTo(item.path)">
          <Icon v-if="item.icon" :name="item.icon" class="mr-2 text-base" />
          <span>{{ item.title }}</span>
        </span>
        <span v-else class="flex items-center font-medium text-gray-500 hover:text-gray-800">
          <Icon v-if="item.icon" :name="item.icon" class="mr-2 text-base" />
          <span>{{ item.title }}</span>
        </span>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script setup>
import { PERMISSION_STATE, findAdminMenuPath, resolveAdminRoutePermission } from "~/composables/useAdminRoutePermission";

const route = useRoute();
const adminStore = useAdminStore();
import { useMenu } from "~/composables/useMenu";
const { visibleMenu } = useMenu();
const breadcrumbItems = ref([]);

// Quyền của route hiện tại
const currentPermission = ref(PERMISSION_STATE.NO_ACCESS);

// Lấy menu data từ store
const menuData = computed(() => visibleMenu.value);

// Hàm cập nhật breadcrumb
const updateBreadcrumb = () => {
  const matchedItems = findAdminMenuPath(menuData.value, route.path);

  breadcrumbItems.value = matchedItems.map(item => ({
    title: item.title,
    icon: item.icon,
    path: item.url,
  }));

  currentPermission.value = resolveAdminRoutePermission({
    menu: adminStore.menu,
    permissions: adminStore.menuPermissions,
    path: route.path,
    isSuperAdmin: adminStore.isSuperAdmin,
  }).permission;

  // Chỉ gọi nếu method tồn tại (để tránh crash)
  if (adminStore.setCurrentPermission) {
    adminStore.setCurrentPermission(currentPermission.value);
  }

  // Thêm trang chủ
  if (breadcrumbItems.value.length === 0 || breadcrumbItems.value[0].path !== "/admin") {
    breadcrumbItems.value.unshift({
      title: "Trang chủ",
      icon: "ant-design:home-outlined",
      path: "/admin",
    });
  }

  // Thêm title từ route meta nếu có và chưa có trong breadcrumbItems
  if (route.meta?.breadcrumb) {
    const lastItem = breadcrumbItems.value[breadcrumbItems.value.length - 1];
    if (!lastItem || lastItem.title !== route.meta.breadcrumb) {
      breadcrumbItems.value.push({
        title: route.meta.breadcrumb,
        path: route.path,
      });
    }
  }

  useHead({
    title: () => breadcrumbItems.value[breadcrumbItems.value.length - 1]?.title || "Hệ thống Tuyển sinh",
  });
};

// Theo dõi thay đổi route
watch(() => route.path, updateBreadcrumb, { immediate: true });

// Theo dõi thay đổi menu data
watch(() => visibleMenu.value, updateBreadcrumb);
watch(() => adminStore.menuPermissions, updateBreadcrumb);
</script>

<style>
/* Custom separator style to match Tailwind design */
.ant-breadcrumb-separator {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  color: #9ca3af; /* Tailwind's text-gray-400 */
}
</style>
