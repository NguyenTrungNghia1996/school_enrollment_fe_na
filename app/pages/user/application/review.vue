<template>
  <div class="min-h-screen bg-slate-50 px-2 py-2">
    <div class="container mx-auto">
      <section class="hidden rounded-3xl bg-white p-6 shadow-sm">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
          <a-input-search v-model:value="searchText" placeholder="Tìm theo mã phúc khảo, họ tên, môn học..." allow-clear enter-button @search="handleSearch" />

          <ClientOnly>
            <UserSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" @change="handleExamChange" />
            <template #fallback>
              <div class="h-8 w-full rounded-md border border-slate-200 bg-slate-50"></div>
            </template>
          </ClientOnly>

          <div class="flex gap-2">
            <a-button class="flex-1 lg:flex-none" @click="resetFilters">Đặt lại</a-button>
            <a-button type="primary" class="flex-1 lg:flex-none" @click="handleSearch">Tìm kiếm</a-button>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold text-slate-900">Danh sách phúc khảo</h1>
            <p class="mt-1 text-sm text-slate-500">Theo dõi các yêu cầu phúc khảo đã gửi của bạn.</p>
          </div>
          <a-button type="primary" @click="openCreateReview">Tạo yêu cầu phúc khảo</a-button>
        </div>

        <div v-if="pending" class="py-16 text-center">
          <a-spin size="large" />
          <p class="mt-4 text-sm text-slate-500">Đang tải danh sách phúc khảo...</p>
        </div>

        <div v-else-if="loadError" class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
          <div class="text-base font-semibold text-rose-700">Không tải được danh sách phúc khảo</div>
          <p class="mt-2 text-sm text-rose-600">{{ loadError }}</p>
          <a-button type="primary" danger class="mt-4" @click="refreshReviews">Thử lại</a-button>
        </div>

        <template v-else>
          <div class="hidden overflow-x-auto lg:block">
            <ClientOnly>
              <a-table :columns="columns" :data-source="dataSource" :pagination="false" :row-key="record => record.id" :scroll="{ x: 1280 }" bordered size="middle">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'stt'">
                    {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
                  </template>

                  <template v-else-if="column.key === 'reviewFee'">
                    {{ formatCurrency(record.reviewFee) }}
                  </template>

                  <template v-else-if="column.key === 'statusName'">
                    <a-tag :color="getReviewStatusColor(record)">
                      {{ getReviewStatusLabel(record) }}
                    </a-tag>
                  </template>

                  <template v-else-if="column.key === 'action'">
                    <div class="flex justify-center gap-3">
                      <a-button type="link" class="px-0" @click="openReviewDetail(record)">Chi tiết</a-button>
                      <a-button v-if="showPayAction(record)" type="link" class="px-0 text-primary" @click="openPaymentModal(record)">Thanh toán</a-button>
                      <a-button v-else type="link" class="px-0" @click="openApplicationDetail(record)">Xem hồ sơ</a-button>
                    </div>
                  </template>
                </template>
              </a-table>
            </ClientOnly>
          </div>

          <div v-if="!dataSource.length" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-slate-500">Chưa có yêu cầu phúc khảo nào.</div>

          <div v-else class="space-y-4 lg:hidden">
            <article v-for="record in dataSource" :key="record.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ record.reviewCode || `#${record.id}` }}</div>
                  <h2 class="mt-2 text-lg font-bold text-slate-900">{{ record.fullName || "-" }}</h2>
                </div>
                <a-tag :color="getReviewStatusColor(record)">
                  {{ getReviewStatusLabel(record) }}
                </a-tag>
              </div>

              <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div class="rounded-xl bg-white px-4 py-3">
                  <dt class="text-xs uppercase tracking-[0.15em] text-slate-400">Môn phúc khảo</dt>
                  <dd class="mt-2 font-medium text-slate-700">{{ record.subjectName || "-" }}</dd>
                </div>
                <div class="rounded-xl bg-white px-4 py-3">
                  <dt class="text-xs uppercase tracking-[0.15em] text-slate-400">Lệ phí</dt>
                  <dd class="mt-2 font-medium text-slate-700">{{ formatCurrency(record.reviewFee) }}</dd>
                </div>
                <div class="rounded-xl bg-white px-4 py-3 sm:col-span-2">
                  <dt class="text-xs uppercase tracking-[0.15em] text-slate-400">Lý do</dt>
                  <dd class="mt-2 whitespace-pre-line font-medium text-slate-700">{{ record.reason || "-" }}</dd>
                </div>
              </dl>

              <div class="mt-4 flex flex-wrap justify-end gap-2">
                <a-button class="rounded-xl" @click="openReviewDetail(record)">Chi tiết</a-button>
                <a-button v-if="showPayAction(record)" type="primary" class="rounded-xl" @click="openPaymentModal(record)">Thanh toán ngay</a-button>
                <a-button v-else type="primary" class="rounded-xl" @click="openApplicationDetail(record)">Xem hồ sơ</a-button>
              </div>
            </article>
          </div>

          <div v-if="pagination.total > pagination.pageSize" class="mt-6 flex justify-center">
            <a-pagination v-model:current="pagination.current" v-model:page-size="pagination.pageSize" :total="pagination.total" :show-size-changer="true" :page-size-options="['10', '20', '50', '100']" :show-total="total => `Tổng ${total} yêu cầu`" @change="handlePageChange" />
          </div>
        </template>
      </section>
    </div>
  </div>

  <a-modal v-model:open="createVisible" title="Tạo yêu cầu phúc khảo" :confirm-loading="createSubmitting" ok-text="Gửi yêu cầu" cancel-text="Hủy" @ok="submitCreateReview" @cancel="closeCreateReview">
    <div v-if="createApplicationLoading" class="py-8 text-center">
      <a-spin />
      <p class="mt-3 text-sm text-slate-500">Đang tải thông tin hồ sơ...</p>
    </div>

    <div v-else-if="createApplicationError" class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
      <div class="text-base font-semibold text-rose-700">Không tải được hồ sơ phúc khảo</div>
      <p class="mt-2 text-sm text-rose-600">{{ createApplicationError }}</p>
      <a-button type="primary" danger class="mt-4" @click="fetchCreateApplication">Thử lại</a-button>
    </div>

    <template v-else>
      <div v-if="createApplication" class="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Hồ sơ</div>
        <div class="mt-2 text-sm font-semibold text-slate-900">{{ createApplication?.applicationCode || `#${createApplication?.id || ""}` }} - {{ createApplication?.fullName || createApplication?.fullname || "-" }}</div>
        <div class="mt-1 text-sm text-slate-500">{{ createApplication?.examName || `#${createApplication?.idExam || selectedExamId || "-"}` }}</div>
      </div>

      <a-form ref="createFormRef" :model="createFormState" layout="vertical">
        <a-form-item label="Hồ sơ phúc khảo" name="idApplication" :rules="createFormRules.idApplication">
          <a-select class="w-full" v-model:value="createFormState.idApplication" show-search :loading="createApplicationsPending" :options="createApplicationOptions" placeholder="Chọn hồ sơ phúc khảo" :filter-option="filterCreateApplicationOption" @change="handleCreateApplicationChange" />
        </a-form-item>

        <UserSelectSubject v-model="createFormState.idSubject" label="Môn phúc khảo" name="idSubject" placeholder="Chọn môn phúc khảo" :rules="createFormRules.idSubject" :id-application="createFormState.idApplication" :disabled="!createFormState.idApplication" />

        <a-form-item label="Lý do phúc khảo" name="reason" :rules="createFormRules.reason">
          <a-textarea v-model:value="createFormState.reason" :rows="4" :maxlength="1000" placeholder="Nhập lý do phúc khảo" show-count />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>

  <a-modal v-model:open="detailVisible" title="Chi tiết phúc khảo" :width="820" :footer="null" @cancel="closeReviewDetail">
    <div v-if="detailLoading" class="py-12 text-center">
      <a-spin size="large" />
    </div>

    <div v-else-if="detailError" class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
      <div class="text-base font-semibold text-rose-700">Không tải được chi tiết phúc khảo</div>
      <p class="mt-2 text-sm text-rose-600">{{ detailError }}</p>
      <a-button type="primary" danger class="mt-4" @click="fetchReviewDetail">Thử lại</a-button>
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
          <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</div>
          <div class="mt-2">
            <a-tag :color="getReviewStatusColor(detailData)">{{ getReviewStatusLabel(detailData) }}</a-tag>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Kỳ tuyển sinh</div>
          <div class="mt-2 font-bold text-slate-900">{{ detailData.examName || `#${detailData.idExam || "-"}` }}</div>
        </div>
      </div>

      <a-form v-if="isDraftReview(detailData)" ref="detailFormRef" :model="detailFormState" layout="vertical">
        <UserSelectSubject v-model="detailFormState.idSubject" label="Môn phúc khảo" name="idSubject" placeholder="Chọn môn phúc khảo" :rules="detailFormRules.idSubject" />

        <a-form-item label="Lý do phúc khảo" name="reason" :rules="detailFormRules.reason">
          <a-textarea v-model:value="detailFormState.reason" :rows="4" :maxlength="1000" placeholder="Nhập lý do phúc khảo" show-count />
        </a-form-item>
      </a-form>

      <div v-else class="grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Họ tên</div>
          <div class="mt-1.5 font-medium text-slate-900">{{ detailData.fullName || "-" }}</div>
        </div>
        <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Môn phúc khảo</div>
          <div class="mt-1.5 font-medium text-slate-900">{{ detailData.subjectName || "-" }}</div>
        </div>
        <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:col-span-2">
          <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Lý do phúc khảo</div>
          <div class="mt-1.5 whitespace-pre-line font-medium text-slate-900">{{ detailData.reason || "-" }}</div>
        </div>
      </div>

      <div class="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <a-button @click="openApplicationDetail(detailData)">Xem hồ sơ</a-button>
        <a-button v-if="showPayAction(detailData)" type="primary" :loading="qrLoading" @click="() => openPaymentModal()">Thanh toán ngay</a-button>
        <a-button v-if="isDraftReview(detailData)" type="primary" :loading="saveLoading" @click="submitReviewUpdate">Cập nhật</a-button>
      </div>
    </div>
  </a-modal>

  <a-modal v-model:open="paymentVisible" title="Thanh toán phúc khảo" style="top: 0px" :width="960" :footer="null" @cancel="closePaymentModal">
    <div v-if="qrLoading" class="py-12 text-center">
      <a-spin size="large" />
    </div>

    <div v-else-if="qrData" class="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div class="rounded-2xl bg-white p-4 shadow-sm">
          <img :src="qrData.url" :alt="`QR thanh toán ${qrData.applicationCode}`" class="mx-auto h-auto w-full max-w-[280px]" />
        </div>
        <div class="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-center">
          <div class="text-xs uppercase tracking-[0.2em] text-amber-500">Nội dung chuyển khoản</div>
          <div class="mt-2 text-center text-xl font-bold tracking-[0.35em] text-amber-700">{{ qrData.code || "-" }}</div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Ngân hàng</div>
            <div class="mt-2 font-semibold text-slate-800">{{ qrData.bank || "-" }}</div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Số tài khoản</div>
            <div class="mt-2 font-semibold text-slate-800">{{ qrData.accountNo || "-" }}</div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Chủ tài khoản</div>
            <div class="mt-2 font-semibold uppercase text-slate-800">{{ qrData.accountName || "-" }}</div>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-slate-200">
          <div class="grid grid-cols-[180px_minmax(0,1fr)] border-b border-slate-200 bg-slate-50">
            <div class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Kỳ tuyển sinh</div>
            <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.examName || "-" }}</div>
          </div>
          <div class="grid grid-cols-[180px_minmax(0,1fr)] border-b border-slate-200">
            <div class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Mã hồ sơ</div>
            <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.applicationCode || "-" }}</div>
          </div>
          <div class="grid grid-cols-[180px_minmax(0,1fr)] border-b border-slate-200 bg-slate-50">
            <div class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Họ tên</div>
            <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.fullName || "-" }}</div>
          </div>
          <div class="grid grid-cols-[180px_minmax(0,1fr)] border-b border-slate-200">
            <div class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Lệ phí</div>
            <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ formatCurrency(qrData.fee) }}</div>
          </div>
          <div class="grid grid-cols-[180px_minmax(0,1fr)] bg-emerald-50">
            <div class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">Cần thanh toán</div>
            <div class="px-4 py-3 text-base font-bold text-emerald-700">{{ formatCurrency(qrData.fee) }}</div>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <a-button @click="closePaymentModal">Đóng</a-button>
          <a-button type="primary" class="min-w-40" :loading="confirmPaymentLoading" @click="confirmPayment">Xác nhận thanh toán</a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { canPayApplicationReview, getApplicationReviewStatusColor, getApplicationReviewStatusLabel, isDraftApplicationReviewStatus } from "~/composables/useApplicationReviewStatus";

