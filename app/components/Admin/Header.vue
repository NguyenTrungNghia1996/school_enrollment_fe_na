<template>
  <div class="flex h-full w-full items-center justify-between border-b border-gray-700 bg-gray-900 px-6">
    <div class="flex items-center">
      <img :src="unitStore.logo" alt="Logo" class="h-16 cursor-pointer rounded-xl p-2 transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 active:shadow-none" @click="() => navigateTo(`/dashboard`)" />
    </div>
    <div class="flex items-center">
      <a-dropdown>
        <div class="group flex cursor-pointer items-center rounded-lg p-1.5 transition-all duration-200 ease-out hover:bg-gray-700/50" @click.prevent>
          <div class="flex items-center gap-3">
            <!-- User name display -->
            <div class="hidden text-right md:block">
              <div class="text-sm font-medium text-gray-200 group-hover:text-white">
                {{ adminStore.name }}
              </div>
              <div class="text-xs text-gray-400">
                {{ adminStore.role }}
              </div>
            </div>

            <!-- Avatar -->
            <div class="relative">
              <a-avatar v-if="adminStore.image_url" :src="adminStore.image_url" class="h-9 w-9 transition-all duration-300 ease-out group-hover:scale-110 group-hover:ring-2 group-hover:ring-blue-400" />
              <a-avatar v-else class="h-9 w-9 bg-gray-600 transition-all duration-300 ease-out group-hover:scale-110 group-hover:ring-2 group-hover:ring-blue-400" :style="{ verticalAlign: 'middle' }" style="background-color: #8e8e8e">
                <template #icon>
                  <UserOutlined class="text-gray-300" />
                </template>
              </a-avatar>
            </div>
          </div>
        </div>
        <template #overlay>
          <a-menu class="min-w-[180px] rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
            <!-- <a-menu-item key="profile" class="hover:bg-gray-700/50 !px-4 !py-2.5 !mx-0 text-gray-200 hover:text-white" @click="navigateTo('/profile')">
              <div class="flex items-center gap-2">
                <UserOutlined class="text-blue-400" />
                <span>Hồ sơ cá nhân</span>
              </div>
            </a-menu-item> -->
            <!-- <a-menu-item key="change_password" class="hover:bg-gray-700/50 !px-4 !py-2.5 !mx-0 text-gray-200 hover:text-white" @click="showChangePasswordModal">
              <div class="flex items-center gap-2">
                <KeyOutlined class="text-blue-400" />
                <span>Đổi mật khẩu</span>
              </div>
            </a-menu-item> -->
            <a-menu-item key="logout" class="text-gray-600 hover:bg-gray-700/50 hover:text-white" @click="signOut">
              <div class="flex items-center gap-2">
                <LogoutOutlined class="text-red-400" />
                <span>Đăng xuất</span>
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>
<script setup>
const unitStore = useUnitStore();
const adminStore = useAdminStore();
const signOut = () => {
  adminStore.logout();
  navigateTo("/");
};
</script>
