<template>
  <div class="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <!-- Logo công ty -->
      <div class="flex justify-center">
        <img :src="unitStore.logo" alt="Logo công ty" class="h-30 w-auto" />
      </div>
      <a-card class="shadow-xl">
        <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Đăng nhập hệ thống</h2>
        <a-form :model="form" layout="vertical" @finish="handleLogin" autocomplete="off">
          <a-form-item label="Tài khoản" name="username" :rules="[{ required: true, message: 'Vui lòng nhập nhập tài khoản!' }]">
            <a-input v-model:value="form.username" placeholder="Nhập tài khoản của bạn" size="large">
              <template #prefix>
                <UserOutlined class="text-gray-400" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]">
            <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu" size="large">
              <template #prefix>
                <LockOutlined class="text-gray-400" />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="mb-4 flex justify-between">
            <a-checkbox v-model:checked="rememberMe">Ghi nhớ đăng nhập</a-checkbox>
            <!-- <a-typography-link> Quên mật khẩu? </a-typography-link> -->
          </div>
          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" block :loading="loading">Đăng nhập</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: "auth",
});

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

    if (error.value) {
      const errorMsg = error.value.data?.message || "Thông tin đăng nhập không chính xác.";
      message.error(errorMsg);
      return;
    }

    if (data.value) {
      // Lưu thông tin admin
      adminStore.setAdmin(data.value);

      // Xử lý ghi nhớ mật khẩu
      if (rememberMe.value) {
        saveCredentials(values.username, values.password);
      } else {
        clearCredentials();
      }

      message.success("Đăng nhập thành công!");
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

<style scoped></style>
