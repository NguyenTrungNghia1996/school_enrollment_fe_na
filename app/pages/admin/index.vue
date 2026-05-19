<template>
  <div class="min-h-[calc(100vh-100px)] space-y-6 bg-slate-50/50 bg-white p-4 md:p-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent">Bảng điều khiển</h1>
        <p class="text-sm text-slate-500">Chào mừng bạn trở lại hệ thống quản trị.</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="stat in stats" :key="stat.title" class="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-md">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-50 opacity-50 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-50/50"></div>
        <div class="relative flex items-center justify-between">
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-500">{{ stat.title }}</p>
            <p class="text-2xl font-bold tracking-tight text-slate-800">{{ stat.value }}</p>
            <div class="flex items-center gap-1.5">
              <span :class="stat.changeType === 'increase' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'" class="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium">
                {{ stat.change }}
              </span>
              <span class="text-xs text-slate-400">so với tuần trước</span>
            </div>
          </div>
          <div :class="`text-${stat.color}-500 bg-${stat.color}-50`" class="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
            <Icon :name="stat.icon" class="text-2xl" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Portal Overview Card (Left 2 columns) -->
      <div class="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
        <div class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-50/50 opacity-60"></div>
        <div class="relative z-10 space-y-4">
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Icon name="lucide:shield-check" />
            Cổng Thông Tin Quản Trị
          </div>
          <h2 class="text-xl font-bold text-slate-900 md:text-2xl">Hệ thống Quản lý Tuyển sinh Trung học Cơ sở</h2>
          <p class="text-sm leading-relaxed text-slate-500">Chào mừng bạn đến với trang quản trị tuyển sinh trường THCS Giảng Võ 2. Tại đây, bạn có thể thực hiện kiểm tra và quản lý hồ sơ đăng ký của thí sinh, phê duyệt trạng thái hồ sơ, xác nhận các giao dịch thanh toán lệ phí tuyển sinh, cập nhật chỉ tiêu tuyển sinh và quản lý kết quả học tập.</p>
          <div class="flex flex-wrap gap-4 pt-2">
            <div class="min-w-[140px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div class="text-xs font-medium text-slate-400">Phiên đăng nhập</div>
              <div class="mt-1 text-sm font-bold text-slate-800">Quản trị viên</div>
            </div>
            <div class="min-w-[140px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div class="text-xs font-medium text-slate-400">Trạng thái máy chủ</div>
              <div class="mt-1 flex items-center gap-1 text-sm font-bold text-emerald-600">
                <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                Ổn định
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Redesigned Build Info Panel (Right 1 column) -->
      <div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-1">
        <div class="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon name="logos:docker-icon" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Thông tin Bản Build</h3>
            <p class="text-xs text-slate-500">Cập nhật ứng dụng hiện tại</p>
          </div>
        </div>

        <div class="space-y-5">
          <!-- Build Tag -->
          <div class="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <Icon name="lucide:server" class="text-slate-400" />
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Phiên bản Build</span>
              </div>
              <span class="inline-flex animate-pulse items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Active</span>
            </div>
            <div class="mt-2 text-lg font-bold text-slate-800">
              {{ buildTag || "local-development" }}
            </div>
          </div>

          <!-- Build Time -->
          <div class="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50">
            <div class="flex items-center gap-2.5">
              <Icon name="lucide:clock" class="text-slate-400" />
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Thời gian Build</span>
            </div>
            <div class="mt-2 text-sm font-semibold text-slate-800">
              {{ formattedBuildTime }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

definePageMeta({
  layout: "admin",
});

const config = useRuntimeConfig();

// Retrieve build variables
const buildTag = computed(() => config.public.buildTag);
const buildTime = computed(() => config.public.buildTime);

const formattedBuildTime = computed(() => {
  if (!buildTime.value) {
    return "Không xác định (Local Dev)";
  }
  const parsed = dayjs(buildTime.value);
  if (!parsed.isValid()) return buildTime.value;
  return parsed.format("DD/MM/YYYY HH:mm:ss");
});

const stats = ref([
  { title: "Tổng hồ sơ", value: "1,248", icon: "lucide:file-text", change: "+12.4%", changeType: "increase", color: "blue" },
  { title: "Đã hoàn thành", value: "856", icon: "lucide:check-circle-2", change: "+8.2%", changeType: "increase", color: "emerald" },
  { title: "Chờ thanh toán", value: "242", icon: "lucide:credit-card", change: "-3.1%", changeType: "decrease", color: "amber" },
  { title: "Bị trả lại", value: "15", icon: "lucide:alert-triangle", change: "+1.2%", changeType: "increase", color: "rose" },
]);
</script>

<style scoped>
/* High quality custom dynamic styles */
.text-blue-500 {
  color: #3b82f6;
}
.bg-blue-50 {
  background-color: #eff6ff;
}
.text-emerald-500 {
  color: #10b981;
}
.bg-emerald-50 {
  background-color: #ecfdf5;
}
.text-amber-500 {
  color: #f59e0b;
}
.bg-amber-50 {
  background-color: #fffbeb;
}
.text-rose-500 {
  color: #f43f5e;
}
.bg-rose-50 {
  background-color: #fff1f2;
}
</style>
