<template>
  <a-modal v-model:open="isOpen" :footer="null" :width="450" :centered="true" :destroy-on-close="true" class="auth-modal">
    <div class="">
      <div class="mb-4 text-center">
        <div class="mx-auto mb-3 flex h-16 w-16 transform items-center justify-center rounded-2xl bg-gradient-to-tr from-[#173b84] to-[#0a1e42] text-white shadow-lg shadow-[#173b84]/20 transition-transform">
          <Icon name="lucide:shield-check" class="text-4xl" />
        </div>
        <h2 class="text-2xl font-extrabold uppercase tracking-tight text-[#071f41]">{{ authTitle }}</h2>
        <p class="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-slate-500">Truy cập hệ thống quản lý hồ sơ đăng ký và theo dõi thông tin thi.</p>
      </div>

      <div class="min-h-[200px]">
        <transition name="fade" mode="out-in">
          <UserLoginForm v-if="authMode === 'login'" :key="'login'" />
          <UserRegisterForm v-else :key="'register'" />
        </transition>
      </div>

      <div class="mb-4 mt-4 flex items-center justify-between text-sm">
        <div class="h-px flex-1 bg-slate-200"></div>
        <span class="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Hoặc</span>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      <div class="grid grid-cols-1 gap-4">
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
const isOpen = defineModel("open", { default: false });
const authMode = ref("login");
const authTitle = computed(() => (authMode.value === "login" ? "Đăng nhập" : "Đăng ký"));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