definePageMeta({
  layout: "default",
});

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const message = useSafeMessage();
const searchText = ref("");
const loadError = ref("");
const createVisible = ref(false);
const createApplicationLoading = ref(false);
const createApplicationError = ref("");
const createApplication = ref(null);
const createFormRef = ref();
const createSubmitting = ref(false);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailError = ref("");
const detailData = ref(null);
const selectedReviewRecord = ref(null);
const detailFormRef = ref();
const saveLoading = ref(false);
const paymentVisible = ref(false);
const qrData = ref(null);
const qrLoading = ref(false);
const confirmPaymentLoading = ref(false);

if (!userStore.token) {
  userStore.openLogin();
  await navigateTo("/");
}

const toPositiveNumber = value => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
};

const initialExamId = toPositiveNumber(route.query.idExam);
const selectedExamId = ref(initialExamId);
const { applicationUser, applicationReviewUser, examUser } = useApi();
const examNameCache = new Map();

const createFormState = reactive({
  idApplication: undefined,
  idSubject: undefined,
  reason: "",
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const params = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  idExam: initialExamId,
});

const createApplicationParams = ref({
  pageIndex: 1,
  pageSize: 100,
  search: "",
  idExam: initialExamId,
});

const detailFormState = reactive({
  idSubject: undefined,
  reason: "",
});

