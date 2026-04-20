<template>
  <div class="relative w-full overflow-hidden pb-12">
    <div class="pointer-events-none absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-[#173b84]/10 mix-blend-multiply blur-[100px]"></div>
    <div class="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[#43a846]/10 mix-blend-multiply blur-[120px]"></div>
    <div class="pointer-events-none absolute left-[40%] top-[20%] h-[300px] w-[300px] rounded-full bg-[#eef4ff]/50 mix-blend-multiply blur-[80px]"></div>

    <div class="relative z-10 flex flex-col pt-8">
      <div class="w-full px-4 lg:px-8 2xl:px-12">
        <div class="grid flex-1 grid-cols-1 gap-12 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">
          <section class="flex flex-col">
            <div class="flex-1 rounded-3xl border border-white bg-white/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-3xl md:p-8">
              <nav class="mb-8 flex space-x-2 rounded-xl bg-slate-200/50 p-1 backdrop-blur-sm">
                <button v-for="tab in tabs" :key="tab.key" type="button" class="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300" :class="activeTab === tab.key ? 'bg-white text-[#173b84] shadow-sm' : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-800'" @click="activeTab = tab.key as TabKey">
                  <Icon :name="tab.icon" class="text-lg" />
                  <span class="hidden sm:inline">{{ tab.label }}</span>
                </button>
              </nav>

              <div class="flex flex-1 flex-col transition-all duration-500">
                <div v-if="activeTab === 'exams'" class="grid gap-6 sm:grid-cols-2">
                  <article v-for="exam in exams" :key="exam.title" class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-[#173b84]/30">
                    <div class="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 transform bg-gradient-to-b from-[#173b84] to-[#ed1b2f] transition-transform duration-300 group-hover:scale-y-100"></div>

                    <div>
                      <div class="mb-4 flex items-center justify-between">
                        <span class="inline-flex items-center rounded-full bg-[#eef4ff] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#173b84] ring-1 ring-inset ring-[#173b84]/10">{{ exam.status }}</span>
                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-[#173b84] ring-1 ring-slate-100 transition-colors duration-300 group-hover:bg-[#173b84] group-hover:text-white">
                          <Icon name="ant-design:calendar-outlined" class="text-base" />
                        </div>
                      </div>
                      <h3 class="mb-5 text-lg font-bold leading-snug text-[#071f41] transition-colors group-hover:text-[#173b84]">{{ exam.title }}</h3>

                      <div class="space-y-3">
                        <div class="flex items-center gap-3 text-sm text-slate-600">
                          <Icon name="ant-design:clock-circle-outlined" class="text-slate-400" />
                          <span class="truncate font-medium">
                            Bắt đầu:
                            <span class="text-[#071f41]">{{ exam.start }}</span>
                          </span>
                        </div>
                        <div class="flex items-center gap-3 text-sm text-slate-600">
                          <Icon name="ant-design:close-circle-outlined" class="text-slate-400" />
                          <span class="truncate font-medium">
                            Kết thúc:
                            <span class="text-[#071f41]">{{ exam.end }}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="mt-8">
                      <a-button type="primary" class="h-10 w-full rounded-lg border-none bg-[#173b84] font-semibold opacity-50 hover:bg-[#0a1e42]" block disabled>Chưa đến hạn đăng ký</a-button>
                    </div>
                  </article>
                </div>

                <div v-else class="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all">
                  <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                    <Icon :name="activeContent.icon" class="text-5xl text-[#173b84]" />
                  </div>
                  <h2 class="text-2xl font-bold text-[#071f41]">{{ activeContent.title }}</h2>
                  <p class="mt-4 max-w-md text-base leading-relaxed text-slate-500">{{ activeContent.description }}</p>
                </div>
              </div>
            </div>
          </section>

          <aside class="relative flex w-full flex-col">
            <div class="sticky top-[150px] z-10 overflow-hidden rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(23,59,132,0.08)] ring-1 ring-slate-200/60 lg:p-10">
              <div class="pointer-events-none absolute right-0 top-0 rounded-bl-full bg-gradient-to-br from-[#173b84]/5 to-transparent p-32"></div>

              <div class="relative z-10 mb-8 text-center">
                <div class="mx-auto mb-6 flex h-16 w-16 transform items-center justify-center rounded-2xl bg-gradient-to-tr from-[#173b84] to-[#0a1e42] text-white shadow-lg shadow-[#173b84]/20 transition-transform hover:-rotate-3">
                  <Icon name="lucide:shield-check" class="text-3xl" />
                </div>
                <h2 class="text-3xl font-extrabold uppercase tracking-tight text-[#071f41]">{{ authTitle }}</h2>
                <p class="mx-auto mt-3 max-w-[280px] text-sm leading-relaxed text-slate-500">Truy cập hệ thống quản lý hồ sơ đăng ký và theo dõi thông tin thi.</p>
              </div>

              <div class="relative z-10 min-h-[300px]">
                <transition name="fade" mode="out-in">
                  <AuthLoginForm v-if="authMode === 'login'" :key="'login'" compact @authenticated="handleAuthenticated" />
                  <AuthRegisterForm v-else :key="'register'" @registered="handleRegistered" />
                </transition>
              </div>

              <div class="relative z-10 mt-8 flex items-center justify-between text-sm">
                <div class="h-px flex-1 bg-slate-200"></div>
                <span class="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Hoặc</span>
                <div class="h-px flex-1 bg-slate-200"></div>
              </div>

              <div class="relative z-10 mt-6 grid grid-cols-1 gap-4">
                <button type="button" class="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-4 text-sm font-bold text-slate-600 transition duration-300 hover:border-[#173b84] hover:bg-[#f8faff] hover:text-[#173b84] focus:outline-none focus:ring-2 focus:ring-[#173b84] focus:ring-offset-2" @click="authMode = authMode === 'login' ? 'register' : 'login'">
                  <Icon :name="authMode === 'login' ? 'ant-design:user-add-outlined' : 'ant-design:login-outlined'" class="text-lg text-slate-400 transition-colors group-hover:text-[#173b84]" />
                  {{ authMode === "login" ? "Tạo tài khoản mới" : "Đã có tài khoản? Đăng nhập" }}
                </button>
                <div class="pt-2 text-center">
                  <button v-if="authMode === 'login'" type="button" class="inline-block text-sm font-semibold text-[#173b84] transition-colors hover:text-[#0a1e42]">Quên mật khẩu?</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "user",
  fullWidth: true,
});

