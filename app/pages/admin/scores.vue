<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm theo số báo danh, họ tên..." enter-button @search="handleSearch" class="w-full" />
      <div class="w-full py-2 md:w-1/3 md:py-0">
        <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" />
      </div>
      <div class="flex w-full flex-initial gap-2 md:w-auto">
        <a-popconfirm v-if="adminStore.canEditCurrentPage" title="Bạn chắc chắn muốn công bố điểm thi cho kỳ tuyển sinh đã chọn?" ok-text="Công bố" cancel-text="Hủy" @confirm="publishScores">
          <a-button type="primary" :loading="publishLoading">Công bố</a-button>
        </a-popconfirm>
        <a-button v-if="adminStore.canEditCurrentPage" type="primary" ghost @click="openImportModal">Import</a-button>
        <a-button @click="resetFilters" class="flex-1 md:flex-none">Đặt lại</a-button>
      </div>
    </div>

    <ClientOnly>
      <div class="overflow-x-auto lg:block">
        <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 1000 }" bordered size="small" row-key="_rowKey" @change="handleTableChange">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ record.stt || (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>

            <template v-else-if="column.key === 'mathScore' || column.key === 'literatureScore' || column.key === 'englishScore'">
              <span class="font-medium text-slate-700">{{ formatScore(record[column.dataIndex]) }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </ClientOnly>

    <a-modal v-model:open="importVisible" title="Import điểm thi" :confirm-loading="importLoading" ok-text="Import" cancel-text="Đóng" @ok="submitImport" @cancel="closeImportModal">
      <div class="space-y-4">
        <!-- <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="font-medium text-slate-900">File mẫu import</div>
              <p class="mt-1 text-sm text-slate-500">Tải file mẫu và điền dữ liệu điểm thi đúng định dạng trước khi import.</p>
            </div>
            <a :href="templateFileUrl" download="DanhSachDiemThi.xlsx">
              <a-button>Tải file mẫu</a-button>
            </a>
          </div>
        </div> -->
        // Ẩn phần chọn kỳ tuyển sinh trong modal import vì đã có ở ngoài, và tự động đồng bộ giá trị khi mở modal
        <div class="hidden rounded-xl border border-slate-200 bg-white p-4">
          <div class="font-medium text-slate-900">Kỳ tuyển sinh</div>
          <div class="mt-3">
            <AdminSelectEnrollment v-model="selectedImportExamId" no-form-item :inlineLabel="false" placeholder="Chọn kỳ tuyển sinh" label="" />
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="font-medium text-slate-900">Chọn file import</div>
          <p class="mt-1 text-sm text-slate-500">Chấp nhận file `.xlsx` hoặc `.xls`.</p>

          <input :key="importInputKey" ref="importInputRef" type="file" class="mt-4 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white" accept=".xlsx,.xls" @click="prepareImportFileInput" @change="handleImportFileChange" />

          <div v-if="selectedImportFileName" class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Đã chọn: {{ selectedImportFileName }}</div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

const { adminScore } = useApi();
const adminStore = useAdminStore();

const searchText = ref("");
const selectedExamId = ref(null);
const importVisible = ref(false);
const importInputRef = ref(null);
const importLoading = ref(false);
const publishLoading = ref(false);
const selectedImportFile = ref(null);
const selectedImportFileName = ref("");
const selectedImportExamId = ref(null);
const importInputKey = ref(0);
const templateFileUrl = "/file/DanhSachDiemThi.xlsx";

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: total => `Tổng ${total} điểm thi`,
});

const columns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Số báo danh", dataIndex: "examNumber", key: "examNumber", width: 140, align: "center" },
  { title: "Họ tên", dataIndex: "fullName", key: "fullName", ellipsis: true },
  { title: "Điểm Toán", dataIndex: "mathScore", key: "mathScore", width: 130, align: "center" },
  { title: "Điểm Ngữ văn", dataIndex: "literatureScore", key: "literatureScore", width: 140, align: "center" },
  { title: "Điểm Tiếng Anh", dataIndex: "englishScore", key: "englishScore", width: 150, align: "center" },
];

const params = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  idExam: undefined,
});

const {
  data: scoreResponse,
  pending: loading,
  refresh: refreshScores,
} = await adminScore.get({
  params,
  key: "admin-score-list",
});

