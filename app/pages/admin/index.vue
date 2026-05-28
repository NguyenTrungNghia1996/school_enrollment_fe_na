<template>
  <div class="min-h-[calc(100vh-100px)] space-y-6 bg-slate-50/50 bg-white p-4 md:p-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent">Bảng điều khiển</h1>
        <p class="text-sm text-slate-500">Chào mừng bạn trở lại hệ thống quản trị.</p>
      </div>
    </div>

    <a-alert v-if="overviewDashboardError" type="error" show-icon message="Không thể tải dữ liệu dashboard" description="Vui lòng thử tải lại trang hoặc kiểm tra kết nối đến máy chủ." />

    <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-baseline gap-3">
          <h2 class="text-base font-bold text-slate-800">Tổng quan hồ sơ</h2>
          <div class="text-sm text-slate-500">
            Tổng: <span class="text-xl font-bold text-slate-900">{{ formatNumber(totalApplications) }}</span>
          </div>
        </div>
        <a-button size="small" :loading="overviewDashboardLoading" @click="refreshOverviewDashboard()">
          <template #icon><Icon name="lucide:refresh-cw" /></template>
          Cập nhật
        </a-button>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <template v-if="overviewDashboardLoading && !statusStats.length">
          <a-skeleton v-for="item in 6" :key="item" active class="rounded-xl border border-slate-100 bg-white p-3" />
        </template>
        <template v-else>
          <div v-for="stat in statusStats" :key="stat.title" class="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-3 transition-all duration-300 hover:border-sky-100 hover:shadow-sm">
            <div :class="stat.accentClass" class="absolute -right-5 -top-5 h-16 w-16 rounded-full opacity-50 transition-all duration-500 group-hover:scale-110"></div>
            <div class="relative flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-xs font-medium text-slate-500">{{ stat.title }}</p>
                <div class="mt-2 flex items-baseline gap-2">
                  <p class="text-2xl font-bold tracking-tight text-slate-800">{{ formatNumber(stat.value) }}</p>
                  <p class="text-xs text-slate-400">{{ getPercentText(stat.value) }}</p>
                </div>
              </div>
              <div :class="stat.iconClass" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110">
                <Icon :name="stat.icon" class="text-xl" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.9fr)]">
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-800">Thống kê hồ sơ</h2>
            <p class="text-sm text-slate-500">So sánh hồ sơ trúng tuyển và hồ sơ nộp theo kỳ tuyển sinh.</p>
          </div>
          <a-date-picker v-model:value="selectedChartYear" picker="year" format="YYYY" placeholder="Chọn năm" class="w-full sm:w-[220px]" :allow-clear="false" />
        </div>

        <a-alert v-if="barChartError" type="error" show-icon message="Không thể tải dữ liệu biểu đồ" class="mb-4" />

        <ClientOnly>
          <div class="relative h-[320px] w-full">
            <div v-if="barChartLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <a-spin />
            </div>
            <canvas ref="barChartCanvasRef" class="h-full w-full"></canvas>
          </div>
        </ClientOnly>
      </div>

      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
        <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_240px] sm:items-center">
          <h2 class="text-lg font-bold text-slate-800">Cơ cấu trạng thái hồ sơ</h2>
          <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" auto-select-first placeholder="Chọn kỳ tuyển sinh" label="" />
        </div>

        <ClientOnly>
          <div class="relative grid min-h-[320px] grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <div v-if="examDashboardLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <a-spin />
            </div>
            <div class="relative mx-auto h-[220px] w-[220px]">
              <canvas ref="doughnutChartCanvasRef" class="h-full w-full"></canvas>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-600 sm:grid-cols-3 lg:grid-cols-2">
              <div v-for="stat in examStatusStats" :key="`doughnut-${stat.title}`" class="min-w-0">
                <div class="font-bold text-slate-800">{{ formatNumber(stat.value) }}</div>
                <div class="truncate">{{ getShortStatusName(stat.title) }}</div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>

    <div class="flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-end">
      <span><span class="font-medium text-slate-600">Phiên bản:</span> {{ buildTag || "local-development" }}</span>
      <span class="hidden text-slate-300 sm:inline">|</span>
      <span><span class="font-medium text-slate-600">Thời gian:</span> {{ formattedBuildTime }}</span>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

definePageMeta({
  layout: "admin",
});

const config = useRuntimeConfig();
const { adminDashboard } = useApi();

// Retrieve build variables
const buildTag = computed(() => config.public.buildTag);
const buildTime = computed(() => config.public.buildTime);
const selectedExamId = ref(null);
const examDashboardParams = ref({});
const selectedChartYear = ref(dayjs(String(new Date().getFullYear()), "YYYY"));
const barChartCanvasRef = ref(null);
const doughnutChartCanvasRef = ref(null);
const barChartInstance = shallowRef(null);
const doughnutChartInstance = shallowRef(null);
let ChartCtor = null;

