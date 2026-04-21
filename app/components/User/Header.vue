<template>
  <header class="fixed inset-x-0 top-0 z-50 bg-white/70 shadow-[0_4px_30px_rgba(23,59,132,0.08)] backdrop-blur-md">
    <div class="flex min-h-[100px] w-full items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8 2xl:px-12">
      <NuxtLink to="/" class="flex flex-col items-center md:flex-row md:items-end">
        <img :src="unitStore.logoFull || unitStore.logo" :alt="unitStore.name" class="h-[80px] w-auto max-w-full transition-opacity hover:opacity-100" />
      </NuxtLink>

      <div class="flex items-center gap-4">
        <template v-if="!userStore.token">
          <a-button type="primary" class="bg-primary shadow-primary/20 hover:bg-primary/90 flex h-10 items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold shadow-md" @click="userStore.openLogin()">
            <!-- <template #icon>
              <UserOutlined />
            </template> -->
            ĐĂNG NHẬP
          </a-button>
        </template>
        <template v-else>
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <div class="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-100/50 p-2 pr-4 transition-colors hover:bg-slate-100">
              <a-avatar :src="userStore.image_url" size="large" class="bg-primary">
                {{ userStore.name?.charAt(0).toUpperCase() }}
              </a-avatar>
              <div class="hidden sm:block">
                <p class="text-sm font-bold text-gray-900">{{ userStore.name }}</p>
                <p class="text-[10px] uppercase tracking-wider text-slate-500">Thí sinh</p>
              </div>
              <Icon name="lucide:chevron-down" class="text-slate-400" />
            </div>
            <template #overlay>
              <a-menu class="min-w-[200px] overflow-hidden rounded-xl border-none p-2 shadow-2xl">
                <a-menu-item key="profile" class="rounded-lg py-3">
                  <template #icon><Icon name="lucide:user" class="text-lg" /></template>
                  Thông tin cá nhân
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" class="text-error hover:bg-error/5 rounded-lg py-3" @click="handleLogout">
                  <template #icon><Icon name="lucide:log-out" class="text-error text-lg" /></template>
                  Đăng xuất
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </div>
    </div>

    <!-- Global Modal -->
  </header>
</template>

<script setup>
const unitStore = useUnitStore();
const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout();
  message.success("Đã đăng xuất thành công");
};
</script>
