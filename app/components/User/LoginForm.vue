<template>
  <a-form :model="form" layout="vertical" autocomplete="off" @finish="handleLogin">
    <a-form-item :label="compact ? undefined : 'Tài khoản'" name="username" :rules="[{ required: true, message: 'Tên đăng nhập là bắt buộc' }]">
      <a-input v-model:value="form.username" :placeholder="compact ? 'Địa chỉ email' : 'Nhập tài khoản của bạn'" size="large">
        <template #prefix>
          <Icon v-if="!compact" name="ant-design:user-outlined" class="text-gray-400" />
        </template>
      </a-input>
    </a-form-item>

    <a-form-item :label="compact ? undefined : 'Mật khẩu'" name="password" :rules="[{ required: true, message: 'Mật khẩu là bắt buộc' }]">
      <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu" size="large">
        <template #prefix>
          <Icon v-if="!compact" name="ant-design:lock-outlined" class="text-gray-400" />
        </template>
      </a-input-password>
    </a-form-item>

    <div v-if="!compact" class="mb-4 flex items-center justify-between gap-3">
      <a-checkbox v-model:checked="rememberMe">Ghi nhớ đăng nhập</a-checkbox>
    </div>

    <a-form-item :class="compact ? 'mb-0 mt-6' : 'mb-0'">
      <a-button type="primary" html-type="submit" size="large" block :loading="loading">Đăng nhập</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import type { LoginPayload } from "@/composables/useApi";

defineProps<{
  compact?: boolean;
}>();

const emit = defineEmits<{
  authenticated: [];
}>();

const { auth } = useApi();
const { rememberMe, saveCredentials, getCredentials, clearCredentials } = useAuth();
const userStore = useUserStore();
const savedCredentials = getCredentials();
const loading = ref(false);

const form = reactive<LoginPayload>({
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
  } catch (error: any) {
    message.error(error?.message || "Đăng nhập thất bại");
  } finally {
    loading.value = false;
  }
};
</script>
