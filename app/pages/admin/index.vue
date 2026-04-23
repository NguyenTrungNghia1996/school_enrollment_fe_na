<template>
  <div class="min-h-[calc(100vh-100px)] space-y-6 bg-white p-4 md:p-6">
    <!-- Header Section -->
    <div class="mb-2 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Bảng điều khiển</h1>
        <p class="text-sm text-gray-500">Chào mừng bạn trở lại hệ thống quản trị.</p>
      </div>
      <a-button type="primary" class="flex items-center gap-2 shadow-sm">
        <Icon name="ant-design:plus-outlined" />
        Tạo báo cáo
      </a-button>
    </div>

    <!-- Stats Grid (Placeholder) -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name="ant-design:user-outlined" size="24" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Người dùng</p>
          <p class="text-xl font-bold text-gray-800">{{ 120 + i * 5 }}</p>
        </div>
      </div>
    </div>

    <!-- Component Demo Section -->
    <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 class="mb-6 flex items-center gap-2 border-b pb-4 text-lg font-semibold text-gray-800">
        <Icon name="ant-design:setting-outlined" class="text-primary" />
        Thử nghiệm Component AdminSelectRoles
      </h2>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Single Select Demo -->
        <div class="space-y-4">
          <div class="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Icon name="ant-design:info-circle-outlined" />
              Chọn đơn với nút điều hướng
            </h3>

            <AdminSelectRoles v-model="selectedRole" label="Chọn vai trò quản trị" placeholder="Tìm và chọn vai trò..." show-navigation-buttons @change="handleRoleChange" />

            <div v-if="selectedRole" class="animate-in fade-in slide-in-from-top-1 mt-4 flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 p-3 text-sm text-primary">
              <Icon name="ant-design:check-circle-filled" />
              <span>
                Đã chọn ID:
                <span class="font-bold">{{ selectedRole }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Multiple Select Demo -->
        <div class="space-y-4">
          <div class="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Icon name="ant-design:tags-outlined" />
              Chọn nhiều vai trò
            </h3>

            <AdminSelectRoles v-model="selectedRoles" multiple label="Gán nhiều nhóm quyền" placeholder="Chọn các nhóm quyền cho tài khoản..." />

            <div v-if="selectedRoles?.length > 0" class="animate-in fade-in slide-in-from-top-1 mt-4 flex flex-wrap gap-2">
              <div v-for="id in selectedRoles" :key="id" class="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-medium text-green-600">ID: {{ id }}</div>
            </div>
            <div v-else class="mt-4 text-xs italic text-gray-400">Chưa có vai trò nào được chọn</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

const selectedRole = ref(null);
const selectedRoles = ref([]);

const handleRoleChange = (val, option) => {
  console.log("✅ Role changed:", val, option);
};
</script>

<style scoped>
.text-primary {
  color: var(--ant-primary-color, #1677ff);
}
.bg-primary\/10 {
  background-color: color-mix(in srgb, var(--ant-primary-color, #1677ff) 10%, transparent);
}
.bg-primary\/5 {
  background-color: color-mix(in srgb, var(--ant-primary-color, #1677ff) 5%, transparent);
}
.border-primary\/10 {
  border-color: color-mix(in srgb, var(--ant-primary-color, #1677ff) 10%, transparent);
}
</style>