const {
  data: overviewDashboardResponse,
  pending: overviewDashboardLoading,
  error: overviewDashboardError,
  refresh: refreshOverviewDashboard,
} = await adminDashboard.get({
  key: `admin-dashboard-overview-${Date.now()}`,
});

const {
  data: examDashboardResponse,
  pending: examDashboardLoading,
  refresh: refreshExamDashboard,
} = await adminDashboard.get({
  params: examDashboardParams,
  key: `admin-dashboard-by-exam-${Date.now()}`,
  immediate: false,
});

const barChartParams = computed(() => ({
  year: selectedChartYear.value?.year?.() || new Date().getFullYear(),
}));

const {
  data: barChartResponse,
  pending: barChartLoading,
  error: barChartError,
  refresh: refreshBarChart,
} = await adminDashboard.getByRest("barChart", {
  params: barChartParams,
  key: "admin-dashboard-bar-chart",
});

const formattedBuildTime = computed(() => {
  if (!buildTime.value) {
    return "Không xác định (Local Dev)";
  }
  const parsed = dayjs(buildTime.value);
  if (!parsed.isValid()) return buildTime.value;
  return parsed.format("DD/MM/YYYY HH:mm:ss");
});

const statusMeta = {
  "Chờ duyệt": {
    icon: "lucide:clock-3",
    iconClass: "bg-amber-50 text-amber-500",
    accentClass: "bg-amber-50",
    chartColor: "#f59e0b",
  },
  "Đã thanh toán, chờ xác minh": {
    icon: "lucide:badge-dollar-sign",
    iconClass: "bg-sky-50 text-sky-500",
    accentClass: "bg-sky-50",
    chartColor: "#0ea5e9",
  },
  "Đang xét tuyển thẳng": {
    icon: "lucide:user-check",
    iconClass: "bg-violet-50 text-violet-500",
    accentClass: "bg-violet-50",
    chartColor: "#8b5cf6",
  },
  "Duyệt, chờ thanh toán": {
    icon: "lucide:credit-card",
    iconClass: "bg-blue-50 text-blue-500",
    accentClass: "bg-blue-50",
    chartColor: "#3b82f6",
  },
  "Hoàn thành": {
    icon: "lucide:check-circle-2",
    iconClass: "bg-emerald-50 text-emerald-500",
    accentClass: "bg-emerald-50",
    chartColor: "#06b6d4",
  },
  "Trả lại": {
    icon: "lucide:corner-down-left",
    iconClass: "bg-rose-50 text-rose-500",
    accentClass: "bg-rose-50",
    chartColor: "#f43f5e",
  },
};

const overviewDashboardItems = computed(() => {
  if (!overviewDashboardResponse.value?.success) return [];
  return Array.isArray(overviewDashboardResponse.value?.data?.items) ? overviewDashboardResponse.value.data.items : [];
});

const examDashboardItems = computed(() => {
  if (!examDashboardResponse.value?.success) return [];
  return Array.isArray(examDashboardResponse.value?.data?.items) ? examDashboardResponse.value.data.items : [];
});

const statusStats = computed(() =>
  overviewDashboardItems.value.map(item => ({
    title: item.statusName,
    value: Number(item.total || 0),
    ...(statusMeta[item.statusName] || {
      icon: "lucide:file-text",
      iconClass: "bg-slate-50 text-slate-500",
      accentClass: "bg-slate-50",
      chartColor: "#94a3b8",
    }),
  })),
);

const examStatusStats = computed(() =>
  examDashboardItems.value.map(item => ({
    title: item.statusName,
    value: Number(item.total || 0),
    ...(statusMeta[item.statusName] || {
      icon: "lucide:file-text",
      iconClass: "bg-slate-50 text-slate-500",
      accentClass: "bg-slate-50",
      chartColor: "#94a3b8",
    }),
  })),
);

const totalApplications = computed(() => statusStats.value.reduce((sum, item) => sum + item.value, 0));

const barChartItems = computed(() => {
  if (!barChartResponse.value?.success) return [];
  return Array.isArray(barChartResponse.value?.data?.items) ? barChartResponse.value.data.items : [];
});

const barChartData = computed(() => ({
  labels: barChartItems.value.map(item => item.examName || `Kỳ tuyển sinh ${item.id}`),
  admitted: barChartItems.value.map(item => Number(item.totalAdmitted || 0)),
  submitted: barChartItems.value.map(item => Number(item.totalComplete || 0)),
}));

const maxChartValue = computed(() => Math.max(0, ...barChartData.value.admitted, ...barChartData.value.submitted));

