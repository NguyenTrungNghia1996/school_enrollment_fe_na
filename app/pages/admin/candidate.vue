<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 space-y-2">
      <div class="grid min-w-0 grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(220px,300px)] xl:items-center">
        <a-input-search v-model:value="searchText" placeholder="Tìm theo mã hồ sơ, họ tên, CCCD, số báo danh..." enter-button @search="handleSearch" class="w-full min-w-0" />
        <div class="w-full min-w-0">
          <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" />
        </div>
      </div>

      <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:flex xl:justify-end">
        <a-popconfirm v-if="adminStore.canEditCurrentPage" title="Bạn chắc chắn muốn công bố kết quả cho kỳ tuyển sinh đã chọn?" ok-text="Công bố" cancel-text="Hủy" @confirm="publishCandidates">
          <a-button type="primary" class="w-full whitespace-nowrap xl:w-auto" :loading="publishLoading">Công bố</a-button>
        </a-popconfirm>
        <a-button type="primary" ghost class="w-full whitespace-nowrap xl:w-auto" :loading="exportLoading || exportImageLoading" @click="openExportModal">Export</a-button>
        <a-button v-if="adminStore.canEditCurrentPage" type="primary" ghost class="w-full whitespace-nowrap xl:w-auto" @click="openImportModal">Import</a-button>
        <a-button class="w-full whitespace-nowrap xl:w-auto" @click="resetFilters">Đặt lại</a-button>
      </div>
    </div>

    <ClientOnly>
      <div class="overflow-x-auto lg:block">
        <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 1000 }" bordered size="small" row-key="applicationCode" @change="handleTableChange">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ record.stt || (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>

            <template v-else-if="column.key === 'dateOfBirth'">
              {{ formatDate(record.dateOfBirth) }}
            </template>

            <template v-else-if="column.key === 'gender'">
              <a-tag :color="getGenderColor(record.gender)">
                {{ formatGender(record.gender) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'room'">
              <span class="font-medium text-slate-700">{{ formatRoom(record.room) }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </ClientOnly>

    <a-modal v-model:open="exportVisible" title="Xuất danh sách thí sinh" :footer="null" :closable="!exportLoading && !exportImageLoading" :mask-closable="!exportLoading && !exportImageLoading">
      <div class="space-y-3">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="mb-3 font-medium text-slate-900">Kỳ tuyển sinh</div>
          <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inline-label="false" placeholder="Chọn kỳ tuyển sinh" label="" :disabled="exportLoading || exportImageLoading" />
        </div>

        <a-button class="flex h-auto w-full items-center justify-start p-4 text-left" :loading="exportType === 'candidate'" :disabled="exportLoading && exportType !== 'candidate'" @click="exportCandidates">
          <div>
            <div class="font-medium text-slate-900">Xuất danh sách thí sinh</div>
            <div class="mt-1 whitespace-normal text-sm font-normal text-slate-500">Tải danh sách thí sinh của kỳ tuyển sinh đã chọn.</div>
          </div>
        </a-button>

        <a-button class="flex h-auto w-full items-center justify-start p-4 text-left" :loading="exportType === 'signature'" :disabled="exportLoading && exportType !== 'signature'" @click="exportSignatureList">
          <div>
            <div class="font-medium text-slate-900">Xuất danh sách điểm danh</div>
            <div class="mt-1 whitespace-normal text-sm font-normal text-slate-500">Tải danh sách thí sinh có phần ký xác nhận để điểm danh.</div>
          </div>
        </a-button>

        <a-button class="flex h-auto w-full items-center justify-start p-4 text-left" :loading="exportImageLoading" :disabled="exportLoading" @click="exportSignatureImageList">
          <div>
            <div class="font-medium text-slate-900">Xuất danh sách điểm danh hình ảnh</div>
            <div class="mt-1 whitespace-normal text-sm font-normal text-slate-500">Tạo danh sách điểm danh kèm hình ảnh thí sinh.</div>
          </div>
        </a-button>
      </div>
    </a-modal>

    <a-modal v-model:open="importVisible" title="Import danh sách thí sinh" :confirm-loading="importLoading" ok-text="Import" cancel-text="Đóng" @ok="submitImport" @cancel="closeImportModal">
      <div class="space-y-4">
        <div class="hidden rounded-xl border border-slate-200 bg-white p-4">
          <div class="font-medium text-slate-900">Kỳ tuyển sinh</div>
          <div class="mt-3">
            <AdminSelectEnrollment v-model="selectedImportExamId" no-form-item :inlineLabel="false" placeholder="Chọn kỳ tuyển sinh" label="" :disabled="true" />
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
import dayjs from "dayjs";

definePageMeta({
  layout: "admin",
});

const config = useRuntimeConfig();
const { adminCandidate } = useApi();
const adminStore = useAdminStore();
const signatureImageExportStore = useSignatureImageExportStore();

const searchText = ref("");
const selectedExamId = ref(null);
const exportVisible = ref(false);
const exportType = ref(null);
const importVisible = ref(false);
const importInputRef = ref(null);
const importLoading = ref(false);
const exportLoading = ref(false);
const exportImageLoading = ref(false);
const publishLoading = ref(false);
const selectedImportFile = ref(null);
const selectedImportFileName = ref("");
const selectedImportExamId = ref(null);
const importInputKey = ref(0);
const templateFileUrl = "/file/DanhSachSBDVaPhong.xlsx";

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: total => `Tổng ${total} thí sinh`,
});

const columns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Mã hồ sơ", dataIndex: "applicationCode", key: "applicationCode", width: 140 },
  { title: "Họ tên", dataIndex: "fullName", key: "fullName", ellipsis: true },
  { title: "Giới tính", dataIndex: "gender", key: "gender", width: 120, align: "center" },
  { title: "Ngày sinh", dataIndex: "dateOfBirth", key: "dateOfBirth", width: 130, align: "center" },
  { title: "Số CCCD", dataIndex: "identityNumber", key: "identityNumber", width: 150 },
  { title: "Số báo danh", dataIndex: "examNumber", key: "examNumber", width: 140, align: "center" },
  { title: "Phòng thi", dataIndex: "room", key: "room", width: 110, align: "center" },
];

