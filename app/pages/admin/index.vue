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
