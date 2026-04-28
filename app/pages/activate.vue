<template>
  <div class="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
    <div class="w-full max-w-[520px]">
      <div class="mb-8 flex flex-col items-center text-center">
        <div class="relative mb-6">
          <div class="absolute -inset-2 rounded-full blur-xl" :class="statusAccentClass"></div>
          <div class="relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg" :class="statusBgClass">
            <Icon :name="statusIcon" class="text-4xl" />
          </div>
        </div>
        <h1 class="text-3xl font-extrabold text-slate-900">Kích hoạt tài khoản</h1>
        <p class="mt-3 max-w-[360px] text-sm leading-relaxed text-slate-500">Hệ thống đang kích hoạt tài khoản của bạn.</p>
      </div>

      <a-card :bordered="false" class="overflow-hidden rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
        <div class="space-y-5 text-center">
          <div v-if="loading" class="space-y-4 py-6">
            <a-spin size="large" />
            <p class="text-base font-medium text-slate-700">Đang kích hoạt tài khoản...</p>
          </div>

          <template v-else>
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" :class="statusSoftBgClass">
              <Icon :name="statusIcon" class="text-3xl" :class="statusTextClass" />
            </div>

            <div class="space-y-2">
              <h2 class="text-2xl font-bold text-slate-900">{{ statusTitle }}</h2>
              <p class="text-sm leading-6 text-slate-500">{{ statusMessage }}</p>
            </div>

            <!-- <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Token</p>
              <p class="mt-2 break-all font-mono text-sm text-slate-700">{{ token || "Không có token" }}</p>
            </div> -->

            <div class="grid gap-3 pt-2">
              <a-button v-if="isSuccess" type="primary" size="large" class="h-12 rounded-xl font-bold" @click="navigateTo('/')">Về trang chủ</a-button>

              <a-button v-else type="primary" size="large" class="h-12 rounded-xl font-bold" @click="retryActivate">Thử lại</a-button>

              <a-button size="large" class="h-12 rounded-xl" @click="userStore.openLogin()">Mở đăng nhập</a-button>
            </div>
          </template>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
});

const route = useRoute();
const userStore = useUserStore();
const { authUser } = useApi();

const loading = ref(true);
const isSuccess = ref(false);
const statusMessage = ref("");

const token = computed(() => {
  const value = route.query.token;
  return typeof value === "string" ? value.trim() : "";
});

const statusTitle = computed(() => (isSuccess.value ? "Kích hoạt thành công" : "Kích hoạt không thành công"));
const statusIcon = computed(() => {
  if (loading.value) return "lucide:loader-circle";
  return isSuccess.value ? "lucide:badge-check" : "lucide:shield-x";
});
const statusBgClass = computed(() => (isSuccess.value ? "bg-emerald-500" : "bg-rose-500"));
const statusAccentClass = computed(() => (isSuccess.value ? "bg-emerald-200/70" : "bg-rose-200/70"));
const statusSoftBgClass = computed(() => (isSuccess.value ? "bg-emerald-50" : "bg-rose-50"));
const statusTextClass = computed(() => (isSuccess.value ? "text-emerald-600" : "text-rose-600"));

const activateAccount = async () => {
  loading.value = true;
  userStore.closeAuthModal();

  try {
    if (!token.value) {
      throw new Error("Liên kết kích hoạt không hợp lệ");
    }

    const { data, error } = await authUser.activateToken({
      query: {
        token: token.value,
      },
    });

    if (error.value || data.value?.success === false || data.value?.status === "error") {
      throw new Error(error.value?.data?.message || data.value?.message || "Kích hoạt tài khoản thất bại.");
    }

    isSuccess.value = true;
    statusMessage.value = data.value?.message || "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập để tiếp tục.";
    userStore.closeAuthModal();
  } catch (error) {
    isSuccess.value = false;
    statusMessage.value = error?.message || "Không thể kích hoạt tài khoản với liên kết hiện tại.";
  } finally {
    loading.value = false;
  }
};

const retryActivate = () => {
  activateAccount();
};

watch(
  token,
  () => {
    userStore.closeAuthModal();
    activateAccount();
  },
  { immediate: true },
);
</script>
