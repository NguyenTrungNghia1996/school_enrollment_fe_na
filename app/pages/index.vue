<template>
  <div class="w-full pb-20">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-[#071f41] py-20 text-white">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500 blur-[120px]"></div>
        <div class="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-blue-800 blur-[120px]"></div>
      </div>

      <div class="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Cổng Thông Tin Tuyển Sinh Trực Tuyến</h1>
        <p class="mx-auto mt-6 max-w-2xl text-xl text-blue-100">Hệ thống quản lý hồ sơ đăng ký và theo dõi thông tin thi dành cho thí sinh và phụ huynh của {{ unitStore.name }}.</p>
        <div class="mt-10 flex justify-center gap-4">
          <a-button type="primary" size="large" class="h-12 rounded-lg bg-blue-600 px-8 font-bold hover:bg-blue-700" @click="handleCta">BẮT ĐẦU ĐĂNG KÝ</a-button>
          <a-button ghost size="large" class="h-12 rounded-lg border-white px-8 font-bold hover:bg-white hover:text-[#071f41]">HƯỚNG DẪN THỦ TỤC</a-button>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <div class="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        <!-- Left: Exams and News -->
        <div class="space-y-16">
          <!-- Active Exams Section -->
          <section>
            <div class="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 class="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <Icon name="lucide:book-open" class="text-blue-600" />
                Các Đợt Khảo Thí Đang Mở
              </h2>
              <a-button type="link" class="font-semibold text-blue-600">Xem tất cả</a-button>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <article v-for="exam in exams" :key="exam.title" class="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-xl">
                <div>
                  <div class="mb-4">
                    <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {{ exam.status }}
                    </span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                    {{ exam.title }}
                  </h3>
                  <div class="mt-4 space-y-2 text-sm text-slate-600">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:calendar-check" class="text-slate-400" />
                      <span>
                        Ngày bắt đầu:
                        <strong>{{ exam.start }}</strong>
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-red-600">
                      <Icon name="lucide:alert-circle" />
                      <span>
                        Hết hạn:
                        <strong>{{ exam.end }}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-8">
                  <a-button block type="primary" class="h-11 rounded-lg bg-[#071f41] font-bold hover:bg-blue-900" @click="handleRegistration(exam)">ĐĂNG KÝ NGAY</a-button>
                </div>
              </article>
            </div>
          </section>

          <!-- Notifications Section -->
          <section>
            <div class="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 class="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <Icon name="lucide:megaphone" class="text-blue-600" />
                Thông Báo Quan Trọng
              </h2>
            </div>
            <div class="space-y-4">
              <div v-for="i in 3" :key="i" class="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-white hover:shadow-sm">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <Icon name="lucide:file-text" class="text-2xl" />
                </div>
                <div>
                  <h4 class="font-bold text-slate-900">Danh sách phòng thi kỳ thi Olympic hóa học năm 2026</h4>
                  <p class="mt-1 text-sm text-slate-500">Đăng ngày: 20/03/2026</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right: Sidebar -->
        <aside class="space-y-8">
          <!-- Quick Support -->
          <div class="rounded-2xl bg-slate-900 p-8 text-white shadow-2xl">
            <h3 class="mb-4 text-xl font-bold">Hỗ trợ thí sinh</h3>
            <p class="mb-6 text-sm text-slate-400">Nếu bạn gặp khó khăn trong quá trình đăng ký, hãy liên hệ với chúng tôi.</p>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Icon name="lucide:phone" />
                </div>
                <div>
                  <p class="text-xs uppercase text-slate-400">Hotline</p>
                  <p class="font-bold">{{ unitStore.phone }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Icon name="lucide:mail" />
                </div>
                <div>
                  <p class="text-xs uppercase text-slate-400">Email</p>
                  <p class="truncate text-sm font-bold">{{ unitStore.email }}</p>
                </div>
              </div>
            </div>
            <a-button block ghost class="mt-8 h-12 rounded-lg border-white/20 font-bold hover:bg-white hover:text-slate-900">GỬI YÊU CẦU HỖ TRỢ</a-button>
          </div>

          <!-- Statistics -->
          <div class="rounded-2xl border border-slate-200 bg-white p-8">
            <h3 class="mb-6 text-lg font-bold uppercase tracking-wider text-slate-900">Thống kê cổng</h3>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-500">Hồ sơ đã tiếp nhận</span>
                <span class="text-xl font-bold text-blue-600">3,492</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-500">Đợt thi hiện tại</span>
                <span class="text-xl font-bold text-blue-600">{{ exams.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-500">Lượt truy cập</span>
                <span class="text-xl font-bold text-blue-600">12K+</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
const unitStore = useUnitStore();
const userStore = useUserStore();

const exams = [
  {
    title: "Olympic Hóa Học và Khoa Học Tự Nhiên",
    status: "Sắp mở",
    start: "10/01/2026",
    end: "08/02/2026",
  },
  {
    title: "Kỳ thi Đánh giá năng lực SPT năm 2026",
    status: "Đang mở",
    start: "15/03/2026",
    end: "15/04/2026",
  },
  {
    title: "Học sinh giỏi cấp trường ĐHSP Hà Nội năm 2026",
    status: "Đang mở",
    start: "20/03/2026",
    end: "18/04/2026",
  },
];

const handleRegistration = exam => {
  if (!userStore.token) {
    message.warning("Bạn cần phàn đăng nhập để thực hiện thao tác này");
    userStore.openLogin();
  } else {
    message.info(`Đang chuyển tới trang đăng ký cho: ${exam.title}`);
  }
};

const handleCta = () => {
  if (!userStore.token) {
    userStore.openLogin();
  } else {
    message.success("Chào mừng bạn quay lại!");
  }
};
</script>

<style scoped>
/* Optional: specific styles for hero background */
</style>
