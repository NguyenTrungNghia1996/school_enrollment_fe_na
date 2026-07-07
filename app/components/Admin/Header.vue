<template>
  <div class="flex h-full w-full items-center justify-between border-b border-gray-700 bg-gray-900 px-6">
    <div class="flex items-center">
      <img :src="unitStore.logo" alt="Logo" class="h-16 cursor-pointer rounded-xl p-2 transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-primary/20 active:scale-95 active:shadow-none" @click="() => navigateTo(`/admin`)" />
    </div>
    <div class="flex items-center gap-2">
      <a-popover trigger="click" placement="bottomRight" overlay-class-name="admin-notification-popover">
        <template #content>
          <div class="w-[360px] max-w-[calc(100vw-32px)]">
            <div class="border-b border-slate-100 px-1 pb-3 font-semibold text-slate-900">Thông báo</div>

            <div v-if="signatureExportJobs.length" class="mt-3 max-h-[360px] space-y-3 overflow-y-auto">
              <div v-for="job in signatureExportJobs" :key="job.trackId" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :class="job.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'">
                    <CheckCircleOutlined v-if="job.status === 'done'" />
                    <LoadingOutlined v-else />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="font-medium text-slate-900">
                      {{ job.status === "done" ? "Danh sách điểm danh hình ảnh đã sẵn sàng" : "Đang xuất danh sách điểm danh hình ảnh" }}
                    </div>
                    <div class="mt-1 truncate text-sm text-slate-500">
                      {{ job.fileName || "File danh sách điểm danh hình ảnh" }}
                    </div>
                    <div class="mt-1 text-sm text-slate-500">
                      {{ job.status === "done" ? "File Excel đã xử lý xong." : `Đang kiểm tra trạng thái (${job.attempts}/60).` }}
                    </div>
                    <div class="mt-3 flex gap-2">
                      <a-button v-if="job.status === 'done' && job.fileUrl" type="primary" size="small" @click="downloadSignatureImageFile(job)">Tải file</a-button>
                      <a-button danger size="small" @click="removeSignatureImageJob(job.trackId)">Xóa</a-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a-empty v-else :image="simpleImage" class="my-5" description="Không có thông báo mới" />
          </div>
        </template>

        <a-badge :dot="Boolean(signatureExportJobs.length)">
          <button type="button" class="flex h-10 w-10 items-center justify-center rounded-full text-xl text-gray-300 transition-colors hover:bg-gray-700/70 hover:text-white" aria-label="Thông báo">
            <BellOutlined />
          </button>
        </a-badge>
      </a-popover>

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
import { Empty, notification } from "ant-design-vue";

const unitStore = useUnitStore();
const adminStore = useAdminStore();
const signatureImageExportStore = useSignatureImageExportStore();
const { authAdmin } = useApi();
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const changePasswordOpen = ref(false);
const changePasswordLoading = ref(false);
const changePasswordFormRef = ref();
const changePasswordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const signatureExportJobs = computed(() => signatureImageExportStore.jobs);

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

const downloadSignatureImageFile = job => {
  if (!job?.fileUrl) return;

  const link = document.createElement("a");
  link.href = job.fileUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = job.fileName || "";
  document.body.appendChild(link);
  link.click();
  link.remove();

  removeSignatureImageJob(job.trackId);
};

const removeSignatureImageJob = trackId => {
  notification.destroy(`signature-image-export-${trackId}`);
  signatureImageExportStore.remove(trackId);
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
