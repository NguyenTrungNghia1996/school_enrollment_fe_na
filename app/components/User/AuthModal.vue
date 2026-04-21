<template>
  <a-modal v-model:open="isOpen" :footer="null" :width="500" :centered="true" :destroy-on-close="true" class="auth-modal">
    <div class="">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-2xl bg-gradient-to-tr from-[#173b84] to-[#0a1e42] text-white shadow-lg shadow-[#173b84]/20 transition-transform">
          <Icon name="lucide:shield-check" class="text-3xl" />
        </div>
        <h2 class="text-3xl font-extrabold uppercase tracking-tight text-[#071f41]">{{ authTitle }}</h2>
        <p class="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-slate-500">Truy cập hệ thống quản lý hồ sơ đăng ký và theo dõi thông tin thi.</p>
      </div>

      <div class="min-h-[280px]">
        <transition name="fade" mode="out-in">
          <UserLoginForm v-if="authMode === 'login'" :key="'login'" :compact="false" @authenticated="handleAuthenticated" />
          <UserRegisterForm v-else :key="'register'" @registered="handleRegistered" />
        </transition>
      </div>

      <div class="mt-8 flex items-center justify-between text-sm">
        <div class="h-px flex-1 bg-slate-200"></div>
        <span class="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Hoặc</span>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4">
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

<script setup lang="ts">
const isOpen = defineModel<boolean>("open", { default: false });
const authMode = ref<"login" | "register">("login");

const authTitle = computed(() => (authMode.value === "login" ? "Đăng nhập" : "Đăng ký"));

const handleAuthenticated = () => {
  isOpen.value = false;
};

const handleRegistered = (username: string) => {
  authMode.value = "login";
  message.info(`Tài khoản ${username} đã sẵn sàng đăng nhập`);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
