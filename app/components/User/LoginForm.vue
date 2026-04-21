<template>
  <a-form :model="form" layout="vertical" autocomplete="off" @finish="handleLogin">
    <a-form-item label="Tài khoản" name="username" :rules="[{ required: true, message: 'Tên đăng nhập là bắt buộc' }]">
      <a-input v-model:value="form.username" :placeholder="compact ? 'Địa chỉ email' : 'Nhập tài khoản của bạn'">
        <template #prefix>
          <Icon v-if="!compact" name="ant-design:user-outlined" class="text-gray-400" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Mật khẩu là bắt buộc' }]">
      <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu">
        <template #prefix>
          <Icon v-if="!compact" name="ant-design:lock-outlined" class="text-gray-400" />
        </template>
      </a-input-password>
    </a-form-item>

    <div class="mb-4 flex items-center justify-between gap-3">
      <a-checkbox v-model:checked="rememberMe">Ghi nhớ đăng nhập</a-checkbox>
    </div>

    <a-form-item>
      <a-button type="primary" html-type="submit" block :loading="loading">Đăng nhập</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
const props = defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["authenticated"]);

const { auth } = useApi();
const { rememberMe, saveCredentials, getCredentials, clearCredentials } = useAuth();
const userStore = useUserStore();
const savedCredentials = getCredentials();
const loading = ref(false);

const form = reactive({
  username: savedCredentials?.username || "",
  password: savedCredentials?.password || "",
});

watch(rememberMe, () => {
  if (!rememberMe.value) {
    clearCredentials();
  }
});

const handleLogin = async () => {
  loading.value = true;

  try {
    const { data, error } = await auth.login({ body: { ...form } });

    if (error.value || data.value?.status !== "success" || !data.value.data?.access_token) {
      throw new Error(error.value?.data?.message || data.value?.message || "Đăng nhập thất bại");
    }

    if (rememberMe.value) {
      saveCredentials(form.username, form.password);
    }

    userStore.setUser({
      ...data.value.data,
      token: data.value.data.access_token,
      username: form.username,
    });

    message.success(data.value.message || "Đăng nhập thành công");
    emit("authenticated");
  } catch (error) {
    message.error(error?.message || "Đăng nhập thất bại");
  } finally {
    loading.value = false;
  }
};
</script>
