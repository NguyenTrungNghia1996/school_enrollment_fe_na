<template>
  <a-modal v-model:open="isOpen" :footer="null" :width="450" :centered="true" :destroy-on-close="true" class="auth-modal">
    <div class="">
      <div class="mb-4 text-center">
        <div class="from-primary to-primary/80 shadow-primary/20 mx-auto mb-3 flex h-16 w-16 transform items-center justify-center rounded-2xl bg-gradient-to-tr text-white shadow-lg transition-transform">
          <Icon name="lucide:shield-check" class="text-4xl" />
        </div>
        <h2 class="text-2xl font-extrabold uppercase tracking-tight text-gray-900">{{ authTitle }}</h2>
        <p class="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-slate-500">Truy cập hệ thống quản lý hồ sơ đăng ký và theo dõi thông tin thi.</p>
      </div>

      <div class="min-h-[200px]">
        <transition name="fade" mode="out-in">
          <UserLoginForm v-if="authMode === 'login'" :key="'login'" @authenticated="onAuthenticated" @forgot-password="onForgotPassword" />
          <UserForgotPasswordForm v-else-if="authMode === 'forgot-password'" :key="'forgot-password'" :initial-email="forgotPasswordEmail" @submitted="onForgotPasswordSubmitted" @switch-to-login="authMode = 'login'" />
          <UserChangePasswordForm v-else-if="authMode === 'change-password'" :key="'change-password'" @changed="onChangedPassword" />
          <UserActivationForm v-else-if="authMode === 'activate'" :key="'activate'" :username="activationUsername" @activated="onActivated" @switch-to-login="authMode = 'login'" />
          <UserRegisterForm v-else :key="'register'" @registered="onRegistered" />
        </transition>
      </div>

      <div class="mb-4 mt-4 flex items-center justify-between text-sm" v-if="showDivider">
        <div class="h-px flex-1 bg-slate-200"></div>
        <span class="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Hoặc</span>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      <div class="grid grid-cols-1 gap-4" v-if="showActions">
        <a-button block @click="handleSwitchAuthMode">
          {{ authMode === "login" ? "Tạo tài khoản mới" : "Đã có tài khoản? Đăng nhập" }}
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed } from "vue";

const userStore = useUserStore();

const isOpen = computed({
  get: () => userStore.authModal.isOpen,
  set: val => {
    if (!val) userStore.closeAuthModal();
  },
});

const authMode = computed({
  get: () => userStore.authModal.mode,
  set: val => (userStore.authModal.mode = val),
});

const activationUsername = computed({
  get: () => userStore.authModal.activationUsername,
  set: val => (userStore.authModal.activationUsername = val),
});

const forgotPasswordEmail = computed({
  get: () => userStore.authModal.forgotPasswordEmail,
  set: val => (userStore.authModal.forgotPasswordEmail = val),
});

const onRegistered = (username) => {
  activationUsername.value = username;
  forgotPasswordEmail.value = username;
  authMode.value = "login";
};

const onAuthenticated = async () => {
  userStore.closeAuthModal();
  await navigateTo("/");
};

const onForgotPassword = (email) => {
  forgotPasswordEmail.value = email || "";
  authMode.value = "forgot-password";
};

const onForgotPasswordSubmitted = (email) => {
  forgotPasswordEmail.value = email || "";
};

const onChangedPassword = () => {
  userStore.closeAuthModal();
};

const onActivated = () => {
  authMode.value = "login";
  activationUsername.value = "";
};

const showDivider = computed(() => !["activate", "change-password"].includes(authMode.value));

const showActions = computed(() => ["login", "register", "forgot-password"].includes(authMode.value));

const handleSwitchAuthMode = () => {
  authMode.value = authMode.value === "login" ? "register" : "login";
};

const authTitle = computed(() => {
  if (authMode.value === "login") return "Đăng nhập";
  if (authMode.value === "forgot-password") return "Quên mật khẩu";
  if (authMode.value === "change-password") return "Đổi mật khẩu";
  if (authMode.value === "activate") return "Kích hoạt tài khoản";
  return "Đăng ký";
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
