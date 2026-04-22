<template>
  <div class="flex min-h-[calc(100vh-140px)] items-center justify-center px-4">
    <div class="w-full max-w-[440px]">
      <!-- Header with Logo -->
      <div class="mb-8 flex flex-col items-center">
        <div class="relative mb-6">
          <div class="absolute -inset-1 rounded-full bg-primary opacity-20 blur-lg"></div>
          <img :src="unitStore.logo" alt="Logo" class="relative h-24 w-auto drop-shadow-md" />
        </div>
        <a-typography-title :level="2" class="!mb-1 !text-gray-900">Hệ thống Quản trị</a-typography-title>
        <a-typography-text type="secondary" class="text-base text-gray-500">Trường THCS Giảng Võ</a-typography-text>
      </div>

      <!-- Professional Login Card -->
      <a-card :bordered="false" class="login-card overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <!-- <template #title>
          <div class="py-2">
            <span class="text-lg font-bold text-gray-800">Đăng nhập</span>
          </div>
        </template> -->

        <a-form :model="form" layout="vertical" @finish="handleLogin" autocomplete="off" class="mt-2">
          <a-form-item label="Tài khoản" name="username" :rules="[{ required: true, message: 'Vui lòng nhập tài khoản!' }]">
            <a-input v-model:value="form.username" placeholder="Tài khoản hoặc Email" size="large" class="!rounded-lg">
              <template #prefix>
                <UserOutlined class="text-gray-400" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]">
            <a-input-password v-model:value="form.password" placeholder="••••••••" size="large" class="!rounded-lg">
              <template #prefix>
                <LockOutlined class="text-gray-400" />
              </template>
            </a-input-password>
          </a-form-item>

          <div class="mb-6 flex items-center justify-between">
            <a-checkbox v-model:checked="rememberMe">
              <span class="text-gray-600">Duy trì đăng nhập</span>
            </a-checkbox>
            <a-button type="link" size="small" class="!px-0 !font-medium">Quên mật khẩu?</a-button>
          </div>

          <a-form-item class="mb-0">
            <a-button type="primary" html-type="submit" size="large" block :loading="loading" class="h-12 !rounded-lg !text-base !font-bold shadow-md shadow-primary/20">Đăng Nhập</a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- Footer Action -->
      <div class="mt-8 text-center">
        <a-button type="text" class="text-gray-500 hover:text-blue-600" @click="navigateTo('/')">
          <template #icon>
            <Icon name="ph:arrow-left-bold" class="mr-2" />
          </template>
          Trở về trang chủ
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "auth",
});
const { loadMenu } = useMenu();
const { loadPermissions } = usePermissions();
const unitStore = useUnitStore();
const adminStore = useAdminStore();
const { authAdmin } = useApi();
const { rememberMe, saveCredentials, getCredentials, clearCredentials } = useAuth();

const form = reactive({
  username: "",
  password: "",
});

const loading = ref(false);

onMounted(() => {
  const saved = getCredentials();
  if (saved) {
    form.username = saved.username;
    form.password = saved.password;
  }
});

const handleLogin = async values => {
  loading.value = true;
  try {
    const { data, error } = await authAdmin.login({
      body: {
        username: values.username,
        password: values.password,
      },
    });
    if (error.value || !data.value?.success) {
      const errorMsg = error.value?.data?.message || data.value?.message || "Thông tin đăng nhập không chính xác.";
      message.error(errorMsg);
      return;
    }

    if (data.value && data.value.data) {
      adminStore.setAdmin(data.value.data);
      if (rememberMe.value) {
        saveCredentials(values.username, values.password);
      } else {
        clearCredentials();
      }
      await loadMenu();
      // await loadPermissions();
      message.success(data.value.message || "Chào mừng bạn trở lại hệ thống!");
      await navigateTo("/admin");
    }
  } catch (err) {
    console.error("Login Error:", err);
    message.error("Đã xảy ra lỗi hệ thống.");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
}

:deep(.ant-form-item-label label) {
  font-weight: 600;
  color: #4b5563;
}

:deep(.ant-input-lg),
:deep(.ant-input-password-large) {
  border-radius: 8px !important;
}

:deep(.ant-btn-primary) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-btn-primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 87, 160, 0.4);
}
</style>
