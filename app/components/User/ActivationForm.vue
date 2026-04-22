<template>
  <div>
    <div class="mb-6 text-center text-sm text-slate-600">
      Mã OTP 6 số đã được gửi đến email đăng ký của tài khoản <strong class="text-primary">{{ username }}</strong>.
      Vui lòng kiểm tra email để kích hoạt tài khoản.
    </div>

    <a-form :model="form" layout="vertical" autocomplete="off" @finish="handleActivate">
      <a-form-item
        name="otp"
        :rules="[
          { required: true, message: 'Vui lòng nhập mã OTP!' },
          { len: 6, message: 'Mã OTP gồm 6 chữ số!' },
        ]">
        <div class="flex justify-center mb-2">
          <a-input
            v-model:value="form.otp"
            placeholder="Nhập mã OTP 6 số"
            size="large"
            class="text-center font-mono text-lg tracking-widest max-w-[200px]"
            :maxlength="6"
          />
        </div>
      </a-form-item>

      <a-form-item class="mb-4">
        <a-button type="primary" html-type="submit" block size="large" :loading="loading">Xác nhận kích hoạt</a-button>
      </a-form-item>
    </a-form>

    <div class="text-center mt-4 space-y-3">
      <div>
        <p class="text-sm text-slate-500 mb-2">Chưa nhận được email?</p>
        <a-button type="default" block :loading="resendLoading" :disabled="countdown > 0" @click="handleResend">
          {{ countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã OTP' }}
        </a-button>
      </div>
      <div>
        <a-button type="link" class="text-slate-500 hover:text-primary" @click="emit('switch-to-login')">
          Quay lại màn hình đăng nhập
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from "vue";

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["activated", "switch-to-login"]);

const { authUser } = useApi();
const loading = ref(false);
const resendLoading = ref(false);
const countdown = ref(0);
let timer = null;

const form = reactive({
  otp: "",
});

const handleActivate = async () => {
  loading.value = true;
  try {
    const { data, error } = await authUser.activate({
      body: {
        username: props.username,
        otp: form.otp,
      },
    });

    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Kích hoạt thất bại");
    }

    message.success(data.value.message || "Tài khoản đã được kích hoạt thành công. Vui lòng đăng nhập.");
    emit("activated");
  } catch (err) {
    message.error(err?.message || "Kích hoạt thất bại");
  } finally {
    loading.value = false;
  }
};

const handleResend = async () => {
  resendLoading.value = true;
  try {
    const { data, error } = await authUser.resendActivation({
      body: {
        username: props.username,
      },
    });

    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Gửi lại OTP thất bại");
    }

    message.success(data.value.message || "Đã gửi lại mã OTP vào email của bạn.");
    startCountdown();
  } catch (err) {
    message.error(err?.message || "Gửi lại OTP thất bại");
  } finally {
    resendLoading.value = false;
  }
};

const startCountdown = () => {
  countdown.value = 60;
  clearInterval(timer);
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

onUnmounted(() => {
  clearInterval(timer);
});
</script>
