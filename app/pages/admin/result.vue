<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 space-y-2">
      <div class="grid min-w-0 grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(220px,300px)] xl:items-center">
        <a-input-search v-model:value="searchText" placeholder="Tìm theo mã hồ sơ, số báo danh, họ tên..." enter-button @search="handleSearch" class="w-full min-w-0" />
        <div class="w-full min-w-0">
          <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" />
        </div>
      </div>

      <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:flex xl:justify-end">
        <a-button v-if="adminStore.canEditCurrentPage && activeTab === 'exam-result'" type="primary" ghost class="w-full whitespace-nowrap xl:w-auto" :loading="calculateLoading" :disabled="!selectedExamId || calculateLoading" @click="calculateResults">Tính toán kết quả</a-button>
        <a-popconfirm v-if="adminStore.canEditCurrentPage && activeTab === 'exam-result'" title="Bạn chắc chắn muốn công bố kết quả cho kỳ tuyển sinh đã chọn?" ok-text="Công bố" cancel-text="Hủy" @confirm="publishResults">
          <a-button type="primary" class="w-full whitespace-nowrap xl:w-auto" :loading="publishLoading" :disabled="!selectedExamId || publishLoading">Công bố kết quả</a-button>
        </a-popconfirm>
        <a-button type="primary" ghost class="w-full whitespace-nowrap xl:w-auto" :loading="exportLoading" :disabled="!selectedExamId || exportLoading" @click="exportResults">Export</a-button>
        <a-button class="w-full whitespace-nowrap xl:w-auto" @click="resetFilters">Đặt lại</a-button>
      </div>
    </div>

    <ClientOnly>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="exam-result" tab="Kết quả thi">
          <div class="overflow-x-auto lg:block">
            <a-table :columns="resultColumns" :data-source="resultDataSource" :pagination="resultPagination" :loading="isResultTableLoading" :scroll="{ x: 1000 }" bordered size="small" row-key="applicationCode" @change="handleResultTableChange">
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'stt'">
                  {{ record.stt || (resultPagination.current - 1) * resultPagination.pageSize + index + 1 }}
                </template>

                <template v-else-if="column.key === 'totalScore'">
                  <span class="font-medium text-slate-700">{{ formatScore(record.totalScore) }}</span>
                </template>

                <template v-else-if="column.key === 'result'">
                  <a-tag :color="getResultColor(record.result)">
                    {{ formatResult(record.result) }}
                  </a-tag>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <a-tab-pane key="direct-list" tab="Danh sách tuyển thẳng">
          <div class="overflow-x-auto lg:block">
            <a-table :columns="directColumns" :data-source="directDataSource" :pagination="directPagination" :loading="directLoading" :scroll="{ x: 800 }" bordered size="small" :row-key="getDirectRowKey" @change="handleDirectTableChange">
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'stt'">
                  {{ (directPagination.current - 1) * directPagination.pageSize + index + 1 }}
                </template>

                <template v-else-if="column.key === 'isDirect'">
                  <a-tag :color="record.isDirect ? 'success' : 'default'">
                    {{ record.isDirect ? "Tuyển thẳng" : "Không" }}
                  </a-tag>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </ClientOnly>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

const { adminResult } = useApi();
const adminStore = useAdminStore();
const config = useRuntimeConfig();

const searchText = ref("");
const selectedExamId = ref(null);
const activeTab = ref("exam-result");
const calculateLoading = ref(false);
const publishLoading = ref(false);
const exportLoading = ref(false);
const calculatedItems = ref(null);

const createPagination = totalLabel => ({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: total => `Tổng ${total} ${totalLabel}`,
});

const resultPagination = reactive(createPagination("kết quả"));
const directPagination = reactive(createPagination("bản ghi"));

const resultColumns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Mã hồ sơ", dataIndex: "applicationCode", key: "applicationCode", width: 140 },
  { title: "Số báo danh", dataIndex: "examNumber", key: "examNumber", width: 140, align: "center" },
  { title: "Họ tên", dataIndex: "fullName", key: "fullName", ellipsis: true },
  { title: "Tổng điểm", dataIndex: "totalScore", key: "totalScore", width: 120, align: "center" },
  { title: "Kết quả", dataIndex: "result", key: "result", width: 140, align: "center" },
];

const directColumns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Mã hồ sơ", dataIndex: "applicationCode", key: "applicationCode", width: 140 },
  { title: "Số CCCD", dataIndex: "identityNumber", key: "identityNumber", width: 160, align: "center" },
  { title: "Họ tên", dataIndex: "fullName", key: "fullName", ellipsis: true },
  { title: "Trạng thái", dataIndex: "isDirect", key: "isDirect", width: 140, align: "center" },
];

const resultParams = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  idExam: undefined,
});

const directParams = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  idExam: undefined,
});

const {
  data: resultResponse,
  pending: loading,
  refresh: refreshResults,
} = await adminResult.get({
  params: resultParams,
  key: "admin-result-list",
});

const { data: directResponse, pending: directLoading } = await adminResult.getByRest("direct", {
  params: directParams,
  key: "admin-result-direct-list",
});

const isResultTableLoading = computed(() => loading.value || calculateLoading.value);

const activeResponse = computed(() => {
  if (calculatedItems.value) {
    return calculatedItems.value;
  }

  return resultResponse.value;
});

const resultDataSource = computed(() => {
  if (!activeResponse.value?.success) return [];
  return Array.isArray(activeResponse.value?.data?.items) ? activeResponse.value.data.items : [];
});

const directDataSource = computed(() => {
  if (!directResponse.value?.success) return [];
  return Array.isArray(directResponse.value?.data?.items) ? directResponse.value.data.items : [];
});