const detailFormRules = {
  idSubject: [{ required: true, message: "Vui lòng chọn môn phúc khảo", trigger: "change" }],
  reason: [{ required: true, message: "Vui lòng nhập lý do phúc khảo", trigger: "blur" }],
};

const createFormRules = {
  idApplication: [{ required: true, message: "Vui lòng chọn hồ sơ phúc khảo", trigger: "change" }],
  idSubject: [{ required: true, message: "Vui lòng chọn môn phúc khảo", trigger: "change" }],
  reason: [{ required: true, message: "Vui lòng nhập lý do phúc khảo", trigger: "blur" }],
};

const columns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Mã phúc khảo", dataIndex: "reviewCode", key: "reviewCode", width: 150 },
  { title: "Họ tên", dataIndex: "fullName", key: "fullName", width: 220, ellipsis: true },
  { title: "Môn phúc khảo", dataIndex: "subjectName", key: "subjectName", width: 180, ellipsis: true },
  { title: "Lý do", dataIndex: "reason", key: "reason", ellipsis: true },
  { title: "Lệ phí", dataIndex: "reviewFee", key: "reviewFee", width: 150, align: "right" },
  { title: "Trạng thái", dataIndex: "statusName", key: "statusName", width: 180, align: "center" },
  { title: "Thao tác", key: "action", width: 180, align: "center" },
];

