<template>
  <div class="w-full pb-20">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-[#071f41] py-20 text-white">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary blur-[120px]"></div>
        <div class="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary blur-[120px]"></div>
      </div>

      <div class="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Cổng Thông Tin Tuyển Sinh Trực Tuyến</h1>
        <p class="mx-auto mt-6 max-w-2xl text-xl text-blue-100">Hệ thống quản lý hồ sơ đăng ký và theo dõi thông tin thi dành cho thí sinh và phụ huynh của {{ unitStore.name }}.</p>
        <div class="mt-10 flex justify-center gap-4">
          <a-button v-if="!userStore.token" type="primary" size="large" class="h-12 rounded-lg bg-primary px-8 font-bold hover:bg-primary/90" @click="handleCta">BẮT ĐẦU ĐĂNG KÝ</a-button>
          <a-button ghost size="large" class="h-12 rounded-lg border-white px-8 font-bold hover:bg-white hover:text-[#071f41]">HƯỚNG DẪN THỦ TỤC</a-button>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <div class="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
        <!-- Left: Exams and News -->
        <div class="space-y-16">
          <!-- Active Exams Section -->
          <section>
            <div class="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 class="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <Icon name="lucide:book-open" class="text-primary" />
                Các Đợt Khảo Thí Đang Mở
              </h2>
              <a-button v-if="showViewMoreButton" type="link" class="font-semibold text-primary" :loading="loading" @click="handleViewMore">Xem thêm</a-button>
            </div>

            <div v-if="examsExpanded" class="mb-6">
              <a-input-search v-model:value="examSearchText" placeholder="Tìm kiếm kỳ khảo thí..." allow-clear @search="handleExamSearch" @change="onExamSearchChange" />
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
              <article v-for="exam in exams" :key="exam.id" class="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                <div>
                  <div class="mb-4">
                    <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-inset" :class="exam.badgeClass">
                      {{ exam.status }}
                    </span>
                  </div>
                  <NuxtLink :to="exam.url || '#'" target="_blank" class="text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">{{ exam.title }}</NuxtLink>
                  <div class="mt-4 space-y-2 text-sm text-slate-600">
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:calendar-check" class="text-slate-400" />
                      <span>
                        Ngày bắt đầu:
                        <strong>{{ exam.start }}</strong>
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-error">
                      <Icon name="lucide:alert-circle" />
                      <span>
                        Hết hạn:
                        <strong>{{ exam.end }}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-8">
                  <a-button block type="primary" class="h-11 rounded-lg bg-primary font-bold hover:bg-primary/90" :disabled="isExamActionDisabled(exam)" @click="handleRegistration(exam)">
                    {{ getExamActionLabel(exam) }}
                  </a-button>
                </div>
              </article>
            </div>

            <div v-if="loading && !exams.length" class="py-10 text-center">
              <a-spin size="large" />
            </div>

            <div v-if="!loading && !exams.length" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">Chưa có kỳ khảo thí nào để hiển thị.</div>

            <div v-if="examsExpanded && examTotal > expandedPageSize" class="flex justify-center pt-8">
              <a-pagination v-model:current="pageIndex" :total="examTotal" :page-size="expandedPageSize" :show-size-changer="false" @change="handleExamPageChange" />
            </div>
          </section>
        </div>

        <!-- Right: Sidebar -->
        <aside class="space-y-8">
          <!-- Quick Support -->
          <div class="rounded-2xl bg-slate-900 p-8 text-white shadow-2xl">
            <h3 class="mb-4 text-xl font-bold">Hỗ trợ thí sinh</h3>
            <p class="mb-6 text-sm text-slate-400">Nếu bạn gặp khó khăn trong quá trình đăng ký, hãy liên hệ với chúng tôi.</p>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Icon name="lucide:phone" />
                </div>
                <div>
                  <p class="text-xs uppercase text-slate-400">Hotline</p>
                  <p class="font-bold">{{ unitStore.phone }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Icon name="lucide:mail" />
                </div>
                <div>
                  <p class="text-xs uppercase text-slate-400">Email</p>
                  <p class="truncate text-sm font-bold">{{ unitStore.email }}</p>
                </div>
              </div>
            </div>
            <!-- <a-button block ghost class="mt-8 h-12 rounded-lg border-white/20 font-bold hover:bg-white hover:text-slate-900">GỬI YÊU CẦU HỖ TRỢ</a-button> -->
          </div>
        </aside>
      </div>
    </div>

    <a-modal v-model:open="applicationDetailVisible" title="Chi tiết hồ sơ" :width="1000" :footer="null" @cancel="closeApplicationDetail">
      <div v-if="applicationDetailLoading" class="py-12 text-center">
        <a-spin size="large" />
      </div>

      <div v-else-if="applicationDetail" class="space-y-6">
        <div class="grid gap-4 md:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Mã hồ sơ</div>
            <div class="mt-2 font-bold text-slate-900">{{ applicationDetail.applicationCode || `#${applicationDetail.id}` }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Kỳ tuyển sinh</div>
            <div class="mt-2 font-bold text-slate-900">{{ applicationDetail.examName || `#${applicationDetail.idExam}` }}</div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái hồ sơ</div>
            <div class="mt-2">
              <a-tag :color="getApplicationStatusColor(applicationDetail)">{{ getStatusLabel(applicationDetail) }}</a-tag>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Ảnh 3x4</div>
            <div class="mt-2">
              <a-image v-if="applicationDetail.avatar" :src="applicationDetail.avatar" :width="72" class="overflow-hidden rounded-lg" :preview="{ src: applicationDetail.avatar }" />
              <span v-else class="text-sm text-slate-500">-</span>
            </div>
          </div>
        </div>

        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="Họ tên">{{ applicationDetail.fullName || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Ngày sinh">{{ formatDate(applicationDetail.dateOfBirth) }}</a-descriptions-item>
          <a-descriptions-item label="Số CCCD">{{ applicationDetail.identityNumber || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Ngày cấp CCCD">{{ formatDate(applicationDetail.identityIssueDate) }}</a-descriptions-item>
          <a-descriptions-item label="Nơi cấp CCCD">{{ applicationDetail.identityIssuePlace || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Giới tính">{{ formatGender(applicationDetail.gender) }}</a-descriptions-item>
          <a-descriptions-item label="Dân tộc">{{ applicationDetail.ethnicityName || `#${applicationDetail.idEthnicity || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Nơi sinh">{{ applicationDetail.provinceName || `#${applicationDetail.idProvince || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Tỉnh thường trú">{{ applicationDetail.permanentProvinceName || `#${applicationDetail.idPermanentProvince || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Phường/xã thường trú">{{ applicationDetail.permanentCommuneName || `#${applicationDetail.idCommune || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Địa chỉ thường trú" :span="2">{{ applicationDetail.permanentAddress || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Số điện thoại">{{ applicationDetail.phoneNumber || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Tỉnh hiện tại">{{ applicationDetail.currentProvinceName || `#${applicationDetail.idCurrentProvince || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Phường/xã hiện tại">{{ applicationDetail.currentCommuneName || `#${applicationDetail.idCurrentCommune || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Địa chỉ hiện tại" :span="2">{{ applicationDetail.currentAddress || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Ghi chú" :span="2">{{ applicationDetail.note || "-" }}</a-descriptions-item>
        </a-descriptions>

        <div>
          <h3 class="mb-3 text-base font-semibold text-slate-900">Hồ sơ đính kèm</h3>

          <div v-if="normalizedApplicationDocuments.length" class="space-y-4">
            <div v-for="document in normalizedApplicationDocuments" :key="document.key" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
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

        <div class="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <a-button v-if="showPaymentAction" type="primary" :loading="qrLoading" @click="openPaymentModal">Thanh toán ngay</a-button>
          <a-button @click="closeApplicationDetail">Đóng</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:open="paymentVisible" title="Thanh toán hồ sơ" :width="960" :footer="null" @cancel="closePaymentModal">
      <div v-if="qrLoading" class="py-12 text-center">
        <a-spin size="large" />
      </div>

      <div v-else-if="qrData" class="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 class="text-lg font-bold text-slate-900">Thông tin chuyển khoản</h3>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
            <img :src="qrData.url" :alt="`QR thanh toán ${qrData.applicationCode}`" class="mx-auto h-auto w-full max-w-[280px]" />
          </div>

          <p class="mt-4 text-sm leading-6 text-slate-500">Quét mã QR bằng ứng dụng ngân hàng để thanh toán. Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống đối soát chính xác.</p>

          <div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.15em] text-amber-600">Nội dung chuyển khoản</div>
            <div class="mt-2 text-center text-xl font-bold tracking-[0.35em] text-amber-700">{{ qrData.code || "-" }}</div>
          </div>

          <div class="mt-4 space-y-3">
            <div class="rounded-2xl bg-white px-4 py-3">
              <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Ngân hàng</div>
              <div class="mt-2 font-semibold text-slate-800">{{ qrData.bank || "-" }}</div>
            </div>
            <div class="rounded-2xl bg-white px-4 py-3">
              <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Số tài khoản</div>
              <div class="mt-2 font-semibold text-slate-800">{{ qrData.accountNo || "-" }}</div>
            </div>
            <div class="rounded-2xl bg-white px-4 py-3">
              <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Chủ tài khoản</div>
              <div class="mt-2 font-semibold uppercase text-slate-800">{{ qrData.accountName || "-" }}</div>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 class="text-lg font-bold text-slate-900">Thông tin đợt tuyển sinh / kỳ thi</h3>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div class="grid grid-cols-[160px_1fr] border-b border-slate-200">
              <div class="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">Tên đợt</div>
              <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.examName || "-" }}</div>
            </div>
            <div class="grid grid-cols-[160px_1fr] border-b border-slate-200">
              <div class="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">Mã hồ sơ</div>
              <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.applicationCode || "-" }}</div>
            </div>
            <div class="grid grid-cols-[160px_1fr] border-b border-slate-200">
              <div class="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">Tên thí sinh</div>
              <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.fullName || "-" }}</div>
            </div>
            <div class="grid grid-cols-[160px_1fr] border-b border-slate-200">
              <div class="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">Lệ phí</div>
              <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ formatCurrency(qrData.fee) }}</div>
            </div>
            <div class="grid grid-cols-[160px_1fr]">
              <div class="bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Tổng thanh toán</div>
              <div class="px-4 py-3 text-base font-bold text-emerald-700">{{ formatCurrency(qrData.fee) }}</div>
            </div>
          </div>

          <div class="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">Sau khi chuyển khoản thành công, hồ sơ sẽ được nhà trường xác nhận theo quy trình đối soát.</div>

          <div class="mt-6 flex justify-end gap-3">
            <a-button class="min-w-32" @click="closePaymentModal">Quay lại</a-button>
            <a-button type="primary" class="min-w-40" :loading="confirmPaymentLoading" @click="confirmPayment">Xác nhận thanh toán</a-button>
          </div>
        </section>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

import { APPLICATION_STATUS_LABELS, getApplicationStatus, getApplicationStatusColor, isApprovedPendingPaymentApplicationStatus } from "~/composables/useApplicationStatus";

const { $dayjs } = useNuxtApp();
const unitStore = useUnitStore();
const userStore = useUserStore();
const safeMessage = useSafeMessage();
const { examUser, applicationUser } = useApi();

const EXAM_STATUS = Object.freeze({
  SUBMITTING: 1,
  ORGANIZING: 2,
  SUMMARIZED: 3,
  COMPLETED: 4,
});

const EXAM_STATUS_CONFIG = Object.freeze({
  [EXAM_STATUS.SUBMITTING]: {
    label: "Nộp hồ sơ",
    badgeClass: "bg-primary/10 text-primary ring-primary/10",
    isClosed: false,
  },
  [EXAM_STATUS.ORGANIZING]: {
    label: "Tổ chức thi",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    isClosed: true,
  },
  [EXAM_STATUS.SUMMARIZED]: {
    label: "Tổng kết",
    badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
    isClosed: true,
  },
  [EXAM_STATUS.COMPLETED]: {
    label: "Hoàn thành",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    isClosed: true,
  },
});

const getStatusLabel = record => {
  const status = getApplicationStatus(record);
  return APPLICATION_STATUS_LABELS[status] || record?.statusName || "Không xác định";
};
const INITIAL_PAGE_SIZE = 3;
const EXPANDED_PAGE_SIZE = 6;
const pageIndex = ref(1);
const examsExpanded = ref(false);
const examSearchText = ref("");
const applicationDetailVisible = ref(false);
const applicationDetailLoading = ref(false);
const applicationDetail = ref(null);
const paymentVisible = ref(false);
const qrData = ref(null);
const qrLoading = ref(false);
const confirmPaymentLoading = ref(false);
const pageSize = computed(() => (examsExpanded.value ? EXPANDED_PAGE_SIZE : INITIAL_PAGE_SIZE));
const expandedPageSize = computed(() => EXPANDED_PAGE_SIZE);
const showPaymentAction = computed(() => isApprovedPendingPaymentApplicationStatus(applicationDetail.value));
const query = ref({
  pageIndex: 1,
  pageSize: INITIAL_PAGE_SIZE,
  search: "",
});

const getExamStatus = exam => {
  const examStatus = Number(exam?.idExamStatus);
  if (EXAM_STATUS_CONFIG[examStatus]) {
    return {
      label: exam?.examStatusName || EXAM_STATUS_CONFIG[examStatus].label,
      badgeClass: EXAM_STATUS_CONFIG[examStatus].badgeClass,
      isClosed: EXAM_STATUS_CONFIG[examStatus].isClosed,
      isActionDisabled: EXAM_STATUS_CONFIG[examStatus].isClosed,
    };
  }

  const now = $dayjs();
  const startDate = $dayjs(exam.startDate);
  const endDate = $dayjs(exam.endDate);

  if (now.isBefore(startDate)) {
    return {
      label: "Sắp mở",
      badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
      isClosed: true,
      isActionDisabled: false,
    };
  }

  if (now.isAfter(endDate)) {
    return {
      label: "Đã đóng",
      badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
      isClosed: true,
      isActionDisabled: true,
    };
  }

  return {
    label: "Đang mở",
    badgeClass: "bg-primary/10 text-primary ring-primary/10",
    isClosed: false,
    isActionDisabled: false,
  };
};

const mapExamItem = exam => {
  const status = getExamStatus(exam);

  return {
    id: exam.id,
    title: exam.examName,
    startDate: exam.startDate,
    endDate: exam.endDate,
    url: exam.url,
    start: $dayjs(exam.startDate).format("DD/MM/YYYY"),
    end: $dayjs(exam.endDate).format("DD/MM/YYYY"),
    status: status.label,
    badgeClass: status.badgeClass,
    isClosed: status.isClosed,
    isActionDisabled: status.isActionDisabled,
    hasApplication: Boolean(exam?.hasApplication),
    idExamStatus: Number(exam?.idExamStatus),
  };
};

const {
  data: examResponse,
  error: examError,
  pending: loading,
  refresh: refreshExams,
} = await examUser.get({
  query,
  key: `home-exam-list`,
});

const exams = computed(() => {
  if (!examResponse.value?.success) return [];
  const items = Array.isArray(examResponse.value?.data?.items) ? examResponse.value.data.items : [];
  return items.map(mapExamItem);
});

const normalizedApplicationDocuments = computed(() => {
  const documents = Array.isArray(applicationDetail.value?.documents) ? applicationDetail.value.documents : [];

  return documents
    .map((document, index) => {
      if (typeof document === "string") {
        return {
          key: `document-${index}`,
          documentName: `Hồ sơ #${index + 1}`,
          links: splitDocumentLinks(document),
        };
      }

      const idExamDocument = document?.idExamDocument || document?.id || index + 1;

      return {
        key: `${idExamDocument || "document"}-${index}`,
        documentName: document?.documentName || `Hồ sơ #${idExamDocument}`,
        links: splitDocumentLinks(document?.url || document?.fileUrl || document?.link || document?.path),
      };
    })
    .filter(document => document.links.length);
});

const examTotal = computed(() => {
  if (!examResponse.value?.success) return 0;
  return Number(examResponse.value?.data?.total || 0);
});

const showViewMoreButton = computed(() => !examsExpanded.value && examTotal.value > INITIAL_PAGE_SIZE);

const formatDate = value => {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "-";
};

const formatGender = value => {
  if (value === true) return "Nam";
  if (value === false) return "Nữ";
  return "-";
};

const formatCurrency = value => {
  if (value === undefined || value === null) return "0 VND";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const normalizeApplicationDetail = detail => {
  if (!detail || typeof detail !== "object") {
    return null;
  }

  return {
    ...detail,
    dateOfBirth: detail.dateOfBirth ? dayjs(detail.dateOfBirth) : null,
    identityIssueDate: detail.identityIssueDate ? dayjs(detail.identityIssueDate) : null,
    fullName: detail.fullName || detail.fullname || null,
    documents: Array.isArray(detail.documents) ? detail.documents : [],
  };
};

const splitDocumentLinks = value => {
  if (!value) return [];
  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
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

const fetchExams = async () => {
  try {
    query.value.pageIndex = pageIndex.value;
    query.value.pageSize = pageSize.value;
    query.value.search = examSearchText.value.trim();
    await refreshExams();

    if (examError.value) {
      throw new Error(examError.value?.data?.message || examError.value?.message || "Không tải được danh sách kỳ khảo thí");
    }

    if (examResponse.value?.success === false) {
      throw new Error(examResponse.value?.message || "Không tải được danh sách kỳ khảo thí");
    }
  } catch (error) {
    safeMessage.error(error?.message || "Không tải được danh sách kỳ khảo thí");
  }
};

const resetExamList = async () => {
  pageIndex.value = 1;
  await fetchExams();
};

const handleViewMore = async () => {
  examsExpanded.value = true;
  pageIndex.value = 1;
  await fetchExams();
};

const handleExamSearch = async value => {
  examSearchText.value = (value || "").trim();
  await resetExamList();
};

const onExamSearchChange = async event => {
  const value = event?.target?.value || "";
  if (value) return;

  examSearchText.value = "";
  await resetExamList();
};

const handleExamPageChange = async page => {
  pageIndex.value = page;
  await fetchExams();
};

const hasExamApplication = exam => Boolean(exam?.hasApplication);

const isExamWithinRegistrationWindow = exam => {
  const startDate = $dayjs(exam?.startDate);
  const endDate = $dayjs(exam?.endDate);

  if (!startDate.isValid() || !endDate.isValid()) {
    return false;
  }

  const now = $dayjs();
  return !now.isBefore(startDate) && !now.isAfter(endDate);
};

const isExamActionDisabled = exam => {
  if (userStore.token) {
    if (hasExamApplication(exam)) {
      return false;
    }

    return !isExamWithinRegistrationWindow(exam);
  }

  return !isExamWithinRegistrationWindow(exam);
};

const getExamActionLabel = exam => {
  if (userStore.token && hasExamApplication(exam)) {
    return "XEM HỒ SƠ";
  }

  return "ĐĂNG KÝ NGAY";
};

const openApplicationDetail = async examId => {
  const normalizedExamId = Number(examId);
  if (!Number.isFinite(normalizedExamId) || normalizedExamId <= 0) {
    safeMessage.error("Id kỳ khảo thí không hợp lệ");
    return;
  }

  applicationDetailVisible.value = true;
  applicationDetailLoading.value = true;
  applicationDetail.value = null;

  try {
    const { data, error } = await applicationUser.getByRest("detail/exam", {
      params: { idExam: normalizedExamId },
      key: `home-application-detail-${normalizedExamId}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể tải thông tin hồ sơ");
    }

    applicationDetail.value = normalizeApplicationDetail(data.value.data);
  } catch (error) {
    applicationDetailVisible.value = false;
    safeMessage.error(error?.message || "Không thể tải thông tin hồ sơ");
  } finally {
    applicationDetailLoading.value = false;
  }
};

const closeApplicationDetail = () => {
  applicationDetailVisible.value = false;
  applicationDetailLoading.value = false;
  applicationDetail.value = null;
};

const openPaymentModal = async () => {
  if (!applicationDetail.value?.id) {
    safeMessage.error("Không xác định được hồ sơ thanh toán");
    return;
  }

  const applicationId = Number(applicationDetail.value.id);
  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    safeMessage.error("Id hồ sơ không hợp lệ, vui lòng kiểm tra lại");
    return;
  }

  qrData.value = null;
  paymentVisible.value = true;
  qrLoading.value = true;

  try {
    const { data, error } = await applicationUser.getByRest("qr", {
      params: { id: applicationId },
      key: `home-application-qr-${applicationId}-${Date.now()}`,
    });
    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không tải được thông tin thanh toán");
    }

    qrData.value = data.value.data;
  } catch (error) {
    paymentVisible.value = false;
    safeMessage.error(error?.message || "Không tải được thông tin thanh toán");
  } finally {
    qrLoading.value = false;
  }
};

const closePaymentModal = () => {
  paymentVisible.value = false;
  qrData.value = null;
  qrLoading.value = false;
  confirmPaymentLoading.value = false;
};

const confirmPayment = async () => {
  if (!applicationDetail.value?.id) {
    safeMessage.error("Không xác định được hồ sơ thanh toán");
    return;
  }

  if (!qrData.value) {
    safeMessage.error("Không có thông tin thanh toán để xác nhận");
    return;
  }

  if (!qrData.value.code) {
    safeMessage.error("Không có nội dung chuyển khoản để xác nhận");
    return;
  }

  confirmPaymentLoading.value = true;

  try {
    const { data, error } = await applicationUser.putByRest("confirmPayment", {
      params: { idApplication: Number(applicationDetail.value.id) },
      key: `home-application-confirm-payment-${applicationDetail.value.id}-${Date.now()}`,
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Xác nhận thanh toán thất bại");
    }

    safeMessage.success(data.value?.message || "Xác nhận thanh toán thành công");
    closePaymentModal();
    closeApplicationDetail();
    await fetchExams();
  } catch (error) {
    safeMessage.error(error?.message || "Xác nhận thanh toán thất bại");
  } finally {
    confirmPaymentLoading.value = false;
  }
};

const handleRegistration = exam => {
  if (userStore.token && hasExamApplication(exam)) {
    openApplicationDetail(exam.id);
  } else if (isExamActionDisabled(exam)) {
    safeMessage.warning("Kỳ khảo thí này hiện chưa mở hoặc đã kết thúc");
  } else if (!userStore.token) {
    safeMessage.warning("Bạn cần phải đăng nhập để thực hiện thao tác này");
    userStore.openLogin();
  } else {
    navigateTo(`/user/register/${exam.id}`);
  }
};

const handleCta = () => {
  if (!userStore.token) {
    userStore.openLogin();
  } else {
    safeMessage.success("Chào mừng bạn quay lại!");
  }
};
</script>

<style scoped>
/* Optional: specific styles for hero background */
</style>