const dataSource = computed(() => {
  if (!scoreResponse.value?.success) return [];

  const items = Array.isArray(scoreResponse.value?.data?.items) ? scoreResponse.value.data.items : [];
  return items.map((item, index) => ({
    ...item,
    _rowKey: getScoreRowKey(item, index),
  }));
});

const getScoreRowKey = (item, index) => {
  const id = item?.idExamScore ?? item?.id ?? item?.idApplication ?? item?.applicationCode;
  if (id !== undefined && id !== null && id !== "") return `score-${id}`;

  const examNumber = item?.examNumber ?? "empty";
  return `score-${params.value.pageIndex}-${params.value.pageSize}-${examNumber}-${index}`;
};

watch(
  () => scoreResponse.value,
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
});

const handleTableChange = pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  params.value.pageIndex = pag.current;
  params.value.pageSize = pag.pageSize;
};

const handleSearch = () => {
  params.value.search = (searchText.value || "").trim();
  params.value.pageIndex = 1;
  pagination.current = 1;
};

const resetFilters = () => {
  searchText.value = "";
  selectedExamId.value = null;
  params.value = {
    pageIndex: 1,
    pageSize: 10,
    search: "",
    idExam: undefined,
  };
  pagination.current = 1;
  pagination.pageSize = 10;
};

const refreshScoreTable = async examId => {
  selectedExamId.value = examId || null;
  params.value.idExam = examId || undefined;
  params.value.pageIndex = 1;
  params.value.pageSize = pagination.pageSize;
  pagination.current = 1;
  await refreshScores();
};

const openImportModal = () => {
  if (!adminStore.canEditCurrentPage) {
    message.warning("Bạn không có quyền import dữ liệu");
    return;
  }
  selectedImportExamId.value = selectedExamId.value || null;
  importVisible.value = true;
};

const closeImportModal = () => {
  importVisible.value = false;
  selectedImportExamId.value = null;
  resetImportFile();
};

const resetImportFile = () => {
  selectedImportFile.value = null;
  selectedImportFileName.value = "";
  importInputKey.value += 1;
  if (importInputRef.value) {
    importInputRef.value.value = "";
  }
};

const prepareImportFileInput = event => {
  if (importLoading.value) {
    event?.preventDefault();
    return;
  }
  selectedImportFile.value = null;
  selectedImportFileName.value = "";
  if (importInputRef.value) {
    importInputRef.value.value = "";
  }
};

const handleImportFileChange = event => {
  if (importLoading.value) return;
  const file = event?.target?.files?.[0];
  if (!file) return;

  selectedImportFile.value = file;
  selectedImportFileName.value = file.name;
};

const submitImport = async () => {
  if (!adminStore.canEditCurrentPage) {
    message.warning("Bạn không có quyền import dữ liệu");
    return;
  }

  if (!selectedImportFile.value) {
    message.warning("Vui lòng chọn file import");
    return;
  }

  if (!selectedImportExamId.value) {
    message.warning("Vui lòng chọn kỳ tuyển sinh");
    return;
  }

  importLoading.value = true;

  try {
    const formData = new FormData();
    formData.append("file", selectedImportFile.value);
    formData.append("idExam", String(selectedImportExamId.value));

    // const { data, error } = await adminScore.import({
    //   body: formData,
    // });
    const { data, error } = await adminScore.upload("import", {
      body: formData,
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Import điểm thi thất bại");
    }

    message.success(data.value?.message || "Import điểm thi thành công");
    await refreshScoreTable(selectedImportExamId.value);
    closeImportModal();
  } catch (error) {
    message.error(`${error?.message || "Import điểm thi thất bại"}. Vui lòng chọn lại file sau khi sửa.`);
  } finally {
    resetImportFile();
    importLoading.value = false;
  }
};

const publishScores = async () => {
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
    // const { data, error } = await adminScore.publish({
    //   params: {
    //     idExam: Number(selectedExamId.value),
    //   },
    // });
    const { data, error } = await adminScore.postByRest("publish", {
      params: {
        idExam: Number(selectedExamId.value),
      },
      key: `admin-score-publish-${selectedExamId.value}-${Date.now()}`,
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Công bố điểm thi thất bại");
    }

    message.success(data.value?.message || "Công bố điểm thi thành công");
    await refreshScores();
  } catch (error) {
    message.error(error?.message || "Công bố điểm thi thất bại");
  } finally {
    publishLoading.value = false;
  }
};

const formatScore = value => {
  if (value === undefined || value === null || value === "") return "-";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : value;
};

useHead({
  title: "Điểm thi",
});
</script>