const doughnutChartData = computed(() => ({
  labels: examStatusStats.value.map(item => item.title),
  values: examStatusStats.value.map(item => item.value),
  colors: examStatusStats.value.map(item => item.chartColor || "#94a3b8"),
}));

const formatNumber = value => Number(value || 0).toLocaleString("vi-VN");

const getPercentText = value => {
  if (!totalApplications.value) return "0%";
  return `${((Number(value || 0) / totalApplications.value) * 100).toFixed(1)}%`;
};

const getChartLabel = label => {
  if (!label || label.length <= 28) return label;
  return `${label.slice(0, 28)}...`;
};

const getShortStatusName = statusName => {
  const names = {
    "Chờ duyệt": "Chờ duyệt",
    "Đã thanh toán, chờ xác minh": "Chờ xác nhận",
    "Đang xét tuyển thẳng": "Đang xét tuyển thẳng",
    "Duyệt, chờ thanh toán": "Chờ thanh toán",
    "Hoàn thành": "Đã hoàn thành",
    "Trả lại": "Trả lại",
  };
  return names[statusName] || statusName;
};

const loadChartCtor = async () => {
  if (ChartCtor) return ChartCtor;
  const chartModule = await import("chart.js/auto");
  ChartCtor = chartModule.default;
  return ChartCtor;
};

const scheduleChartRender = renderFn => {
  if (!process.client) return;
  nextTick(() => {
    requestAnimationFrame(() => {
      renderFn();
    });
  });
};

const renderBarChart = async () => {
  if (!process.client || !barChartCanvasRef.value) return;

  const Chart = await loadChartCtor();

  const chartData = barChartData.value;
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Hồ sơ trúng tuyển",
        data: chartData.admitted,
        backgroundColor: "rgba(125, 211, 252, 0.9)",
        borderColor: "rgba(56, 189, 248, 1)",
        borderWidth: 1,
        borderRadius: 2,
        barPercentage: 0.72,
        categoryPercentage: 0.58,
      },
      {
        label: "Hồ sơ nộp",
        data: chartData.submitted,
        backgroundColor: "rgba(6, 182, 212, 0.9)",
        borderColor: "rgba(8, 145, 178, 1)",
        borderWidth: 1,
        borderRadius: 2,
        barPercentage: 0.72,
        categoryPercentage: 0.58,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 24,
          boxHeight: 14,
          color: "#64748b",
          padding: 22,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          callback(value) {
            return getChartLabel(this.getLabelForValue(value));
          },
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxChartValue.value ? Math.ceil(maxChartValue.value * 1.2) : 5,
        grid: {
          color: "rgba(226, 232, 240, 0.8)",
        },
        ticks: {
          color: "#64748b",
          callback: value => formatNumber(value),
        },
      },
    },
  };

  if (barChartInstance.value) {
    barChartInstance.value.data = data;
    barChartInstance.value.options = options;
    barChartInstance.value.update();
    return;
  }

  barChartInstance.value = new Chart(barChartCanvasRef.value, {
    type: "bar",
    data,
    options,
  });
};

const renderDoughnutChart = async () => {
  if (!process.client || !doughnutChartCanvasRef.value) return;

  const Chart = await loadChartCtor();
  const chartData = doughnutChartData.value;
  const hasData = chartData.values.some(value => value > 0);
  const data = {
    labels: hasData ? chartData.labels : ["Chưa có dữ liệu"],
    datasets: [
      {
        data: hasData ? chartData.values : [1],
        backgroundColor: hasData ? chartData.colors : ["#e2e8f0"],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "64%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => `${context.label}: ${hasData ? formatNumber(context.parsed) : 0}`,
        },
      },
    },
  };

  if (doughnutChartInstance.value) {
    doughnutChartInstance.value.data = data;
    doughnutChartInstance.value.options = options;
    doughnutChartInstance.value.update();
    return;
  }

  doughnutChartInstance.value = new Chart(doughnutChartCanvasRef.value, {
    type: "doughnut",
    data,
    options,
  });
};

watch(selectedExamId, value => {
  if (!value) {
    examDashboardResponse.value = null;
    examDashboardParams.value = {};
    return;
  }
  examDashboardParams.value = { idExam: value };
  refreshExamDashboard();
});

watch(selectedChartYear, () => {
  refreshBarChart();
});

watch([barChartCanvasRef, barChartData], () => scheduleChartRender(renderBarChart), {
  deep: true,
  flush: "post",
  immediate: true,
});

watch([doughnutChartCanvasRef, doughnutChartData], () => scheduleChartRender(renderDoughnutChart), {
  deep: true,
  flush: "post",
  immediate: true,
});

onBeforeUnmount(() => {
  barChartInstance.value?.destroy();
  doughnutChartInstance.value?.destroy();
});
</script>
