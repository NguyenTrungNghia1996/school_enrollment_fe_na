<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm theo mã hồ sơ, số báo danh, họ tên..." enter-button @search="handleSearch" class="w-full" />
      <div class="w-full py-2 md:w-1/3 md:py-0">
        <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" />
      </div>
      <div class="flex w-full flex-initial gap-2 md:w-auto">
        <a-button v-if="adminStore.canEditCurrentPage" type="primary" ghost :loading="calculateLoading" :disabled="!selectedExamId || calculateLoading" @click="calculateResults">Tính toán kết quả</a-button>
        <a-popconfirm v-if="adminStore.canEditCurrentPage" title="Bạn chắc chắn muốn công bố kết quả cho kỳ tuyển sinh đã chọn?" ok-text="Công bố" cancel-text="Hủy" @confirm="publishResults">
          <a-button type="primary" :loading="publishLoading">Công bố kết quả</a-button>
        </a-popconfirm>
        <a-button @click="resetFilters" class="flex-1 md:flex-none">Đặt lại</a-button>
      </div>
    </div>

    <ClientOnly>
      <div class="overflow-x-auto lg:block">
        <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="isTableLoading" :scroll="{ x: 1100 }" bordered size="small" row-key="applicationCode" @change="handleTableChange">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ record.stt || (pagination.current - 1) * pagination.pageSize + index + 1 }}
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
    </ClientOnly>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

const { adminResult } = useApi();
const adminStore = useAdminStore();

const searchText = ref("");
const selectedExamId = ref(null);
const calculateLoading = ref(false);
const publishLoading = ref(false);
const calculatedItems = ref(null);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: total => `Tổng ${total} kết quả`,
});

const columns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Mã hồ sơ", dataIndex: "applicationCode", key: "applicationCode", width: 140 },
  { title: "Số báo danh", dataIndex: "examNumber", key: "examNumber", width: 140, align: "center" },
  { title: "Họ tên", dataIndex: "fullName", key: "fullName", ellipsis: true },
  { title: "Tổng điểm", dataIndex: "totalScore", key: "totalScore", width: 120, align: "center" },
  { title: "Kết quả", dataIndex: "result", key: "result", width: 140, align: "center" },
];

const params = ref({
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
  params,
  key: "admin-result-list",
});

const isTableLoading = computed(() => loading.value || calculateLoading.value);

const activeResponse = computed(() => {
  if (calculatedItems.value) {
    return calculatedItems.value;
  }

  return resultResponse.value;
});

const dataSource = computed(() => {
  if (!activeResponse.value?.success) return [];
  return Array.isArray(activeResponse.value?.data?.items) ? activeResponse.value.data.items : [];
});

watch(
  activeResponse,
  newValue => {
    if (newValue?.success) {
      pagination.total = Number(newValue.data?.total || 0);
    }
  },
  { immediate: true },
);

watch(selectedExamId, value => {
  params.value.idExam = value || undefined;
  params.value.pageIndex = 1;
  pagination.current = 1;
  calculatedItems.value = null;
});

const handleTableChange = pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  params.value.pageIndex = pag.current;
  params.value.pageSize = pag.pageSize;
  calculatedItems.value = null;
};

const handleSearch = () => {
  params.value.search = (searchText.value || "").trim();
  params.value.pageIndex = 1;
  pagination.current = 1;
  calculatedItems.value = null;
};

const resetFilters = () => {
  searchText.value = "";
  selectedExamId.value = null;
  calculatedItems.value = null;
  params.value = {
    pageIndex: 1,
    pageSize: 10,
    search: "",
    idExam: undefined,
  };
  pagination.current = 1;
  pagination.pageSize = 10;
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
    const { data, error } = await adminResult.getByRest("calculate", {
      params: {
        pageIndex: params.value.pageIndex,
        pageSize: params.value.pageSize,
        search: params.value.search,
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

useHead({
  title: "Quản lý kết quả",
});
</script>
