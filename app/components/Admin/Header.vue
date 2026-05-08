<template>
  <div class="flex h-full w-full items-center justify-between border-b border-gray-700 bg-gray-900 px-6">
    <div class="flex items-center">
      <img :src="unitStore.logo" alt="Logo" class="h-16 cursor-pointer rounded-xl p-2 transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-primary/20 active:scale-95 active:shadow-none" @click="() => navigateTo(`/admin`)" />
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
              <a-avatar v-if="adminStore.image_url" :src="adminStore.image_url" class="h-9 w-9 transition-all duration-300 ease-out group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary" />
              <a-avatar v-else class="h-9 w-9 bg-gray-600 transition-all duration-300 ease-out group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary" :style="{ verticalAlign: 'middle' }" style="background-color: #8e8e8e">
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
            <a-menu-item key="change_password" class="!mx-0 !px-4 !py-2.5 text-gray-200 hover:bg-gray-700/50 hover:text-white" @click="showChangePasswordModal">
              <div class="flex items-center gap-2">
                <KeyOutlined class="text-blue-400" />
                <span>Đổi mật khẩu</span>
              </div>
            </a-menu-item>
            <a-menu-item key="logout" class="text-gray-600 hover:bg-gray-700/50 hover:text-white" @click="signOut">
              <div class="flex items-center gap-2">
                <LogoutOutlined class="text-error" />
                <span>Đăng xuất</span>
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <a-modal v-model:open="changePasswordOpen" title="Đổi mật khẩu" :footer="null" :destroy-on-close="true" @cancel="closeChangePasswordModal">
      <a-form ref="changePasswordFormRef" :model="changePasswordForm" layout="vertical" autocomplete="off" class="mt-4" @finish="submitChangePassword">
        <a-form-item label="Mật khẩu hiện tại" name="oldPassword" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]">
          <a-input-password v-model:value="changePasswordForm.oldPassword" placeholder="Nhập mật khẩu hiện tại" />
        </a-form-item>

        <a-form-item
          label="Mật khẩu mới"
          name="newPassword"
          :rules="[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 8, message: 'Mật khẩu mới cần tối thiểu 8 ký tự' },
          ]">
          <a-input-password v-model:value="changePasswordForm.newPassword" placeholder="Nhập mật khẩu mới" />
        </a-form-item>

        <a-form-item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          :rules="[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            {
              validator: async (_rule, value) => {
                if (!value || value === changePasswordForm.newPassword) return;
                throw new Error('Mật khẩu xác nhận không khớp');
              },
            },
          ]">
          <a-input-password v-model:value="changePasswordForm.confirmPassword" placeholder="Nhập lại mật khẩu mới" />
        </a-form-item>

        <div class="flex justify-end gap-2">
          <a-button @click="closeChangePasswordModal">Hủy</a-button>
          <a-button type="primary" html-type="submit" :loading="changePasswordLoading">Cập nhật mật khẩu</a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup>
const unitStore = useUnitStore();
const adminStore = useAdminStore();
const { authAdmin } = useApi();

const changePasswordOpen = ref(false);
const changePasswordLoading = ref(false);
const changePasswordFormRef = ref();
const changePasswordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const resetChangePasswordForm = () => {
  Object.assign(changePasswordForm, {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  changePasswordFormRef.value?.clearValidate?.();
};

const showChangePasswordModal = () => {
  changePasswordOpen.value = true;
};

const closeChangePasswordModal = () => {
  changePasswordOpen.value = false;
  resetChangePasswordForm();
};

const submitChangePassword = async () => {
  changePasswordLoading.value = true;

  try {
    const { data, error } = await authAdmin.postByRest("changePassword", {
      body: {
        oldPassword: changePasswordForm.oldPassword,
        newPassword: changePasswordForm.newPassword,
        confirmPassword: changePasswordForm.confirmPassword,
      },
    });
    if (error.value || data.value?.status === "error" || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Đổi mật khẩu thất bại");
    }

    message.success(data.value?.message || "Đổi mật khẩu thành công");
    closeChangePasswordModal();
  } catch (error) {
    message.error(error?.message || "Đổi mật khẩu thất bại");
  } finally {
    changePasswordLoading.value = false;
  }
};

const signOut = () => {
  adminStore.logout();
  navigateTo("/login");
};
</script>