const {
  data: reviewResponse,
  error: reviewError,
  pending,
  refresh: refreshReviews,
} = await applicationReviewUser.get({
  params,
  key: "user-application-review-list",
});

const {
  data: createApplicationsResponse,
  pending: createApplicationsPending,
  refresh: refreshCreateApplications,
} = await applicationUser.get({
  params: createApplicationParams,
  key: "user-application-review-create-application-list",
});

const dataSource = computed(() => {
  if (!reviewResponse.value?.success) {
    return [];
  }

  return Array.isArray(reviewResponse.value?.data?.items) ? reviewResponse.value.data.items : [];
});

const createApplicationOptions = computed(() => {
  if (!createApplicationsResponse.value?.success) return [];

  const items = Array.isArray(createApplicationsResponse.value?.data?.items) ? createApplicationsResponse.value.data.items : [];
  return items
    .filter(item => !item?.isDelete && item?.hasScores)
    .map(item => ({
      label: `${item.applicationCode || `#${item.id}`} - ${item.fullName || item.fullname || "-"} - ${item.examName || `#${item.idExam || "-"}`}`,
      value: item.id,
      application: item,
    }));
});

watch(
  () => reviewResponse.value,
  newValue => {
    if (newValue?.success) {
      pagination.total = Number(newValue.data?.total || 0);
      loadError.value = "";
      return;
    }

    if (newValue?.message) {
      loadError.value = newValue.message;
    }
  },
  { immediate: true },
);

