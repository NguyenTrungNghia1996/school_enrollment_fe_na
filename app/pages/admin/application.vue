<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 space-y-2">
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(320px,1fr)_260px_220px_auto] xl:items-center">
        <a-input-search v-model:value="searchText" placeholder="Tìm theo mã hồ sơ, họ tên, CCCD..." enter-button @search="handleSearch" class="w-full md:col-span-2 xl:col-span-1" />
        <div class="w-full">
          <AdminSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" />
        </div>
        <a-select v-model:value="selectedStatusId" class="w-full" placeholder="Lọc theo trạng thái" :options="statusOptions" />
        <div class="flex min-h-8 items-center">
          <a-checkbox v-model:checked="selectedDirectOnly" class="whitespace-nowrap">Hồ sơ tuyển thẳng</a-checkbox>
        </div>
      </div>

      <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 xl:flex xl:justify-end">
        <a-popconfirm v-if="adminStore.canEditCurrentPage" title="Bạn chắc chắn muốn công bố danh sách tuyển thẳng cho kỳ tuyển sinh đã chọn?" ok-text="Công bố" cancel-text="Hủy" @confirm="publishDirectApplications">
          <a-button type="primary" class="w-full xl:w-auto" :loading="publishDirectLoading" :disabled="!selectedExamId || publishDirectLoading">Công bố tuyển thẳng</a-button>
        </a-popconfirm>
        <a-button :disabled="!selectedExamId" type="primary" ghost class="w-full xl:w-auto" :loading="exportLoading" @click="exportApplications">Xuất dữ liệu</a-button>
        <a-button @click="resetFilters" class="w-full xl:w-auto">Đặt lại</a-button>
      </div>

      <a-alert v-if="applicationMessage" type="warning" show-icon :message="applicationMessage" />
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
              {{ getStatusLabel(record) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-1">
              <a-tooltip title="Xem chi tiết">
                <a-button type="link" size="small" @click="openDetail(record)">
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>

              <!-- <a-tooltip title="Duyệt hồ sơ">
                <a-button type="link" size="small" class="text-emerald-600" :disabled="isActionDisabled(record) || !adminStore.canApproveCurrentPage" @click="approveItem(record)">
                  <template #icon><CheckOutlined /></template>
                </a-button>
              </a-tooltip>

              <a-tooltip title="Từ chối hồ sơ">
                <a-button type="link" size="small" danger :disabled="isActionDisabled(record) || !adminStore.canApproveCurrentPage" @click="openReject(record)">
                  <template #icon><CloseOutlined /></template>
                </a-button>
              </a-tooltip> -->

              <a-tooltip v-if="showPaymentInfoAction(record)" title="Xác nhận thanh toán">
                <a-button type="link" size="small" class="text-sky-600" :disabled="!adminStore.canApproveCurrentPage" @click="openPaymentDetail(record)">
                  <template #icon><CreditCardOutlined /></template>
                </a-button>
              </a-tooltip>

              <!-- <a-popconfirm title="Bạn chắc chắn muốn xóa hồ sơ này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-button type="link" size="small" danger :disabled="isDeleteDisabled(record) || !adminStore.canEditCurrentPage">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm> -->
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="detailVisible" title="Chi tiết hồ sơ" :width="1000" :footer="null" :z-index="1000" @cancel="closeDetail">
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
              <a-tag :color="getStatusColor(detailData)">{{ getStatusLabel(detailData) }}</a-tag>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Ảnh 3x4</div>
            <div class="mt-2">
              <a-image v-if="detailData.avatar" :src="detailData.avatar" :width="72" class="overflow-hidden rounded-lg" :preview="{ src: detailData.avatar }" />
              <span v-else class="text-sm text-slate-500">-</span>
            </div>
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
          <a-descriptions-item label="Phường/xã hiện tại" :span="2">{{ detailData.currentCommuneName || `#${detailData.idCurrentCommune || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Địa chỉ hiện tại" :span="2">{{ detailData.currentAddress || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Ghi chú" :span="2">{{ detailData.note || "-" }}</a-descriptions-item>
        </a-descriptions>

        <div>
          <h3 class="mb-3 text-base font-semibold text-slate-900">Hồ sơ đính kèm</h3>

          <div v-if="normalizedDocuments.length" class="space-y-4">
            <div v-for="document in normalizedDocuments" :key="document.key" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div class="font-medium text-slate-900">{{ document.documentName }}</div>
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
          <a-button v-if="showPaymentInfoAction(detailData)" :disabled="!adminStore.canApproveCurrentPage" @click="openPaymentDetail(detailData, true)">Xác nhận thanh toán</a-button>
          <a-popconfirm v-if="canShowApproveDirectAction(detailData)" title="Bạn chắc chắn muốn duyệt tuyển thẳng hồ sơ này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="approveDirectApplication(detailData, true)">
            <a-button class="border-emerald-500 text-emerald-600" :loading="isDirectActionLoading(detailData, 'approve')" :disabled="isAnyDirectActionLoading(detailData)">Tuyển thẳng</a-button>
          </a-popconfirm>
          <a-popconfirm v-if="canShowCancelDirectAction(detailData)" title="Bạn chắc chắn muốn hủy tuyển thẳng hồ sơ này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="cancelDirectApplication(detailData, true)">
            <a-button danger :loading="isDirectActionLoading(detailData, 'cancel')" :disabled="isAnyDirectActionLoading(detailData)">Hủy tuyển thẳng</a-button>
          </a-popconfirm>
          <a-popconfirm v-if="canShowApproveAction(detailData)" title="Bạn chắc chắn muốn duyệt hồ sơ này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="approveItem(detailData, true)">
            <a-button type="primary">Duyệt hồ sơ</a-button>
          </a-popconfirm>
          <a-popconfirm v-if="canShowRejectAction(detailData)" title="Bạn chắc chắn muốn từ chối hồ sơ này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="openReject(detailData, true)">
            <a-button danger>Từ chối</a-button>
          </a-popconfirm>
          <a-button @click="closeDetail">Đóng</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:open="paymentConfirmVisible" :width="460" :footer="null" centered @cancel="closePaymentConfirm">
      <div class="space-y-4 pt-2 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          <span class="text-2xl font-semibold">?</span>
        </div>

        <div class="space-y-2">
          <div class="text-base font-semibold text-slate-900">{{ getPaymentConfirmTitle(selectedRecord) }}</div>
          <div class="text-sm leading-6 text-slate-500">Sau khi xác nhận, hệ thống sẽ ghi nhận hồ sơ đã thanh toán và không thể hoàn tác về trạng thái trước đó.</div>
        </div>

        <div class="flex justify-center gap-3 pt-2">
          <a-button danger ghost @click="closePaymentConfirm">Hủy</a-button>
          <a-button type="primary" :loading="completePaymentLoading" @click="submitCompletePayment(selectedRecord)">Xác nhận thanh toán</a-button>
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
import { Modal } from "ant-design-vue";
import dayjs from "dayjs";
import { APPLICATION_STATUS_LABELS, getApplicationStatusColor, getApplicationStatusLabel, isDraftApplicationStatus, isPendingReviewApplicationStatus, isPaidPendingVerificationApplicationStatus } from "~/composables/useApplicationStatus";
import { useAdminStore } from "~/stores/adminStore";

definePageMeta({
  layout: "admin",
});

const adminStore = useAdminStore();
const config = useRuntimeConfig();
const { adminApplication } = useApi();

const searchText = ref("");
const selectedExamId = ref(null);
const selectedStatusId = ref(0);
const selectedDirectOnly = ref(false);
const publishDirectLoading = ref(false);
const exportLoading = ref(false);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref(null);
const rejectVisible = ref(false);
const rejectLoading = ref(false);
const rejectNote = ref("");
const selectedRecord = ref(null);
const paymentConfirmVisible = ref(false);
const completePaymentLoading = ref(false);
const confirmedMessageKey = ref("");
const directActionLoading = reactive({
  id: null,
  action: "",
});

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
  { title: "Kỳ tuyển sinh", dataIndex: "examName", key: "examName", width: 120, align: "center" },
  { title: "Họ tên", dataIndex: "fullname", key: "fullname", ellipsis: true },
  { title: "Ngày sinh", dataIndex: "dateOfBirth", key: "dateOfBirth", width: 130 },
  { title: "Số CCCD", dataIndex: "identityNumber", key: "identityNumber", width: 150 },
  { title: "Trạng thái", dataIndex: "statusName", key: "statusName", width: 190, align: "center" },
  { title: "Thao tác", key: "action", width: 150, align: "center", fixed: "right" },
];

const statusOptions = computed(() => [
  { label: "Tất cả trạng thái", value: 0 },
  ...Object.entries(APPLICATION_STATUS_LABELS)
    .filter(([value]) => Number(value) !== 1)
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

const applicationMessage = computed(() => {
  if (!applicationResponse.value?.success) return "";
  return typeof applicationResponse.value?.data?.mess === "string" ? applicationResponse.value.data.mess.trim() : "";
});

const showApplicationMessageConfirm = (responseMessage, responseValue) => {
  if (!import.meta.client || !responseMessage) return;

  const confirmationKey = [responseValue?.data?.total ?? "", params.value.pageIndex ?? "", params.value.pageSize ?? "", params.value.idExam ?? "", params.value.idStatus ?? "", params.value.isDirect ?? "", params.value.search ?? "", responseMessage].join("|");
  if (confirmedMessageKey.value === confirmationKey) return;

  confirmedMessageKey.value = confirmationKey;
  Modal.confirm({
    title: "Thông báo",
    content: responseMessage,
    okText: "Đồng ý",
    cancelText: "Đóng",
  });
};

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
          documentName: `Hồ sơ ${index + 1}`,
          links: splitDocumentLinks(document),
        };
      }

      return {
        key: `${document?.idExamDocument || document?.id || "document"}-${index}`,
        idExamDocument: document?.idExamDocument || document?.id || index + 1,
        documentName: document?.documentName || `Hồ sơ ${document?.idExamDocument || document?.id || index + 1}`,
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
      showApplicationMessageConfirm(applicationMessage.value, newValue);
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

watch(selectedDirectOnly, value => {
  const { isDirect, ...nextParams } = params.value;
  params.value = {
    ...nextParams,
    pageIndex: 1,
    ...(value ? { isDirect: true } : {}),
  };
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
  selectedDirectOnly.value = false;
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

const exportApplications = async () => {
  if (!selectedExamId.value) {
    return;
  }

  if (!adminStore.token) {
    message.error("Không tìm thấy phiên đăng nhập quản trị");
    return;
  }

  exportLoading.value = true;

  try {
    const exportUrl = new URL("/api/admin/application/export", config.public.baseURL);
    exportUrl.searchParams.set("idExam", String(selectedExamId.value));

    const response = await fetch(exportUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Xuất dữ liệu thất bại");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const contentDisposition = response.headers.get("content-disposition") || "";
    const utf8Match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    const fileNameMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
    const fileName = utf8Match?.[1] ? decodeURIComponent(utf8Match[1].trim()) : fileNameMatch?.[1]?.trim() || `ho-so-ky-tuyen-sinh-${selectedExamId.value}.xlsx`;

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    message.success("Xuất dữ liệu thành công");
  } catch (error) {
    message.error(error?.message || "Xuất dữ liệu thất bại");
  } finally {
    exportLoading.value = false;
  }
};

const publishDirectApplications = async () => {
  if (!adminStore.canEditCurrentPage) {
    message.warning("Bạn không có quyền công bố dữ liệu");
    return;
  }

  if (!selectedExamId.value) {
    message.warning("Vui lòng chọn kỳ tuyển sinh");
    return;
  }

  publishDirectLoading.value = true;

  try {
    const { data, error } = await adminApplication.putByRest("direct/publish", {
      params: {
        idExam: Number(selectedExamId.value),
      },
      key: `admin-application-direct-publish-${selectedExamId.value}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Công bố danh sách tuyển thẳng thất bại");
    }

    message.success(data.value?.message || "Công bố danh sách tuyển thẳng thành công");
    await reloadApplicationTable();
  } catch (error) {
    message.error(error?.message || "Công bố danh sách tuyển thẳng thất bại");
  } finally {
    publishDirectLoading.value = false;
  }
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

const getStatusColor = record => getApplicationStatusColor(record);
const getStatusLabel = record => getApplicationStatusLabel(record);

const isActionDisabled = record => {
  return !isPendingReviewApplicationStatus(record);
};

const canShowApproveAction = record => {
  return Boolean(record?.canApprove) && adminStore.canApproveCurrentPage;
};

const canShowRejectAction = record => {
  return isPendingReviewApplicationStatus(record) && adminStore.canApproveCurrentPage;
};

const canShowApproveDirectAction = record => {
  return Boolean(record?.canApproveDirect) && adminStore.canApproveCurrentPage;
};

const canShowCancelDirectAction = record => {
  return Boolean(record?.canCancel) && adminStore.canApproveCurrentPage;
};

const isDeleteDisabled = record => {
  return !isDraftApplicationStatus(record);
};

const showPaymentInfoAction = record => {
  return isPaidPendingVerificationApplicationStatus(record);
};

const isDirectActionLoading = (record, action) => {
  return Boolean(record?.id) && directActionLoading.id === record.id && directActionLoading.action === action;
};

const isAnyDirectActionLoading = record => {
  return Boolean(record?.id) && directActionLoading.id === record.id && Boolean(directActionLoading.action);
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
  return getDisplayFileName(getFileName(link));
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
    const { data, error } = await adminApplication.getByRest("detail", {
      params: { id },
      key: `admin-application-detail-${id}-${Date.now()}`,
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

const reloadApplicationTable = async () => {
  await refreshApplications();
};

const reloadDetailIfOpen = async id => {
  if (detailVisible.value && detailData.value?.id === id) {
    await openDetail(id);
  }
};

const getPaymentConfirmTitle = record => {
  const applicationCode = record?.applicationCode || `#${record?.id || ""}`;
  return `Xác nhận thanh toán hồ sơ ${applicationCode}`;
};

const openPaymentDetail = (record, fromDetail = false) => {
  if (fromDetail && detailData.value) {
    selectedRecord.value = detailData.value;
  } else {
    selectedRecord.value = record;
  }

  if (!selectedRecord.value?.id) {
    message.error("Không xác định được hồ sơ thanh toán");
    return;
  }

  paymentConfirmVisible.value = true;
};

const closePaymentConfirm = () => {
  paymentConfirmVisible.value = false;
};

const submitCompletePayment = async record => {
  const applicationId = Number(record?.id);
  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    message.error("Không xác định được hồ sơ thanh toán");
    return;
  }

  completePaymentLoading.value = true;

  try {
    const { data, error } = await adminApplication.putByRest("completePayment", {
      params: {
        idApplication: applicationId,
      },
      key: `admin-complete-payment-${applicationId}-${Date.now()}`,
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Xác nhận thanh toán thất bại");
    }

    message.success(data.value?.message || "Xác nhận thanh toán thành công");
    closePaymentConfirm();
    await reloadApplicationTable();
    await reloadDetailIfOpen(applicationId);
  } catch (error) {
    message.error(error?.message || "Xác nhận thanh toán thất bại");
    throw error;
  } finally {
    completePaymentLoading.value = false;
  }
};

const approveItem = async (record, keepModal = false) => {
  try {
    const { data, error } = await adminApplication.putByRest("approve", {
      params: { id: record.id },
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Duyệt hồ sơ thất bại");
    }

    message.success(data.value?.message || "Duyệt hồ sơ thành công");
    if (!keepModal) {
      selectedRecord.value = null;
    }
    await reloadApplicationTable();
    await reloadDetailIfOpen(record.id);
  } catch (error) {
    message.error(error?.message || "Duyệt hồ sơ thất bại");
  }
};

const submitDirectApplicationAction = async (record, action, successMessage, fallbackMessage) => {
  const applicationId = Number(record?.id);
  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    message.error("Không xác định được hồ sơ");
    return;
  }

  directActionLoading.id = record.id;
  directActionLoading.action = action;

  try {
    const { data, error } = await adminApplication.putByRest(`direct/${action}`, {
      params: { id: applicationId },
      key: `admin-application-direct-${action}-${applicationId}-${Date.now()}`,
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || fallbackMessage);
    }

    message.success(data.value?.message || successMessage);
    await reloadApplicationTable();
    await reloadDetailIfOpen(applicationId);
  } catch (error) {
    message.error(error?.message || fallbackMessage);
  } finally {
    directActionLoading.id = null;
    directActionLoading.action = "";
  }
};

const approveDirectApplication = async record => {
  await submitDirectApplicationAction(record, "approve", "Duyệt tuyển thẳng thành công", "Duyệt tuyển thẳng thất bại");
};

const cancelDirectApplication = async record => {
  await submitDirectApplicationAction(record, "cancel", "Hủy tuyển thẳng thành công", "Hủy tuyển thẳng thất bại");
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
    const { data, error } = await adminApplication.putByRest("reject", {
      body: {
        id: selectedRecord.value.id,
        note: rejectNote.value.trim(),
      },
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Từ chối hồ sơ thất bại");
    }

    message.success(data.value?.message || "Đã từ chối hồ sơ");
    const rejectedId = selectedRecord.value.id;
    rejectVisible.value = false;
    await reloadApplicationTable();
    await reloadDetailIfOpen(rejectedId);
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
    const nextTotal = Math.max(Number(pagination.total || 0) - 1, 0);
    const nextPage = Math.max(1, Math.ceil(nextTotal / pagination.pageSize));
    if (pagination.current > nextPage) {
      pagination.current = nextPage;
      params.value.pageIndex = nextPage;
    }
    await reloadApplicationTable();

    if (detailVisible.value && detailData.value?.id === id) {
      closeDetail();
    }
  } catch (error) {
    message.error(error?.message || "Không thể xóa hồ sơ");
  }
};
</script>
