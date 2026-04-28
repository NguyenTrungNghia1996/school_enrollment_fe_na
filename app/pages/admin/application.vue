<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm theo mã hồ sơ, họ tên, CCCD..." enter-button @search="handleSearch" class="w-full" />
      <div class="w-1/3 py-2 md:py-0">
        <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" />
      </div>
      <div class="flex w-full gap-2 md:w-auto">
        <a-button @click="resetFilters" class="flex-1 md:flex-none">Đặt lại</a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1200' }" bordered size="small" @change="handleTableChange">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>

          <template v-if="column.key === 'dateOfBirth'">
            {{ formatDate(record.dateOfBirth) }}
          </template>

          <template v-if="column.key === 'idExam'">
            <span class="font-medium text-slate-700">#{{ record.idExam }}</span>
          </template>

          <template v-if="column.key === 'statusName'">
            <a-tag :color="getStatusColor(record)">
              {{ record.statusName || "Không xác định" }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-1">
              <a-tooltip title="Xem chi tiết">
                <a-button type="link" size="small" @click="openDetail(record)">
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>

              <a-tooltip title="Duyệt hồ sơ">
                <a-button type="link" size="small" class="text-emerald-600" :disabled="isActionDisabled(record) || !adminStore.currentPermission" @click="approveItem(record)">
                  <template #icon><CheckOutlined /></template>
                </a-button>
              </a-tooltip>

              <a-tooltip title="Từ chối hồ sơ">
                <a-button type="link" size="small" danger :disabled="isActionDisabled(record) || !adminStore.currentPermission" @click="openReject(record)">
                  <template #icon><CloseOutlined /></template>
                </a-button>
              </a-tooltip>

              <a-popconfirm title="Bạn chắc chắn muốn xóa hồ sơ này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-button type="link" size="small" danger :disabled="!adminStore.currentPermission">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="detailVisible" title="Chi tiết hồ sơ" :width="1000" :footer="null" @cancel="closeDetail">
      <div v-if="detailLoading" class="py-12 text-center">
        <a-spin size="large" />
      </div>

      <div v-else-if="detailData" class="space-y-6">
        <div class="grid gap-4 md:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Mã hồ sơ</div>
            <div class="mt-2 font-bold text-slate-900">{{ detailData.applicationCode || `#${detailData.id}` }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Kỳ tuyển sinh</div>
            <div class="mt-2 font-bold text-slate-900">{{ detailData.examName || `#${detailData.idExam}` }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</div>
            <div class="mt-2">
              <a-tag :color="getStatusColor(detailData)">{{ detailData.statusName || `#${detailData.idStatus}` }}</a-tag>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">QR</div>
            <div class="mt-2 break-all text-sm text-slate-700">{{ detailData.urlQr || "-" }}</div>
          </div>
        </div>

        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="Họ tên">{{ detailData.fullName || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Ngày sinh">{{ formatDate(detailData.dateOfBirth) }}</a-descriptions-item>
          <a-descriptions-item label="Số CCCD">{{ detailData.identityNumber || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Ngày cấp CCCD">{{ formatDate(detailData.identityIssueDate) }}</a-descriptions-item>
          <a-descriptions-item label="Nơi cấp CCCD">{{ detailData.identityIssuePlace || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Giới tính">{{ formatGender(detailData.gender) }}</a-descriptions-item>
          <a-descriptions-item label="Dân tộc">{{ detailData.ethnicityName || `#${detailData.idEthnicity || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Nơi sinh">{{ detailData.provinceName || `#${detailData.idProvince || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Tỉnh thường trú">{{ detailData.permanentProvinceName || `#${detailData.idPermanentProvince || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Phường/xã thường trú">{{ detailData.permanentCommuneName || `#${detailData.idCommune || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Địa chỉ thường trú" :span="2">{{ detailData.permanentAddress || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Số điện thoại">{{ detailData.phoneNumber || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Tỉnh hiện tại">{{ detailData.currentProvinceName || `#${detailData.idCurrentProvince || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Phường/xã hiện tại">{{ detailData.currentCommuneName || `#${detailData.idCurrentCommune || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Địa chỉ hiện tại" :span="2">{{ detailData.currentAddress || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Ghi chú" :span="2">{{ detailData.note || "-" }}</a-descriptions-item>
        </a-descriptions>

        <div>
          <h3 class="mb-3 text-base font-semibold text-slate-900">Hồ sơ đính kèm</h3>

          <div v-if="normalizedDocuments.length" class="space-y-4">
            <div v-for="document in normalizedDocuments" :key="document.key" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div class="font-medium text-slate-900">Hồ sơ #{{ document.idExamDocument }}</div>
                <div class="text-xs text-slate-500">{{ document.links.length }} file</div>
              </div>

              <div class="space-y-2 rounded-lg bg-white p-3">
                <div v-for="(link, index) in document.links" :key="`${document.key}-${index}`" class="break-all text-sm text-slate-700">
                  <BaseImagePreviewLink v-if="getFileType(link) === 'image'" :src="link" />
                  <BasePdfPreviewLink v-else-if="getFileType(link) === 'pdf'" :src="link" />
                  <a v-else :href="link" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">{{ getDisplayName(link) }}</a>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">Hồ sơ này chưa có tài liệu đính kèm.</div>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <a-button @click="closeDetail">Đóng</a-button>
          <a-button type="primary" :disabled="!detailData || isActionDisabled(detailData) || !adminStore.currentPermission" @click="approveItem(detailData, true)">Duyệt hồ sơ</a-button>
          <a-button danger :disabled="!detailData || isActionDisabled(detailData) || !adminStore.currentPermission" @click="openReject(detailData, true)">Từ chối</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:open="rejectVisible" title="Từ chối hồ sơ" :confirm-loading="rejectLoading" @ok="submitReject" @cancel="closeReject">
      <a-form layout="vertical">
        <a-form-item label="Lý do từ chối" required>
          <a-textarea v-model:value="rejectNote" :rows="4" placeholder="Nhập ghi chú từ chối hồ sơ" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

definePageMeta({
  layout: "admin",
});

const adminStore = useAdminStore();
const { adminApplication } = useApi();

const searchText = ref("");
const selectedExamId = ref(null);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref(null);
const rejectVisible = ref(false);
const rejectLoading = ref(false);
const rejectNote = ref("");
const selectedRecord = ref(null);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã hồ sơ", dataIndex: "applicationCode", key: "applicationCode", width: 140 },
  { title: "Kỳ tuyển sinh", dataIndex: "idExam", key: "idExam", width: 120, align: "center" },
  { title: "Họ tên", dataIndex: "fullname", key: "fullname", ellipsis: true },
  { title: "Ngày sinh", dataIndex: "dateOfBirth", key: "dateOfBirth", width: 130 },
  { title: "Số CCCD", dataIndex: "identityNumber", key: "identityNumber", width: 150 },
  { title: "Trạng thái", dataIndex: "statusName", key: "statusName", width: 130, align: "center" },
  { title: "Thao tác", key: "action", width: 150, align: "center", fixed: "right" },
];

const params = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  idExam: undefined,
});

const {
  data: applicationResponse,
  refresh: refreshApplications,
  pending: loading,
} = await adminApplication.get({
  params,
  key: "admin-application-list",
});

const dataSource = computed(() => {
  if (!applicationResponse.value?.success) return [];
  return Array.isArray(applicationResponse.value?.data?.items) ? applicationResponse.value.data.items : [];
});

const normalizeApplicationDetail = (detail, fallbackRecord = null) => {
  if (!detail || typeof detail !== "object") {
    return null;
  }

  return {
    ...detail,
    applicationCode: detail.applicationCode || fallbackRecord?.applicationCode || null,
    statusName: detail.statusName || fallbackRecord?.statusName || null,
    fullName: detail.fullName || detail.fullname || fallbackRecord?.fullName || fallbackRecord?.fullname || null,
    examName: detail.examName || fallbackRecord?.examName || null,
    documents: Array.isArray(detail.documents) ? detail.documents : [],
  };
};

const normalizedDocuments = computed(() => {
  const documents = Array.isArray(detailData.value?.documents) ? detailData.value.documents : [];

  return documents
    .map((document, index) => {
      if (typeof document === "string") {
        return {
          key: `document-${index}`,
          idExamDocument: index + 1,
          links: splitDocumentLinks(document),
        };
      }

      return {
        key: `${document?.idExamDocument || document?.id || "document"}-${index}`,
        idExamDocument: document?.idExamDocument || document?.id || index + 1,
        links: splitDocumentLinks(document?.url || document?.fileUrl || document?.link || document?.path),
      };
    })
    .filter(document => document.links.length);
});

watch(
  () => applicationResponse.value,
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

const formatDate = value => {
  if (!value) return "-";
  return dayjs(value).format("DD/MM/YYYY");
};

const formatGender = value => {
  if (value === true) return "Nam";
  if (value === false) return "Nữ";
  return "-";
};

const getStatusColor = record => {
  const normalized = String(record?.statusName || "")
    .trim()
    .toLowerCase();

  if (normalized.includes("duyệt") || normalized.includes("đạt") || normalized.includes("thành công")) {
    return "success";
  }

  if (normalized.includes("từ chối") || normalized.includes("hủy")) {
    return "error";
  }

  if (normalized.includes("nháp") || normalized.includes("chờ")) {
    return "processing";
  }

  return "default";
};

const isActionDisabled = record => {
  return Number(record?.idStatus) !== 2;
};

const getFileName = link => {
  if (!link) return "";

  try {
    const { pathname } = new URL(link);
    const segments = pathname.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) || link);
  } catch {
    const cleanUrl = link.split("?")[0].split("#")[0];
    const segments = cleanUrl.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) || link);
  }
};

const getDisplayName = link => {
  return getFileName(link).replace(/^[0-9a-f-]+-/i, "");
};

const getFileType = link => {
  const fileName = getFileName(link).toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(fileName)) {
    return "image";
  }

  if (fileName.endsWith(".pdf")) {
    return "pdf";
  }

  return "unsupported";
};

const splitDocumentLinks = value => {
  if (!value) return [];
  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
};

const openDetail = async recordOrId => {
  const record = typeof recordOrId === "object" && recordOrId !== null ? recordOrId : null;
  const id = record?.id || recordOrId;

  if (record) {
    selectedRecord.value = record;
  }

  detailVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;

  try {
    const { data, error } = await adminApplication.getById({
      params: { id },
    });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể tải thông tin chi tiết");
    }

    detailData.value = normalizeApplicationDetail(data.value.data, selectedRecord.value);
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

const approveItem = async (record, keepModal = false) => {
  try {
    const { data, error } = await adminApplication.approve({
      params: { id: record.id },
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Duyệt hồ sơ thất bại");
    }

    message.success(data.value?.message || "Duyệt hồ sơ thành công");
    if (!keepModal) {
      selectedRecord.value = null;
    }
    await refreshApplications();
    if (detailVisible.value && detailData.value?.id === record.id) {
      await openDetail(record.id);
    }
  } catch (error) {
    message.error(error?.message || "Duyệt hồ sơ thất bại");
  }
};

const openReject = (record, fromDetail = false) => {
  selectedRecord.value = record;
  rejectNote.value = "";
  rejectVisible.value = true;

  if (fromDetail && detailData.value) {
    selectedRecord.value = detailData.value;
  }
};

const closeReject = () => {
  rejectVisible.value = false;
  rejectLoading.value = false;
  rejectNote.value = "";
  selectedRecord.value = null;
};

const submitReject = async () => {
  if (!selectedRecord.value?.id) {
    message.error("Không xác định được hồ sơ cần từ chối");
    return;
  }

  if (!rejectNote.value.trim()) {
    message.warning("Vui lòng nhập lý do từ chối");
    return;
  }

  rejectLoading.value = true;

  try {
    const { data, error } = await adminApplication.reject({
      params: {
        id: selectedRecord.value.id,
        note: rejectNote.value.trim(),
      },
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Từ chối hồ sơ thất bại");
    }

    message.success(data.value?.message || "Đã từ chối hồ sơ");
    rejectVisible.value = false;
    await refreshApplications();
    if (detailVisible.value && detailData.value?.id === selectedRecord.value.id) {
      await openDetail(selectedRecord.value.id);
    }
    closeReject();
  } catch (error) {
    rejectLoading.value = false;
    message.error(error?.message || "Từ chối hồ sơ thất bại");
  }
};

const deleteItem = async id => {
  try {
    const { data, error } = await adminApplication.delete({
      params: { id },
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể xóa hồ sơ");
    }

    message.success(data.value?.message || "Đã xóa hồ sơ");
    await refreshApplications();

    if (detailVisible.value && detailData.value?.id === id) {
      closeDetail();
    }
  } catch (error) {
    message.error(error?.message || "Không thể xóa hồ sơ");
  }
};
</script>
