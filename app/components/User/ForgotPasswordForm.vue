<template>
  <a-form :model="form" layout="vertical" autocomplete="off" @finish="handleSubmit">
    <a-form-item
      label="Email"
      name="email"
      :rules="[
        { required: true, message: 'Vui lòng nhập email!' },
        { type: 'email', message: 'Email không hợp lệ!' },
      ]">
      <a-input v-model:value="form.email" placeholder="Nhập email tài khoản" />
    </a-form-item>

    <a-form-item class="mb-0">
      <a-button type="primary" html-type="submit" block :loading="loading">Gửi yêu cầu</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
const props = defineProps({
  initialEmail: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["submitted", "switch-to-login"]);
const { authUser } = useApi();
const loading = ref(false);

const form = reactive({
  email: props.initialEmail,
});

watch(
  () => props.initialEmail,
  value => {
    form.email = value || "";
  },
);

const handleSubmit = async () => {
  loading.value = true;

  try {
    const { data, error } = await authUser.postByRest("forgotPassword", {
      params: {
        email: form.email,
      },
    });

    if (error.value || data.value?.status === "error" || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Gửi yêu cầu thất bại");
    }

    message.success(data.value?.message || "Yêu cầu đặt lại mật khẩu đã được gửi");
    emit("submitted", form.email);
    emit("switch-to-login");
  } catch (error) {
    message.error(error?.message || "Gửi yêu cầu thất bại");
  } finally {
    loading.value = false;
  }
};
</script>
