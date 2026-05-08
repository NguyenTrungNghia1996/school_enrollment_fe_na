<template>
  <div class="min-h-screen bg-slate-50 px-2 py-2">
    <div class="mx-auto max-w-7xl">
      <section class="rounded-3xl bg-white p-6 shadow-sm">
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
              <a-table :columns="columns" :data-source="dataSource" :pagination="false" :row-key="record => record.id" :scroll="{ x: 1200 }" bordered size="middle">
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
                    <div class="flex justify-center">
                      <a-button type="link" class="px-0" @click="openApplicationDetail(record)">Xem hồ sơ</a-button>
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

              <div class="mt-4 flex justify-end">
                <a-button type="primary" class="rounded-xl" @click="openApplicationDetail(record)">Xem hồ sơ</a-button>
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
</template>

<script setup>
definePageMeta({
  layout: "default",
});

const userStore = useUserStore();
const route = useRoute();
const searchText = ref("");
const loadError = ref("");

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
const { applicationReviewUser } = useApi();

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

const columns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Mã phúc khảo", dataIndex: "reviewCode", key: "reviewCode", width: 150 },
  { title: "Họ tên", dataIndex: "fullName", key: "fullName", width: 220, ellipsis: true },
  { title: "Môn phúc khảo", dataIndex: "subjectName", key: "subjectName", width: 180, ellipsis: true },
  { title: "Lý do", dataIndex: "reason", key: "reason", ellipsis: true },
  { title: "Lệ phí", dataIndex: "reviewFee", key: "reviewFee", width: 150, align: "right" },
  { title: "Trạng thái", dataIndex: "statusName", key: "statusName", width: 180, align: "center" },
  { title: "Thao tác", key: "action", width: 130, align: "center" },
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

const dataSource = computed(() => {
  if (!reviewResponse.value?.success) {
    return [];
  }

  return Array.isArray(reviewResponse.value?.data?.items) ? reviewResponse.value.data.items : [];
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

const handleSearch = () => {
  params.value.search = searchText.value.trim();
  params.value.idExam = selectedExamId.value || undefined;
  params.value.pageIndex = 1;
  pagination.current = 1;
};

const handleExamChange = value => {
  selectedExamId.value = value || undefined;
  params.value.idExam = selectedExamId.value;
  params.value.pageIndex = 1;
  pagination.current = 1;
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
  pagination.current = 1;
  pagination.pageSize = 10;
};

const handlePageChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  params.value.pageIndex = page;
  params.value.pageSize = pageSize;
};

const getReviewStatusLabel = record => record?.statusName || "Không xác định";

const getReviewStatusColor = record => {
  const status = Number(record?.idApplicationReviewStatus);

  if (status === 1) return "default";
  if (status === 2) return "processing";
  if (status === 3) return "warning";
  if (status === 4) return "success";

  const normalizedStatusName = String(record?.statusName || "").toLowerCase();

  if (normalizedStatusName.includes("hoàn thành")) return "success";
  if (normalizedStatusName.includes("chờ") || normalizedStatusName.includes("xử lý")) return "processing";
  if (normalizedStatusName.includes("từ chối")) return "error";

  return "default";
};

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

useHead({
  title: "Danh sách phúc khảo",
});
</script>
