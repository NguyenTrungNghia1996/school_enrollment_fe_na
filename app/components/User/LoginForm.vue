<template>
  <a-form :model="form" layout="vertical" autocomplete="off" @finish="handleLogin">
    <a-form-item label="Email" name="username" :rules="[{ required: true, message: 'Tên đăng nhập là bắt buộc' }]">
      <a-input v-model:value="form.username" placeholder="Nhập tài khoản của bạn">
        <template #prefix>
          <Icon name="ant-design:user-outlined" class="text-gray-400" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Mật khẩu là bắt buộc' }]">
      <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu">
        <template #prefix>
          <Icon name="ant-design:lock-outlined" class="text-gray-400" />
        </template>
      </a-input-password>
    </a-form-item>

    <div class="mb-4 flex items-center justify-between gap-3">
      <a-checkbox v-model:checked="rememberMe">Ghi nhớ đăng nhập</a-checkbox>
      <a-button type="link" class="!px-0" @click="emit('forgot-password', form.username)">Quên mật khẩu?</a-button>
    </div>

    <a-form-item>
      <a-button type="primary" html-type="submit" block :loading="loading">Đăng nhập</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
const { authUser } = useApi();
const emit = defineEmits(["authenticated", "forgot-password"]);
const { getRememberMe, saveCredentials, getCredentials, clearCredentials } = useAuth();
const rememberMe = getRememberMe("user");
const userStore = useUserStore();
const savedCredentials = getCredentials("user");
const loading = ref(false);

const form = reactive({
  username: savedCredentials?.username || "",
  password: savedCredentials?.password || "",
});

watch(rememberMe, () => {
  if (!rememberMe.value) {
    clearCredentials("user");
  }
});

const handleLogin = async () => {
  loading.value = true;

  try {
    const { data, error } = await authUser.postByRest("login", {
      body: {
        username: form.username,
        password: form.password,
      },
    });
    if (error.value || !data.value?.success) {
      throw new Error(error.value?.data?.message || data.value?.message || "Đăng nhập thất bại");
    }

    if (rememberMe.value) {
      saveCredentials(form.username, form.password, "user");
    }
    userStore.setUser(data.value.data);
    await refreshNuxtData();
    message.success(data.value.message || "Đăng nhập thành công");
    emit("authenticated");
  } catch (error) {
    message.error(error?.message || "Đăng nhập thất bại");
  } finally {
    loading.value = false;
  }
};
</script>