type TabKey = "exams" | "notifications" | "support";

const activeTab = ref<TabKey>("exams");
const authMode = ref<"login" | "register">("login");
const unitStore = useUnitStore();

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "exams", label: "Đợt khảo thí", icon: "ant-design:read-outlined" },
  { key: "notifications", label: "Thông báo", icon: "ant-design:notification-outlined" },
  { key: "support", label: "Phản hồi - Hỗ trợ", icon: "ant-design:message-outlined" },
];

const exams = [
  {
    title: "Olympic hóa học và KHTN",
    status: "Sắp mở",
    start: "10/01/2026 12:00:00",
    end: "08/02/2026 23:59:00",
  },
  {
    title: "Kỳ thi SPT năm 2026",
    status: "Sắp mở",
    start: "15/03/2026 14:00:00",
    end: "15/04/2026 23:59:00",
  },
  {
    title: "Học sinh giỏi cấp trường ĐHSP Hà Nội năm 2026",
    status: "Sắp mở",
    start: "20/03/2026 00:00:00",
    end: "18/04/2026 23:59:00",
  },
];

const stats = [
  { label: "Đợt thi", value: exams.length },
  { label: "Đang mở", value: 0 },
  { label: "Hỗ trợ", value: "24/7" },
];

const inactiveContent = {
  notifications: {
    icon: "ant-design:notification-outlined",
    title: "Thông báo",
    description: "Các thông báo mới sẽ được cập nhật tại đây.",
  },
  support: {
    icon: "ant-design:message-outlined",
    title: "Phản hồi - Hỗ trợ",
    description: "Gửi yêu cầu hỗ trợ hoặc theo dõi phản hồi từ trung tâm.",
  },
} as const;

const activeContent = computed(() => inactiveContent[activeTab.value as keyof typeof inactiveContent] || inactiveContent.notifications);
const authTitle = computed(() => (authMode.value === "login" ? "Đăng nhập" : "Đăng ký"));

const handleAuthenticated = () => {
  message.success("Bạn đã đăng nhập thành công");
};

const handleRegistered = (username: string) => {
  authMode.value = "login";
  message.info(`Tài khoản ${username} đã sẵn sàng đăng nhập`);
};
</script>