watch(
  activeResponse,
  newValue => {
    if (newValue?.success) {
      resultPagination.total = Number(newValue.data?.total || 0);
    }
  },
  { immediate: true },
);

watch(
  () => directResponse.value,
  newValue => {
    if (newValue?.success) {
      directPagination.total = Number(newValue.data?.total || 0);
    }
  },
  { immediate: true },
);

watch(selectedExamId, value => {
  const idExam = value || undefined;
  resultParams.value.idExam = idExam;
  resultParams.value.pageIndex = 1;
  directParams.value.idExam = idExam;
  directParams.value.pageIndex = 1;
  resultPagination.current = 1;
  directPagination.current = 1;
  calculatedItems.value = null;
});

const handleResultTableChange = pag => {
  resultPagination.current = pag.current;
  resultPagination.pageSize = pag.pageSize;
  resultParams.value.pageIndex = pag.current;
  resultParams.value.pageSize = pag.pageSize;
  calculatedItems.value = null;
};

const handleDirectTableChange = pag => {
  directPagination.current = pag.current;
  directPagination.pageSize = pag.pageSize;
  directParams.value.pageIndex = pag.current;
  directParams.value.pageSize = pag.pageSize;
};

const handleSearch = () => {
  const search = (searchText.value || "").trim();
  resultParams.value.search = search;
  resultParams.value.pageIndex = 1;
  directParams.value.search = search;
  directParams.value.pageIndex = 1;
  resultPagination.current = 1;
  directPagination.current = 1;
  calculatedItems.value = null;
};

const resetFilters = () => {
  searchText.value = "";
  selectedExamId.value = null;
  calculatedItems.value = null;
  resultParams.value = {
    pageIndex: 1,
    pageSize: 10,
    search: "",
    idExam: undefined,
  };
  directParams.value = {
    pageIndex: 1,
    pageSize: 10,
    search: "",
    idExam: undefined,
  };
  resultPagination.current = 1;
  resultPagination.pageSize = 10;
  directPagination.current = 1;
  directPagination.pageSize = 10;
};

const calculateResults = async () => {
  if (!adminStore.canEditCurrentPage) {
    message.warning("Bạn không có quyền tính toán kết quả");
    return;
  }

  if (!selectedExamId.value) {
    message.warning("Vui lòng chọn kỳ tuyển sinh");
    return;
  }

  calculateLoading.value = true;

  try {
    const { data, error } = await adminResult.getByRest("caculator", {
      params: {
        pageIndex: resultParams.value.pageIndex,
        pageSize: resultParams.value.pageSize,
        search: resultParams.value.search,
        idExam: Number(selectedExamId.value),
      },
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Tính toán kết quả thất bại");
    }

    calculatedItems.value = data.value;
    message.success(data.value?.message || "Tính toán kết quả thành công");
  } catch (error) {
    message.error(error?.message || "Tính toán kết quả thất bại");
  } finally {
    calculateLoading.value = false;
  }
};

const publishResults = async () => {
  if (!adminStore.canEditCurrentPage) {
    message.warning("Bạn không có quyền công bố dữ liệu");
    return;
  }

  if (!selectedExamId.value) {
    message.warning("Vui lòng chọn kỳ tuyển sinh");
    return;
  }

  publishLoading.value = true;

  try {
    const { data, error } = await adminResult.postByRest("publish", {
      params: {
        idExam: Number(selectedExamId.value),
      },
      key: `admin-result-publish-${selectedExamId.value}-${Date.now()}`,
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Công bố kết quả thất bại");
    }

    message.success(data.value?.message || "Công bố kết quả thành công");
    calculatedItems.value = null;
    await refreshResults();
  } catch (error) {
    message.error(error?.message || "Công bố kết quả thất bại");
  } finally {
    publishLoading.value = false;
  }
};

const getFileNameFromContentDisposition = (contentDisposition, fallbackFileName) => {
  const utf8Match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].trim());
  }

  const fileNameMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
  if (fileNameMatch?.[1]) {
    return fileNameMatch[1].trim();
  }

  return fallbackFileName;
};

const exportResults = async () => {
  if (!selectedExamId.value) {
    message.warning("Vui lòng chọn kỳ tuyển sinh");
    return;
  }

  if (!adminStore.token) {
    message.error("Không tìm thấy phiên đăng nhập quản trị");
    return;
  }

  exportLoading.value = true;

  try {
    const exportUrl = new URL("/api/admin/exam/result/export", config.public.baseURL);
    exportUrl.searchParams.set("idExam", String(selectedExamId.value));

    const response = await fetch(exportUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Xuất dữ liệu kết quả thất bại");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const contentDisposition = response.headers.get("content-disposition") || "";
    const fileName = getFileNameFromContentDisposition(contentDisposition, `ket-qua-ky-tuyen-sinh-${selectedExamId.value}.xlsx`);

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    message.success("Xuất dữ liệu kết quả thành công");
  } catch (error) {
    message.error(error?.message || "Xuất dữ liệu kết quả thất bại");
  } finally {
    exportLoading.value = false;
  }
};

const formatScore = value => {
  if (value === undefined || value === null || value === "") return "-";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : value;
};

const formatResult = value => {
  if (!value) return "Chưa tính";
  return value;
};

const getResultColor = value => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!normalized) return "default";
  if (normalized.includes("đạt") && !normalized.includes("không")) return "success";
  if (normalized.includes("không đạt") || normalized.includes("trượt")) return "error";
  return "processing";
};

const getDirectRowKey = (record, index) => record.applicationCode || record.identityNumber || `${record.fullName || "direct"}-${index}`;

useHead({
  title: "Quản lý kết quả",
});
</script>
