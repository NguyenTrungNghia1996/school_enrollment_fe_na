<template>
  <div class="min-h-[calc(100vh-100px)] space-y-6 bg-slate-50/50 p-4 md:p-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent">Bảng điều khiển</h1>
        <p class="text-sm text-slate-500">Chào mừng bạn trở lại hệ thống quản trị.</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Docker Server Online
        </span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="stat in stats" :key="stat.title" class="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-md">
        <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-50 opacity-50 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-50/50"></div>
        <div class="relative flex items-center justify-between">
          <div class="space-y-2">
            <p class="text-sm font-medium text-slate-500">{{ stat.title }}</p>
            <p class="text-2xl font-bold text-slate-800 tracking-tight">{{ stat.value }}</p>
            <div class="flex items-center gap-1.5">
              <span :class="stat.changeType === 'increase' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'" class="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium">
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

    <!-- Main Content Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Docker Build & System Metadata Card (Takes 2 cols on lg screens) -->
      <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
        <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon name="logos:docker-icon" class="text-2xl" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">Thông tin Docker Container & Bản Build</h3>
                <p class="text-xs text-slate-500">Metadata và thông số vận hành của container hiện tại</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Left Info Block -->
            <div class="space-y-4">
              <!-- Build Version -->
              <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon name="lucide:server" class="text-lg" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Phiên bản Build (Docker Tag)</p>
                  <div class="mt-1 flex items-center gap-2">
                    <span class="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {{ buildTag || 'local-development' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Commit SHA -->
              <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Icon name="lucide:git-commit" class="text-lg" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Mã Commit SHA</p>
                  <div class="mt-1.5 flex items-center gap-2">
                    <code class="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[200px] md:max-w-full">
                      {{ buildSha || 'dev-commit-sha-local' }}
                    </code>
                    <a-button v-if="buildSha" size="small" type="text" class="flex h-6 w-6 items-center justify-center rounded-md p-0" @click="copySha">
                      <template #icon>
                        <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" :class="copied ? 'text-emerald-500' : 'text-slate-400'" class="text-sm" />
                      </template>
                    </a-button>
                  </div>
                </div>
              </div>

              <!-- Build Time -->
              <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Icon name="lucide:clock" class="text-lg" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Thời gian Build</p>
                  <p class="mt-1 text-sm font-semibold text-slate-800">
                    {{ formattedBuildTime }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Right Info Block (Platform / Environment metadata) -->
            <div class="space-y-4">
              <!-- Runtime Environment -->
              <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Icon name="lucide:terminal" class="text-lg" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Môi trường vận hành</p>
                  <p class="mt-1 text-sm font-semibold text-slate-800">Docker (Alpine / Node.js 20)</p>
                </div>
              </div>

              <!-- Framework Info -->
              <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon name="lucide:info" class="text-lg" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Nền tảng phát triển</p>
                  <p class="mt-1 text-sm font-semibold text-slate-800">Nuxt 4.x & Ant Design Vue 4.x</p>
                </div>
              </div>

              <!-- API Gateway -->
              <div class="flex items-start gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon name="lucide:external-link" class="text-lg" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Cổng kết nối API (Backend URL)</p>
                  <p class="mt-1 truncate text-sm font-semibold text-slate-800 hover:text-blue-600">
                    <a :href="apiBaseUrl" target="_blank" class="hover:underline">{{ apiBaseUrl }}</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Operations / Status card -->
      <div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 class="text-base font-bold text-slate-900">Trạng thái Container</h3>
        <p class="text-xs text-slate-500">Giám sát tài nguyên và phản hồi của Docker node</p>

        <div class="mt-6 space-y-5">
          <!-- CPU Mock status -->
          <div>
            <div class="mb-2 flex items-center justify-between text-xs">
              <span class="font-medium text-slate-500">CPU Usage</span>
              <span class="font-semibold text-slate-800">12.5%</span>
            </div>
            <a-progress :percent="12.5" :show-info="false" stroke-color="#1677ff" size="small" />
          </div>

          <!-- Memory Mock status -->
          <div>
            <div class="mb-2 flex items-center justify-between text-xs">
              <span class="font-medium text-slate-500">Memory Usage</span>
              <span class="font-semibold text-slate-800">342MB / 1024MB</span>
            </div>
            <a-progress :percent="33.4" :show-info="false" stroke-color="#52c41a" size="small" />
          </div>

          <!-- Network Response -->
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="lucide:clock" class="text-slate-400" />
                <span class="text-xs font-medium text-slate-600">Thời gian phản hồi</span>
              </div>
              <span class="text-xs font-bold text-emerald-600">18 ms (Rất tốt)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { message } from "ant-design-vue";
import dayjs from "dayjs";

definePageMeta({
  layout: "admin",
});

const config = useRuntimeConfig();

// Retrieve docker build metadata
const buildTag = computed(() => config.public.buildTag);
const buildSha = computed(() => config.public.buildSha);
const buildTime = computed(() => config.public.buildTime);
const apiBaseUrl = computed(() => config.public.baseURL);

const copied = ref(false);

const copySha = async () => {
  if (!buildSha.value) return;
  try {
    await navigator.clipboard.writeText(buildSha.value);
    copied.value = true;
    message.success("Đã sao chép mã commit SHA!");
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    message.error("Không thể sao chép tự động.");
  }
};

const formattedBuildTime = computed(() => {
  if (!buildTime.value) {
    return "Không xác định (Local Dev)";
  }
  const parsed = dayjs(buildTime.value);
  if (!parsed.isValid()) return buildTime.value;
  return parsed.format("DD/MM/YYYY HH:mm:ss (Z)");
});

const stats = ref([
  { title: "Tổng hồ sơ", value: "1,248", icon: "lucide:file-text", change: "+12.4%", changeType: "increase", color: "blue" },
  { title: "Đã hoàn thành", value: "856", icon: "lucide:check-circle-2", change: "+8.2%", changeType: "increase", color: "emerald" },
  { title: "Chờ thanh toán", value: "242", icon: "lucide:credit-card", change: "-3.1%", changeType: "decrease", color: "amber" },
  { title: "Bị trả lại", value: "15", icon: "lucide:alert-triangle", change: "+1.2%", changeType: "increase", color: "rose" },
]);
</script>

<style scoped>
/* High quality Tailwind dynamic colors declaration styling */
.text-blue-500 { color: #3b82f6; }
.bg-blue-50 { background-color: #eff6ff; }
.text-emerald-500 { color: #10b981; }
.bg-emerald-50 { background-color: #ecfdf5; }
.text-amber-500 { color: #f59e0b; }
.bg-amber-50 { background-color: #fffbeb; }
.text-rose-500 { color: #f43f5e; }
.bg-rose-50 { background-color: #fff1f2; }
</style>