watch(
  () => reviewError.value,
  error => {
    if (error) {
      loadError.value = error?.data?.message || error?.message || "Không tải được danh sách phúc khảo";
    }
  },
  { immediate: true },
);

watch(
  () => pending.value,
  isPending => {
    if (isPending) {
      loadError.value = "";
    }
  },
);

const replaceRouteQuery = queryPatch => {
  const nextQuery = { ...route.query };

  Object.entries(queryPatch).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      delete nextQuery[key];
      return;
    }

    nextQuery[key] = String(value);
  });

  return router.replace({
    path: route.path,
    query: nextQuery,
  });
};

const handleSearch = () => {
  params.value.search = searchText.value.trim();
  params.value.idExam = selectedExamId.value || undefined;
  createApplicationParams.value.idExam = params.value.idExam;
  params.value.pageIndex = 1;
  pagination.current = 1;
};

const handleExamChange = value => {
  selectedExamId.value = value || undefined;
  params.value.idExam = selectedExamId.value;
  createApplicationParams.value.idExam = selectedExamId.value;
  params.value.pageIndex = 1;
  pagination.current = 1;

  replaceRouteQuery({
    idExam: selectedExamId.value,
    idApplication: undefined,
  });
};

const resetFilters = () => {
  searchText.value = "";
  selectedExamId.value = undefined;
  params.value = {
    pageIndex: 1,
    pageSize: 10,
    search: "",
    idExam: undefined,
  };
  createApplicationParams.value.idExam = undefined;
  pagination.current = 1;
  pagination.pageSize = 10;
  replaceRouteQuery({
    idExam: undefined,
    idApplication: undefined,
  });
};

const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  params.value.pageIndex = page;
  params.value.pageSize = pageSize;
};

const getReviewStatusLabel = value => getApplicationReviewStatusLabel(value);
const getReviewStatusColor = value => getApplicationReviewStatusColor(value);
const isDraftReview = value => isDraftApplicationReviewStatus(value);
const showPayAction = value => canPayApplicationReview(value);

const formatCurrency = value => {
  if (value === undefined || value === null || value === "") {
    return "Chưa cập nhật";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value) || 0);
};

const openApplicationDetail = record => {
  if (!record?.idApplication) return;
  navigateTo(`/user/application/${record.idApplication}`);
};

const resetCreateForm = () => {
  createFormState.idApplication = undefined;
  createFormState.idSubject = undefined;
  createFormState.reason = "";
};

const syncCreateApplication = application => {
  const previousIdApplication = createFormState.idApplication;

  createApplication.value = application || null;
  createFormState.idApplication = toPositiveNumber(application?.id);

  if (previousIdApplication !== createFormState.idApplication) {
    createFormState.idSubject = undefined;
    createFormRef.value?.clearValidate?.(["idSubject"]);
  }

  const applicationExamId = toPositiveNumber(application?.idExam);
  if (applicationExamId) {
    selectedExamId.value = applicationExamId;
    params.value.idExam = applicationExamId;
    createApplicationParams.value.idExam = applicationExamId;
  }

  replaceRouteQuery({
    idApplication: createFormState.idApplication,
    idExam: applicationExamId || selectedExamId.value,
  });
};

