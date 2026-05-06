<template>
  <a-form :model="form" layout="vertical" autocomplete="off" @finish="handleSubmit">
    <a-form-item label="Mật khẩu hiện tại" name="oldPassword" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]">
      <a-input-password v-model:value="form.oldPassword" placeholder="Nhập mật khẩu hiện tại" />
    </a-form-item>

    <a-form-item
      label="Mật khẩu mới"
      name="newPassword"
      :rules="[
        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
        { min: 6, message: 'Mật khẩu mới cần tối thiểu 6 ký tự!' },
      ]">
      <a-input-password v-model:value="form.newPassword" placeholder="Nhập mật khẩu mới" />
    </a-form-item>

    <a-form-item
      label="Xác nhận mật khẩu mới"
      name="confirmPassword"
      :rules="[
        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
        {
          validator: async (_rule, value) => {
            if (!value || value === form.newPassword) return;
            throw new Error('Mật khẩu xác nhận không khớp!');
          },
        },
      ]">
      <a-input-password v-model:value="form.confirmPassword" placeholder="Nhập lại mật khẩu mới" />
    </a-form-item>

    <a-form-item class="mb-0">
      <a-button type="primary" html-type="submit" block :loading="loading">Cập nhật mật khẩu</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
const emit = defineEmits(["changed"]);
const { authUser } = useApi();
const loading = ref(false);

const form = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const resetForm = () => {
  Object.assign(form, {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
};

const handleSubmit = async () => {
  loading.value = true;

  try {
    const { data, error } = await authUser.postByRest("changePassword", {
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    });
    if (error.value || data.value?.status === "error" || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Đổi mật khẩu thất bại");
    }

    message.success(data.value?.message || "Đổi mật khẩu thành công");
    resetForm();
    emit("changed");
  } catch (error) {
    message.error(error?.message || "Đổi mật khẩu thất bại");
  } finally {
    loading.value = false;
  }
};
</script>
