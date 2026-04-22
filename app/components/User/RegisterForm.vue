<template>
  <a-form :model="form" layout="vertical" autocomplete="off" @finish="handleRegister">
    <a-form-item label="Họ và tên" name="full_name" :rules="[{ required: true, message: 'Vui lòng nhập họ và tên!' }]">
      <a-input v-model:value="form.full_name" placeholder="Nhập họ và tên" />
    </a-form-item>

    <a-form-item label="Tài khoản" name="username" :rules="[{ required: true, message: 'Vui lòng nhập tài khoản!' }]">
      <a-input v-model:value="form.username" placeholder="Nhập tài khoản" />
    </a-form-item>

    <a-form-item
      label="Email"
      name="email"
      :rules="[
        { required: true, message: 'Vui lòng nhập email!' },
        { type: 'email', message: 'Email không hợp lệ!' },
      ]">
      <a-input v-model:value="form.email" placeholder="Nhập email" />
    </a-form-item>

    <a-form-item label="Số điện thoại" name="phone_number" :rules="[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]">
      <a-input v-model:value="form.phone_number" placeholder="Nhập số điện thoại" />
    </a-form-item>

    <a-form-item
      label="Mật khẩu"
      name="password"
      :rules="[
        { required: true, message: 'Vui lòng nhập mật khẩu!' },
        { min: 6, message: 'Mật khẩu cần tối thiểu 6 ký tự!' },
      ]">
      <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu" />
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
  email: "",
  phone_number: "",
  full_name: "",
});

const handleRegister = async () => {
  loading.value = true;

  try {
    const { data, error } = await authUser.register({ body: { ...form } });

    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Đăng ký thất bại");
    }

    message.success(data.value.message || "Đăng ký thành công");
    emit("registered", form.username);

    Object.assign(form, {
      username: "",
      password: "",
      email: "",
      phone_number: "",
      full_name: "",
    });
  } catch (error) {
    message.error(error?.message || "Đăng ký thất bại");
  } finally {
    loading.value = false;
  }
};
</script>
