<template>
  <a-form :model="form" layout="vertical" autocomplete="off" @finish="handleRegister">
    <a-form-item
      label="Email"
      name="username"
      :rules="[
        { required: true, message: 'Vui lòng nhập email!' },
        { type: 'email', message: 'Email không hợp lệ!' },
      ]">
      <a-input v-model:value="form.username" placeholder="Nhập email đăng nhập" />
    </a-form-item>

    <a-form-item
      label="Mật khẩu"
      name="password"
      :rules="[
        { required: true, message: 'Vui lòng nhập mật khẩu!' },
        { min: 8, message: 'Mật khẩu cần tối thiểu 8 ký tự!' },
      ]">
      <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu" />
    </a-form-item>

    <a-form-item
      label="Xác nhận mật khẩu"
      name="confirmPassword"
      :rules="[
        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
        {
          validator: async (_rule, value) => {
            if (!value || value === form.password) return;
            throw new Error('Mật khẩu xác nhận không khớp!');
          },
        },
      ]">
      <a-input-password v-model:value="form.confirmPassword" placeholder="Nhập lại mật khẩu" />
    </a-form-item>

    <a-form-item class="mb-0">
      <a-button type="primary" html-type="submit" block :loading="loading">Đăng ký</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
const emit = defineEmits(["registered"]);
const { authUser } = useApi();
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
  confirmPassword: "",
});

const handleRegister = async () => {
  loading.value = true;

  try {
    const { data, error } = await authUser.postByRest("register", {
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Đăng ký thất bại");
    }

    message.success(data.value.message || "Đăng ký thành công");
    emit("registered", form.username);

    Object.assign(form, {
      username: "",
      password: "",
      confirmPassword: "",
    });
  } catch (error) {
    message.error(error?.message || "Đăng ký thất bại");
  } finally {
    loading.value = false;
  }
};
</script>
