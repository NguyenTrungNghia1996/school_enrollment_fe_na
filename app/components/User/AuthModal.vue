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
          <UserLoginForm v-if="authMode === 'login'" :key="'login'" @authenticated="onAuthenticated" />
          <UserActivationForm v-else-if="authMode === 'activate'" :key="'activate'" :username="activationUsername" @activated="onActivated" @switch-to-login="authMode = 'login'" />
          <UserRegisterForm v-else :key="'register'" @registered="onRegistered" />
        </transition>
      </div>

      <div class="mb-4 mt-4 flex items-center justify-between text-sm" v-if="authMode !== 'activate'">
        <div class="h-px flex-1 bg-slate-200"></div>
        <span class="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Hoặc</span>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      <div class="grid grid-cols-1 gap-4" v-if="authMode !== 'activate'">
        <a-button block @click="authMode = authMode === 'login' ? 'register' : 'login'">
          {{ authMode === "login" ? "Tạo tài khoản mới" : "Đã có tài khoản? Đăng nhập" }}
        </a-button>
        <div class="pt-2 text-center">
          <a-button v-if="authMode === 'login'" type="link">Quên mật khẩu?</a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed } from "vue";

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

const onRegistered = (username) => {
  activationUsername.value = username;
  authMode.value = "activate";
};

const onAuthenticated = () => {
  userStore.closeAuthModal();
};

const onActivated = () => {
  authMode.value = "login";
  activationUsername.value = "";
};

const authTitle = computed(() => {
  if (authMode.value === "login") return "Đăng nhập";
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
