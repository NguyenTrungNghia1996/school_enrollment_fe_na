<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm theo mã phúc khảo, họ tên, số báo danh, môn học..." enter-button class="w-full md:min-w-0 md:flex-1" @search="handleSearch" />
      <div class="w-full py-2 md:w-1/5 md:py-0">
        <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" />
      </div>
      <a-select v-model:value="selectedStatusId" class="w-full md:w-60" placeholder="Lọc theo trạng thái" :options="statusOptions" />

      <div class="flex w-full flex-initial gap-2 md:w-auto">
        <template v-if="showEditActions">
          <a-popconfirm title="Bạn chắc chắn muốn công bố kết quả phúc khảo cho kỳ tuyển sinh đã chọn?" ok-text="Công bố" cancel-text="Hủy" @confirm="publishReviews">
            <a-button class="shrink-0 whitespace-nowrap" type="primary" :loading="publishLoading">Công bố</a-button>
          </a-popconfirm>
          <a-button class="shrink-0 whitespace-nowrap" type="primary" ghost :loading="exportLoading" :disabled="!selectedExamId || exportLoading" @click="exportReviews">Xuất dữ liệu</a-button>
          <a-button class="shrink-0 whitespace-nowrap" type="primary" ghost @click="openImportModal">Import</a-button>
        </template>
        <a-button class="shrink-0 whitespace-nowrap" @click="resetFilters">Đặt lại</a-button>
      </div>
    </div>

    <ClientOnly>
      <div class="overflow-x-auto lg:block">
        <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" bordered size="small" :row-key="record => record.id" @change="handleTableChange" :scroll="{ x: 1000 }">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>

            <template v-else-if="column.key === 'reviewScore'">
              <span class="font-medium text-slate-700">{{ formatScore(record.reviewScore) }}</span>
            </template>

            <template v-else-if="column.key === 'statusName'">
              <a-tag :color="getReviewStatusColor(record)">
                {{ getReviewStatusLabel(record) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="flex justify-center gap-1">
                <a-tooltip title="Xem chi tiết">
                  <a-button type="link" size="small" @click="openDetail(record)">
                    <template #icon><EyeOutlined /></template>
                  </a-button>
                </a-tooltip>

                <a-tooltip title="Xác nhận thanh toán">
                  <a-button type="link" size="small" class="text-emerald-600" :disabled="!canCompletePayment(record) || !adminStore.canEditCurrentPage || completePaymentLoading" @click="openPaymentConfirm(record)">
                    <template #icon><CreditCardOutlined /></template>
                  </a-button>
                </a-tooltip>
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <div v-if="!loading && !dataSource.length" class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 lg:hidden">Chưa có yêu cầu phúc khảo nào.</div>
    </ClientOnly>

    <a-modal v-model:open="detailVisible" title="Chi tiết phúc khảo" :width="860" :footer="null" @cancel="closeDetail">
      <div v-if="detailLoading" class="py-12 text-center">
        <a-spin size="large" />
      </div>

      <div v-else-if="detailData" class="space-y-6">
        <div class="grid gap-4 md:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Mã phúc khảo</div>
            <div class="mt-2 font-bold text-slate-900">{{ detailData.reviewCode || `#${detailData.id}` }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Mã hồ sơ</div>
            <div class="mt-2 font-bold text-slate-900">{{ detailData.applicationCode || `#${detailData.idApplication}` }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Kỳ tuyển sinh</div>
            <div class="mt-2 font-bold text-slate-900">{{ detailData.examName || `#${detailData.idExam || "-"}` }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</div>
            <div class="mt-2">
              <a-tag :color="getReviewStatusColor(detailData)">{{ getReviewStatusLabel(detailData) }}</a-tag>
            </div>
          </div>
        </div>

        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="Họ tên">{{ detailData.fullName || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Môn phúc khảo">{{ detailData.subjectName || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Lý do phúc khảo" :span="2">{{ detailData.reason || "-" }}</a-descriptions-item>
        </a-descriptions>

        <div class="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <a-button @click="closeDetail">Đóng</a-button>
          <a-button type="primary" :loading="completePaymentLoading" :disabled="!canCompletePayment(detailData) || !adminStore.canEditCurrentPage" @click="openPaymentConfirm(detailData, true)">Xác nhận thanh toán</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:open="paymentConfirmVisible" :width="500" :footer="null" centered @cancel="closePaymentConfirm">
      <div class="space-y-4 pt-2 text-center">
        <div class="space-y-2">
          <div class="text-xl font-bold text-slate-900">
            {{ getPaymentConfirmTitle(selectedRecord) }}
          </div>
          <div class="text-sm leading-6 text-slate-600">
            Bạn có chắc chắn xác nhận thanh toán đơn đề nghị này không?
            <br />
            Sau khi xác nhận, đơn đề nghị sẽ không thể khôi phục lại trạng thái trước
          </div>
        </div>

        <div class="flex justify-center gap-3 pt-2">
          <a-button type="primary" :loading="completePaymentLoading" @click="submitCompletePayment">Đồng ý</a-button>
          <a-button danger ghost @click="closePaymentConfirm">Hủy</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:open="importVisible" title="Import dữ liệu phúc khảo" :confirm-loading="importLoading" ok-text="Import" cancel-text="Đóng" @ok="submitImport" @cancel="closeImportModal">
      <div class="space-y-4">
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
import { APPLICATION_REVIEW_STATUS, APPLICATION_REVIEW_STATUS_LABELS, getApplicationReviewStatusColor, getApplicationReviewStatusLabel, isPendingConfirmationApplicationReviewStatus } from "~/composables/useApplicationReviewStatus";

definePageMeta({
  layout: "admin",
});

const config = useRuntimeConfig();
const adminStore = useAdminStore();
const message = useSafeMessage();
const { adminApplicationReview, adminEnrollment } = useApi();

const showEditActions = computed(() => adminStore.canEditCurrentPage);
const searchText = ref("");
const selectedExamId = ref(null);
const selectedStatusId = ref(0);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref(null);
const selectedRecord = ref(null);
const publishLoading = ref(false);
const exportLoading = ref(false);
const completePaymentLoading = ref(false);
const paymentConfirmVisible = ref(false);
const fromDetailModal = ref(false);
const importVisible = ref(false);
const importInputRef = ref(null);
const importLoading = ref(false);
const selectedImportFile = ref(null);
const selectedImportFileName = ref("");
const selectedImportExamId = ref(null);
const importInputKey = ref(0);
const examNameCache = new Map();

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: total => `Tổng ${total} yêu cầu`,
});

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã phúc khảo", dataIndex: "reviewCode", key: "reviewCode", width: 100 },
  { title: "Số báo danh", dataIndex: "examNumber", key: "examNumber", width: 100, align: "center" },
  { title: "Họ tên", dataIndex: "fullName", key: "fullName", width: 100, ellipsis: true },
  { title: "Môn phúc khảo", dataIndex: "subjectName", key: "subjectName", width: 100, ellipsis: true },
  // { title: "Lý do", dataIndex: "reason", key: "reason", ellipsis: true },
  { title: "Điểm thi", dataIndex: "score", key: "score", width: 100, align: "center" },
  { title: "Điểm phúc khảo", dataIndex: "reviewScore", key: "reviewScore", width: 100, align: "center" },
  { title: "Trạng thái", dataIndex: "statusName", key: "statusName", width: 100, align: "center" },
  { title: "Thao tác", key: "action", width: 120, align: "center", fixed: "right" },
];

const statusOptions = computed(() => [
  { label: "Tất cả trạng thái", value: 0 },
  ...Object.entries(APPLICATION_REVIEW_STATUS_LABELS)
    .filter(([value]) => Number(value) !== APPLICATION_REVIEW_STATUS.DRAFT)
    .map(([value, label]) => ({
      label,
      value: Number(value),
    })),
]);

const params = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  idExam: 0,
  idStatus: 0,
});

const {
  data: reviewResponse,
  pending: loading,
  refresh: refreshReviews,
} = await adminApplicationReview.get({
  params,
  key: "admin-application-review-list",
});

const dataSource = computed(() => {
  if (!reviewResponse.value?.success) return [];
  return Array.isArray(reviewResponse.value?.data?.items) ? reviewResponse.value.data.items : [];
});

watch(
  () => reviewResponse.value,
  newValue => {
    if (newValue?.success) {
      pagination.total = Number(newValue.data?.total || 0);
    }
  },
  { immediate: true },
);

watch(selectedExamId, value => {
  params.value.idExam = value ? Number(value) : 0;
  params.value.pageIndex = 1;
  pagination.current = 1;
});

watch(selectedStatusId, value => {
  params.value.idStatus = value ? Number(value) : 0;
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
  selectedStatusId.value = 0;
  params.value = {
    pageIndex: 1,
    pageSize: 10,
    search: "",
    idExam: 0,
    idStatus: 0,
  };
  pagination.current = 1;
  pagination.pageSize = 10;
};

const refreshReviewTable = async examId => {
  selectedExamId.value = examId || null;
  params.value.idExam = examId ? Number(examId) : 0;
  params.value.pageIndex = 1;
  params.value.pageSize = pagination.pageSize;
  pagination.current = 1;
  await refreshReviews();
};

const normalizeReviewDetail = (detail, fallbackRecord = null) => {
  if (!detail || typeof detail !== "object") return null;

  return {
    ...fallbackRecord,
    ...detail,
    fullName: detail.fullName || fallbackRecord?.fullName || null,
    statusName: detail.statusName || fallbackRecord?.statusName || null,
    examNumber: detail.examNumber || fallbackRecord?.examNumber || null,
    examName: detail.examName || fallbackRecord?.examName || null,
    applicationCode: detail.applicationCode || fallbackRecord?.applicationCode || null,
    subjectName: detail.subjectName || fallbackRecord?.subjectName || null,
    reviewScore: detail.reviewScore ?? fallbackRecord?.reviewScore ?? null,
  };
};

const fetchExamName = async idExam => {
  const normalizedId = Number(idExam);
  if (!Number.isFinite(normalizedId) || normalizedId <= 0) return null;

  if (examNameCache.has(normalizedId)) {
    return examNameCache.get(normalizedId);
  }

  const { data, error } = await adminEnrollment.getByRest("detail", {
    params: { id: normalizedId },
    key: `admin-review-exam-detail-${normalizedId}-${Date.now()}`,
  });

  if (error.value || data.value?.success === false) return null;

  const examName = data.value?.data?.examName || null;
  if (examName) {
    examNameCache.set(normalizedId, examName);
  }

  return examName;
};

const resolveReviewDetail = async (detail, fallbackRecord = null) => {
  const normalizedDetail = normalizeReviewDetail(detail, fallbackRecord);
  if (!normalizedDetail || normalizedDetail.examName) return normalizedDetail;

  const examName = await fetchExamName(normalizedDetail.idExam);
  return {
    ...normalizedDetail,
    examName: examName || normalizedDetail.examName,
  };
};

const openDetail = async recordOrId => {
  const record = typeof recordOrId === "object" && recordOrId !== null ? recordOrId : null;
  const id = record?.id || recordOrId;

  if (!id) {
    message.error("Không xác định được yêu cầu phúc khảo");
    return;
  }

  selectedRecord.value = record;
  detailVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;

  try {
    const { data, error } = await adminApplicationReview.getByRest("detail", {
      params: { id },
      key: `admin-application-review-detail-${id}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể tải thông tin chi tiết");
    }

    detailData.value = await resolveReviewDetail(data.value.data, selectedRecord.value);
  } catch (error) {
    detailVisible.value = false;
    message.error(error?.message || "Không thể tải thông tin chi tiết");
  } finally {
    detailLoading.value = false;
  }
};

const closeDetail = () => {
  detailVisible.value = false;
  detailLoading.value = false;
  detailData.value = null;
  selectedRecord.value = null;
};

const reloadDetailIfOpen = async id => {
  if (detailVisible.value && detailData.value?.id === id) {
    await openDetail(id);
  }
};

const publishReviews = async () => {
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
    const { data, error } = await adminApplicationReview.postByRest("publish", {
      params: {
        idExam: Number(selectedExamId.value),
      },
      key: `admin-application-review-publish-${selectedExamId.value}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Công bố phúc khảo thất bại");
    }

    message.success(data.value?.message || "Công bố phúc khảo thành công");
    await refreshReviews();
  } catch (error) {
    message.error(error?.message || "Công bố phúc khảo thất bại");
  } finally {
    publishLoading.value = false;
  }
};

const completePayment = async (record, keepModal = false) => {
  if (!adminStore.canEditCurrentPage) {
    message.warning("Bạn không có quyền xác nhận thanh toán");
    return;
  }

  const reviewId = Number(record?.id);
  if (!Number.isFinite(reviewId) || reviewId <= 0) {
    message.error("Không xác định được yêu cầu phúc khảo");
    return;
  }

  completePaymentLoading.value = true;

  try {
    const { data, error } = await adminApplicationReview.putByRest("completePayment", {
      params: {
        idApplicationReview: reviewId,
      },
      key: `admin-application-review-complete-payment-${reviewId}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Xác nhận thanh toán thất bại");
    }

    message.success(data.value?.message || "Xác nhận thanh toán thành công");
    await refreshReviews();
    if (keepModal) {
      await reloadDetailIfOpen(reviewId);
    }
  } catch (error) {
    message.error(error?.message || "Xác nhận thanh toán thất bại");
  } finally {
    completePaymentLoading.value = false;
  }
};

const getPaymentConfirmTitle = record => {
  const code = record?.reviewCode || `#${record?.id || ""}`;
  return `Xác nhận thanh toán đơn ${code}`;
};

const openPaymentConfirm = (record, fromDetail = false) => {
  selectedRecord.value = record;
  fromDetailModal.value = fromDetail;
  paymentConfirmVisible.value = true;
};

const closePaymentConfirm = () => {
  paymentConfirmVisible.value = false;
  selectedRecord.value = null;
  fromDetailModal.value = false;
};

const submitCompletePayment = async () => {
  if (!selectedRecord.value) return;
  await completePayment(selectedRecord.value, fromDetailModal.value);
  closePaymentConfirm();
};

const exportReviews = async () => {
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
    const exportUrl = new URL("/api/admin/application/review/export", config.public.baseURL);
    exportUrl.searchParams.set("idExam", String(selectedExamId.value));

    const response = await fetch(exportUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Xuất dữ liệu phúc khảo thất bại");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const contentDisposition = response.headers.get("content-disposition") || "";
    const utf8Match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    const fileNameMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
    const fileName = utf8Match?.[1] ? decodeURIComponent(utf8Match[1].trim()) : fileNameMatch?.[1]?.trim() || `phuc-khao-ky-tuyen-sinh-${selectedExamId.value}.xlsx`;

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    message.success("Xuất dữ liệu phúc khảo thành công");
  } catch (error) {
    message.error(error?.message || "Xuất dữ liệu phúc khảo thất bại");
  } finally {
    exportLoading.value = false;
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

    const { data, error } = await adminApplicationReview.upload("import", {
      body: formData,
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Import dữ liệu phúc khảo thất bại");
    }

    message.success(data.value?.message || "Import dữ liệu phúc khảo thành công");
    await refreshReviewTable(selectedImportExamId.value);
    closeImportModal();
  } catch (error) {
    message.error(`${error?.message || "Import dữ liệu phúc khảo thất bại"}. Vui lòng chọn lại file sau khi sửa.`);
  } finally {
    resetImportFile();
    importLoading.value = false;
  }
};

const canCompletePayment = record => isPendingConfirmationApplicationReviewStatus(record);
const getReviewStatusColor = record => getApplicationReviewStatusColor(record);
const getReviewStatusLabel = record => getApplicationReviewStatusLabel(record);

const formatScore = value => {
  if (value === undefined || value === null || value === "") return "-";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : value;
};

useHead({
  title: "Quản lý phúc khảo",
});
</script>
