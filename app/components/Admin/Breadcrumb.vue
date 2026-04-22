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
const route = useRoute();
const adminStore = useAdminStore();
import { useMenu } from "~/composables/useMenu";
const { visibleMenu } = useMenu();
const breadcrumbItems = ref([]);

// Map các permission từ store thành dạng { key: permissionValue }
const permissionMap = computed(() => {
  const map = {};
  if (adminStore.permissions && Array.isArray(adminStore.permissions)) {
    adminStore.permissions.forEach(p => {
      map[p.key] = p.permissionValue;
    });
  }
  return map;
});

// Các trạng thái quyền
const PERMISSION_STATE = {
  NO_ACCESS: 0,
  VIEW: 1,
  EDIT: 2,
};

// Quyền của route hiện tại
const currentPermission = ref(PERMISSION_STATE.NO_ACCESS);

// Lấy menu data từ store
const menuData = computed(() => visibleMenu.value);

// Hàm tìm kiếm menu item theo path
const findMenuItemByPath = (items, path) => {
  if (!items || !items.length) return [];

  for (const item of items) {
    // 1. Khớp chính xác
    if (item.url === path) {
      return [item];
    }

    // 2. Kiểm tra dynamic routes (ví dụ: /products/:id)
    if (item.url && item.url.includes(":")) {
      const regexPath = item.url.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${regexPath}$`);
      if (regex.test(path)) {
        return [item];
      }
    }

    // 3. Đệ quy tìm trong con
    if (item.children && item.children.length > 0) {
      const found = findMenuItemByPath(item.children, path);
      if (found.length > 0) {
        return [item, ...found];
      }
    }
  }

  // 4. Nếu không khớp chính xác, tìm item là cha của path hiện tại
  for (const item of items) {
    if (item.url && item.url !== "/" && path.startsWith(item.url + "/")) {
      return [item];
    }
  }

  return [];
};

// Hàm cập nhật breadcrumb
const updateBreadcrumb = () => {
  const matchedItems = findMenuItemByPath(menuData.value, route.path);

  breadcrumbItems.value = matchedItems.map(item => ({
    title: item.title,
    icon: item.icon,
    path: item.url,
  }));

  // Tính quyền hiện tại dựa trên menu matched
  if (matchedItems.length) {
    const currentItem = matchedItems[matchedItems.length - 1];
    const parentKey = matchedItems.length > 1 ? matchedItems[matchedItems.length - 2].key : "menu";
    const parentPerm = permissionMap.value[parentKey] ?? 0;
    currentPermission.value = (parentPerm >> currentItem.permissionBit) & 0b11;
  } else {
    currentPermission.value = PERMISSION_STATE.NO_ACCESS;
  }

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
watch(() => adminStore.permissions, updateBreadcrumb);
</script>

<style>
/* Custom separator style to match Tailwind design */
.ant-breadcrumb-separator {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  color: #9ca3af; /* Tailwind's text-gray-400 */
}
</style>