const params = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  idExam: undefined,
});

const {
  data: candidateResponse,
  pending: loading,
  refresh: refreshCandidates,
} = await adminCandidate.get({
  params,
  key: "admin-candidate-list",
});

const dataSource = computed(() => {
  if (!candidateResponse.value?.success) return [];
  return Array.isArray(candidateResponse.value?.data?.items) ? candidateResponse.value.data.items : [];
});

watch(
  () => candidateResponse.value,
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

const refreshCandidateTable = async examId => {
  selectedExamId.value = examId || null;
  params.value.idExam = examId || undefined;
  params.value.pageIndex = 1;
  params.value.pageSize = pagination.pageSize;
  pagination.current = 1;
  await refreshCandidates();
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

const openExportModal = () => {
  exportVisible.value = true;
};

const downloadCandidateExport = async ({ path, type, fallbackFileName, successMessage, errorMessage }) => {
  if (!selectedExamId.value) {
    message.warning("Vui lòng chọn kỳ tuyển sinh");
    return;
  }

  if (!adminStore.token) {
    message.error("Không tìm thấy phiên đăng nhập quản trị");
    return;
  }

  exportLoading.value = true;
  exportType.value = type;

  try {
    const exportUrl = new URL(`/api/admin/examList/${path}`, config.public.baseURL);
    exportUrl.searchParams.set("idExam", String(selectedExamId.value));

    const response = await fetch(exportUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const contentDisposition = response.headers.get("content-disposition") || "";
    const fileName = getFileNameFromContentDisposition(contentDisposition, fallbackFileName);

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    message.success(successMessage);
    exportVisible.value = false;
  } catch (error) {
    message.error(error?.message || errorMessage);
  } finally {
    exportLoading.value = false;
    exportType.value = null;
  }
};

const exportCandidates = () =>
  downloadCandidateExport({
    path: "export",
    type: "candidate",
    fallbackFileName: `danh-sach-thi-sinh-${selectedExamId.value}.xlsx`,
    successMessage: "Xuất dữ liệu danh sách thí sinh thành công",
    errorMessage: "Xuất dữ liệu danh sách thí sinh thất bại",
  });

const exportSignatureList = () =>
  downloadCandidateExport({
    path: "export-signature-list",
    type: "signature",
    fallbackFileName: `danh-sach-diem-danh-${selectedExamId.value}.xlsx`,
    successMessage: "Xuất danh sách điểm danh thành công",
    errorMessage: "Xuất danh sách điểm danh thất bại",
  });

const fetchAdminJson = async (path, params = {}) => {
  const requestUrl = new URL(`/api/admin/examList/${path}`, config.public.baseURL);
  Object.entries(params).forEach(([key, value]) => requestUrl.searchParams.set(key, String(value)));

  const response = await fetch(requestUrl.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${adminStore.token}`,
    },
  });
  const responseData = await response.json().catch(() => null);

  if (!response.ok || responseData?.success === false) {
    throw new Error(responseData?.message || "Không thể xử lý yêu cầu xuất file");
  }

  return responseData;
};

const exportSignatureImageList = async () => {
  if (!selectedExamId.value) {
    message.warning("Vui lòng chọn kỳ tuyển sinh");
    return;
  }

  if (!adminStore.token) {
    message.error("Không tìm thấy phiên đăng nhập quản trị");
    return;
  }

  exportImageLoading.value = true;
  try {
    const responseData = await fetchAdminJson("export-signature-list-image", {
      idExam: selectedExamId.value,
    });
    const trackId = responseData?.data?.trackId;
    if (!trackId) {
      throw new Error("Không nhận được mã theo dõi file");
    }

    signatureImageExportStore.start(trackId);
    exportVisible.value = false;
    message.success(responseData?.message || "Yêu cầu xuất Excel đang được xử lý.");
  } catch (error) {
    message.error(error?.message || "Không thể tạo danh sách điểm danh hình ảnh");
  } finally {
    exportImageLoading.value = false;
  }
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
    const { data, error } = await adminCandidate.upload("import", {
      body: formData,
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Import danh sách thí sinh thất bại");
    }

    message.success(data.value?.message || "Import danh sách thí sinh thành công");
    await refreshCandidateTable(selectedImportExamId.value);
    closeImportModal();
  } catch (error) {
    message.error(`${error?.message || "Import danh sách thí sinh thất bại"}. Vui lòng chọn lại file sau khi sửa.`);
  } finally {
    resetImportFile();
    importLoading.value = false;
  }
};

const publishCandidates = async () => {
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
    const { data, error } = await adminCandidate.postByRest("publish", {
      params: {
        idExam: Number(selectedExamId.value),
      },
      key: `admin-candidate-publish-${selectedExamId.value}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Công bố danh sách thí sinh thất bại");
    }

    message.success(data.value?.message || "Công bố danh sách thí sinh thành công");
    await refreshCandidateTable(selectedExamId.value);
  } catch (error) {
    message.error(error?.message || "Công bố danh sách thí sinh thất bại");
  } finally {
    publishLoading.value = false;
  }
};

const formatDate = value => {
  if (!value) return "-";
  return dayjs(value).format("DD/MM/YYYY");
};

const formatGender = value => {
  if (value === true || String(value).toLowerCase() === "nam") return "Nam";
  if (value === false || String(value).toLowerCase() === "nữ" || String(value).toLowerCase() === "nu") return "Nữ";
  return value || "-";
};

const getGenderColor = value => {
  const normalized = String(formatGender(value)).toLowerCase();
  if (normalized === "nam") return "blue";
  if (normalized === "nữ") return "magenta";
  return "default";
};

const formatRoom = value => {
  if (value === undefined || value === null || value === "") return "-";
  return `Phòng ${value}`;
};

useHead({
  title: "Danh sách thí sinh",
});
</script>