const fetchCreateApplication = async id => {
  if (!import.meta.client) return;

  const idApplication = toPositiveNumber(id || createFormState.idApplication || route.query.idApplication);
  if (!idApplication) {
    createApplicationError.value = "Không xác định được hồ sơ phúc khảo";
    return;
  }

  createApplicationLoading.value = true;
  createApplicationError.value = "";

  try {
    const { data, error } = await applicationUser.getByRest("detail", {
      params: { id: idApplication },
      key: `user-application-review-create-application-${idApplication}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không tải được hồ sơ phúc khảo");
    }

    syncCreateApplication(data.value.data);
  } catch (error) {
    createApplication.value = null;
    createApplicationError.value = error?.message || "Không tải được hồ sơ phúc khảo";
    await closeCreateReview();
  } finally {
    createApplicationLoading.value = false;
  }
};

const filterCreateApplicationOption = (input, option) => {
  return `${option?.label || ""}`.toLowerCase().includes(`${input || ""}`.toLowerCase());
};

const handleCreateApplicationChange = async (value, option) => {
  const selectedApplication = option?.application;
  if (selectedApplication) {
    syncCreateApplication(selectedApplication);
    return;
  }

  createApplication.value = null;
  await fetchCreateApplication(value);
};

const openCreateReview = async () => {
  const idApplication = toPositiveNumber(route.query.idApplication);
  resetCreateForm();
  createApplication.value = null;
  createApplicationError.value = "";
  createVisible.value = true;

  if (idApplication) {
    await fetchCreateApplication(idApplication);
  } else {
    createApplicationParams.value.idExam = selectedExamId.value || undefined;
    await refreshCreateApplications();
  }
};

const closeCreateReview = async (options = {}) => {
  const shouldClearQuery = options?.clearQuery !== false;

  createVisible.value = false;
  createApplicationLoading.value = false;
  createApplicationError.value = "";
  createApplication.value = null;
  resetCreateForm();
  createFormRef.value?.clearValidate?.();

  if (shouldClearQuery && route.query.idApplication) {
    await replaceRouteQuery({ idApplication: undefined });
  }
};

const submitCreateReview = async () => {
  const idApplication = toPositiveNumber(createApplication.value?.id || createFormState.idApplication || route.query.idApplication);
  if (!idApplication) {
    message.error("Không xác định được hồ sơ phúc khảo");
    return;
  }

  try {
    await createFormRef.value?.validate();
  } catch {
    return;
  }

  createSubmitting.value = true;

  try {
    const { data, error } = await applicationReviewUser.post({
      body: {
        idApplication,
        idSubject: Number(createFormState.idSubject),
        reason: createFormState.reason.trim(),
      },
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Gửi yêu cầu phúc khảo thất bại");
    }

    message.success(data.value?.message || "Gửi yêu cầu phúc khảo thành công");
    await closeCreateReview({ clearQuery: false });
    await refreshReviews();
    await router.replace({
      path: route.path,
      query: {
        ...(selectedExamId.value ? { idExam: selectedExamId.value } : {}),
      },
    });
  } catch (error) {
    message.error(error?.message || "Gửi yêu cầu phúc khảo thất bại");
  } finally {
    createSubmitting.value = false;
  }
};

const syncDetailForm = detail => {
  detailFormState.idSubject = toPositiveNumber(detail?.idSubject);
  detailFormState.reason = detail?.reason || "";
};

const fetchExamName = async idExam => {
  const normalizedId = toPositiveNumber(idExam);
  if (!normalizedId) return null;

  if (examNameCache.has(normalizedId)) {
    return examNameCache.get(normalizedId);
  }

  const { data, error } = await examUser.getByRest("detail", {
    params: { id: normalizedId },
    key: `user-application-review-exam-detail-${normalizedId}-${Date.now()}`,
  });

  if (error.value || data.value?.success === false) return null;

  const examName = data.value?.data?.examName || null;
  if (examName) {
    examNameCache.set(normalizedId, examName);
  }

  return examName;
};

const resolveReviewDetail = async detail => {
  if (!detail || typeof detail !== "object") return null;

  const normalizedDetail = {
    ...selectedReviewRecord.value,
    ...detail,
    examName: detail.examName || selectedReviewRecord.value?.examName || null,
    applicationCode: detail.applicationCode || selectedReviewRecord.value?.applicationCode || null,
    subjectName: detail.subjectName || selectedReviewRecord.value?.subjectName || null,
  };

  if (normalizedDetail.examName) return normalizedDetail;

  const examName = await fetchExamName(normalizedDetail.idExam);
  return {
    ...normalizedDetail,
    examName: examName || normalizedDetail.examName,
  };
};

const fetchReviewDetail = async () => {
  if (!selectedReviewRecord.value?.id) {
    detailError.value = "Không xác định được yêu cầu phúc khảo";
    return;
  }

  detailLoading.value = true;
  detailError.value = "";

  try {
    const { data, error } = await applicationReviewUser.getByRest("detail", {
      params: { id: Number(selectedReviewRecord.value.id) },
      key: `user-application-review-detail-${selectedReviewRecord.value.id}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không tải được chi tiết phúc khảo");
    }

    detailData.value = await resolveReviewDetail(data.value.data);
    syncDetailForm(detailData.value);
  } catch (error) {
    detailData.value = null;
    detailError.value = error?.message || "Không tải được chi tiết phúc khảo";
  } finally {
    detailLoading.value = false;
  }
};

const openReviewDetail = async record => {
  if (!record?.id) return;

  selectedReviewRecord.value = record;
  detailVisible.value = true;
  detailData.value = null;
  qrData.value = null;
  await fetchReviewDetail();
};

const closeReviewDetail = () => {
  detailVisible.value = false;
  detailLoading.value = false;
  detailError.value = "";
  detailData.value = null;
  selectedReviewRecord.value = null;
  detailFormRef.value?.clearValidate?.();
};

const persistReviewUpdate = async ({ showSuccessMessage = true } = {}) => {
  if (!detailData.value?.id) {
    message.error("Không xác định được yêu cầu phúc khảo");
    return false;
  }

  if (!isDraftReview(detailData.value)) {
    return true;
  }

  try {
    await detailFormRef.value?.validate();
  } catch {
    return false;
  }

  try {
    const { data, error } = await applicationReviewUser.put({
      body: {
        id: Number(detailData.value.id),
        idSubject: Number(detailFormState.idSubject),
        reason: detailFormState.reason.trim(),
      },
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật phúc khảo thất bại");
    }

    if (showSuccessMessage) {
      message.success(data.value?.message || "Cập nhật phúc khảo thành công");
    }

    await Promise.all([fetchReviewDetail(), refreshReviews()]);
    return true;
  } catch (error) {
    message.error(error?.message || "Cập nhật phúc khảo thất bại");
    return false;
  }
};

const submitReviewUpdate = async () => {
  saveLoading.value = true;

  try {
    await persistReviewUpdate();
  } finally {
    saveLoading.value = false;
  }
};

const openPaymentModal = async (record = null) => {
  const targetRecord = record && record.id ? record : detailData.value;

  if (!targetRecord?.id) {
    message.error("Không xác định được yêu cầu phúc khảo");
    return;
  }

  detailData.value = targetRecord;
  qrData.value = null;
  paymentVisible.value = true;
  qrLoading.value = true;

  try {
    const { data, error } = await applicationReviewUser.getByRest("qr", {
      params: { id: Number(targetRecord.id) },
      key: `user-application-review-qr-${targetRecord.id}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không tải được thông tin thanh toán");
    }

    qrData.value = data.value.data;
  } catch (error) {
    paymentVisible.value = false;
    message.error(error?.message || "Không tải được thông tin thanh toán");
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
  if (!detailData.value?.idApplication) {
    message.error("Không xác định được hồ sơ thanh toán");
    return;
  }

  if (!qrData.value) {
    message.error("Không có thông tin thanh toán để xác nhận");
    return;
  }

  if (!qrData.value.code) {
    message.error("Không có nội dung chuyển khoản để xác nhận");
    return;
  }

  confirmPaymentLoading.value = true;

  try {
    if (detailVisible.value) {
      const isUpdated = await persistReviewUpdate({ showSuccessMessage: false });
      if (!isUpdated) {
        return;
      }
    }

    const { data, error } = await applicationReviewUser.putByRest("confirmPayment", {
      params: { idApplicationReview: Number(detailData.value.id) },
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Xác nhận thanh toán thất bại");
    }

    message.success(data.value?.message || "Xác nhận thanh toán thành công");
    closePaymentModal();
    if (detailVisible.value) {
      await fetchReviewDetail();
    }
    await refreshReviews();
  } catch (error) {
    message.error(error?.message || "Xác nhận thanh toán thất bại");
  } finally {
    confirmPaymentLoading.value = false;
  }
};

watch(
  () => route.query.idApplication,
  async value => {
    if (!import.meta.client) return;

    // if (toPositiveNumber(value) && !createVisible.value) {
    //   await openCreateReview();
    // }
  },
  { immediate: true },
);

useHead({
  title: "Danh sách phúc khảo",
});
</script>
