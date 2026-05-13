<template>
  <div class="min-h-screen bg-slate-50 px-2 py-2">
    <div class="mx-auto max-w-7xl">
      <section class="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
          <a-input-search v-model:value="searchText" placeholder="Tìm theo mã hồ sơ, họ tên, kỳ tuyển sinh..." allow-clear enter-button @search="handleSearch" />

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
        <div v-if="pending" class="py-16 text-center">
          <a-spin size="large" />
          <p class="mt-4 text-sm text-slate-500">Đang tải danh sách hồ sơ...</p>
        </div>

        <div v-else-if="loadError" class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
          <div class="text-base font-semibold text-rose-700">Không tải được danh sách hồ sơ</div>
          <p class="mt-2 text-sm text-rose-600">{{ loadError }}</p>
          <a-button type="primary" danger class="mt-4" @click="refreshApplications">Thử lại</a-button>
        </div>

        <template v-else>
          <div class="hidden overflow-x-auto lg:block">
            <ClientOnly>
              <a-table :columns="columns" :data-source="dataSource" :pagination="false" :row-key="record => record.id" :scroll="{ x: 1100 }" bordered size="middle">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'stt'">
                    {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
                  </template>

                  <template v-else-if="column.key === 'statusName'">
                    <a-tag :color="getStatusColor(record)">
                      {{ getStatusLabel(record) }}
                    </a-tag>
                  </template>

                  <template v-else-if="column.key === 'action'">
                    <div class="flex justify-center gap-3">
                      <a-button type="link" class="px-0" @click="openDetail(record)">Xem chi tiết</a-button>
                      <a-button v-if="record.hasScores" type="link" class="px-0" @click="openExamScoreModal(record)">Kết quả thi</a-button>
                      <a-button v-if="record.hasScores" type="link" class="px-0" @click="openReviewModal(record)">Phúc khảo</a-button>
                    </div>
                  </template>
                </template>
              </a-table>
            </ClientOnly>
          </div>

          <div class="space-y-4 lg:hidden">
            <article v-for="record in dataSource" :key="record.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ record.applicationCode || `#${record.id}` }}</div>
                  <h2 class="mt-2 text-lg font-bold text-slate-900">{{ record.fullname || "-" }}</h2>
                </div>
                <a-tag :color="getStatusColor(record)">
                  {{ getStatusLabel(record) }}
                </a-tag>
              </div>

              <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div class="rounded-xl bg-white px-4 py-3">
                  <dt class="text-xs uppercase tracking-[0.15em] text-slate-400">Kỳ tuyển sinh</dt>
                  <dd class="mt-2 font-medium text-slate-700">{{ record.examName || `#${record.idExam}` }}</dd>
                </div>
                <div class="rounded-xl bg-white px-4 py-3">
                  <dt class="text-xs uppercase tracking-[0.15em] text-slate-400">Mã hồ sơ</dt>
                  <dd class="mt-2 font-medium text-slate-700">{{ record.applicationCode || `#${record.id}` }}</dd>
                </div>
              </dl>

              <div class="mt-4 flex flex-wrap justify-end gap-2">
                <a-button v-if="record.hasScores" class="rounded-xl" @click="openExamScoreModal(record)">Kết quả thi</a-button>
                <a-button v-if="record.hasScores" class="rounded-xl" @click="openReviewModal(record)">Phúc khảo</a-button>
                <a-button type="primary" class="rounded-xl" @click="openDetail(record)">Xem chi tiết</a-button>
              </div>
            </article>
          </div>

          <div v-if="pagination.total > pagination.pageSize" class="mt-6 flex justify-center">
            <a-pagination v-model:current="pagination.current" v-model:page-size="pagination.pageSize" :total="pagination.total" :show-size-changer="true" :page-size-options="['10', '20', '50', '100']" :show-total="total => `Tổng ${total} hồ sơ`" @change="handlePageChange" />
          </div>
        </template>
      </section>
    </div>
  </div>

  <a-modal v-model:open="examScoreVisible" title="Kết quả kỳ tuyển sinh" :width="720" :footer="null" centered @cancel="closeExamScoreModal">
    <div v-if="examScoreLoading" class="py-12 text-center">
      <a-spin size="large" />
      <p class="mt-4 text-sm text-slate-500">Đang tải kết quả thi...</p>
    </div>

    <div v-else-if="examScoreError" class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
      <div class="text-base font-semibold text-rose-700">Không tải được kết quả thi</div>
      <p class="mt-2 text-sm text-rose-600">{{ examScoreError }}</p>
      <a-button type="primary" danger class="mt-4" @click="fetchExamScore">Thử lại</a-button>
    </div>

    <div v-else-if="examScoreData" class="space-y-6">
      <section>
        <h3 class="text-base font-bold text-cyan-700">Thông tin dự thi</h3>
        <div class="mt-4 grid gap-4 border-b border-slate-200 pb-5 text-sm sm:grid-cols-2">
          <div>
            <span class="text-slate-500">Số báo danh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ examScoreData.examNumber || "-" }}</span>
          </div>
          <div>
            <span class="text-slate-500">Mã hồ sơ:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ examScoreData.applicationCode || "-" }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-500">Họ tên:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ examScoreData.fullName || "-" }}</span>
          </div>
        </div>
      </section>

      <section>
        <h3 class="text-base font-bold text-cyan-700">Thông tin điểm thi</h3>
        <div class="mt-4 grid gap-4 border-b border-slate-200 pb-5 text-sm sm:grid-cols-3">
          <div>
            <span>Toán:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(examScoreData.mathScore) }}</span>
          </div>
          <div>
            <span>Ngữ Văn:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(examScoreData.literatureScore) }}</span>
          </div>
          <div>
            <span>Tiếng Anh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(examScoreData.englishScore) }}</span>
          </div>
          <div class="font-semibold sm:col-span-3">
            <span>Tổng điểm:</span>
            <span class="ml-2 text-slate-900">{{ totalExamScore }}</span>
          </div>
        </div>
      </section>

      <section>
        <h3 class="text-base font-bold text-cyan-700">Thông tin điểm sau phúc khảo</h3>
        <div class="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <span>Toán:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatReviewScore(examScoreData.reviewMathScore, examScoreData.mathScore) }}</span>
          </div>
          <div>
            <span>Ngữ Văn:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatReviewScore(examScoreData.reviewLiteratureScore, examScoreData.literatureScore) }}</span>
          </div>
          <div>
            <span>Tiếng Anh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatReviewScore(examScoreData.reviewEnglishScore, examScoreData.englishScore) }}</span>
          </div>
        </div>
      </section>

      <div class="flex justify-end pt-6">
        <a-button class="min-w-24" @click="closeExamScoreModal">Quay lại</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { getApplicationStatusColor, getApplicationStatusLabel } from "~/composables/useApplicationStatus";

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
const { applicationUser, examScoreUser } = useApi();

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
  { title: "Mã hồ sơ", dataIndex: "applicationCode", key: "applicationCode", width: 150 },
  { title: "Kỳ tuyển sinh", dataIndex: "examName", key: "examName", ellipsis: true },
  { title: "Họ tên", dataIndex: "fullname", key: "fullname", ellipsis: true },
  { title: "Trạng thái", dataIndex: "statusName", key: "statusName", width: 200, align: "center" },
  { title: "Thao tác", key: "action", width: 300, align: "center" },
];

const examScoreVisible = ref(false);
const examScoreLoading = ref(false);
const examScoreError = ref("");
const examScoreData = ref(null);
const selectedScoreApplicationId = ref(undefined);

const {
  data: applicationResponse,
  error: applicationError,
  pending,
  refresh: refreshApplications,
} = await applicationUser.get({
  params,
  key: "user-application-list",
});

const dataSource = computed(() => {
  if (!applicationResponse.value?.success) {
    return [];
  }

  const items = Array.isArray(applicationResponse.value?.data?.items) ? applicationResponse.value.data.items : [];
  return items.filter(item => !item?.isDelete);
});

watch(
  () => applicationResponse.value,
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
  () => applicationError.value,
  error => {
    if (error) {
      loadError.value = error?.data?.message || error?.message || "Không tải được danh sách hồ sơ";
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

const getStatusColor = value => getApplicationStatusColor(value);
const getStatusLabel = value => getApplicationStatusLabel(value);

const normalizeScoreNumber = value => {
  if (value === null || value === undefined || value === "") return null;
  const normalizedValue = typeof value === "string" ? value.replace(",", ".").trim() : value;
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const formatScore = value => {
  if (value === null || value === undefined || value === "") return "-";

  const numericScore = normalizeScoreNumber(value);
  if (numericScore === null) return String(value);

  return numericScore.toFixed(2).replace(/\.?0+$/, "");
};

const formatReviewScore = (reviewScore, originalScore) => {
  if (reviewScore === null || reviewScore === undefined || reviewScore === "") {
    return formatScore(originalScore);
  }

  return formatScore(reviewScore);
};

const totalExamScore = computed(() => {
  if (!examScoreData.value) return "-";

  const scores = [examScoreData.value.mathScore, examScoreData.value.literatureScore, examScoreData.value.englishScore].map(normalizeScoreNumber);
  const validScores = scores.filter(score => score !== null);
  if (!validScores.length) return "-";

  return `${validScores.reduce((total, score) => total + score, 0).toFixed(2).replace(/\.?0+$/, "")} điểm`;
});

const openDetail = record => {
  if (!record?.id) return;
  navigateTo(`/user/application/${record.id}`);
};

const fetchExamScore = async () => {
  const idApplication = toPositiveNumber(selectedScoreApplicationId.value);
  if (!idApplication) {
    examScoreError.value = "Không xác định được hồ sơ";
    return;
  }

  examScoreLoading.value = true;
  examScoreError.value = "";

  try {
    const { data, error } = await examScoreUser.getByRest("detail", {
      params: { idApplication },
      key: `user-exam-score-detail-${idApplication}-${Date.now()}`,
    });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không tải được kết quả thi");
    }

    examScoreData.value = data.value.data;
  } catch (error) {
    examScoreData.value = null;
    examScoreError.value = error?.message || "Không tải được kết quả thi";
  } finally {
    examScoreLoading.value = false;
  }
};

const openExamScoreModal = async record => {
  const idApplication = toPositiveNumber(record?.id);
  if (!idApplication || !record?.hasScores) return;

  selectedScoreApplicationId.value = idApplication;
  examScoreData.value = null;
  examScoreError.value = "";
  examScoreVisible.value = true;

  await fetchExamScore();
};

const closeExamScoreModal = () => {
  examScoreVisible.value = false;
  examScoreLoading.value = false;
  examScoreError.value = "";
  examScoreData.value = null;
  selectedScoreApplicationId.value = undefined;
};

const openReviewModal = record => {
  const idApplication = toPositiveNumber(record?.id);
  const idExam = toPositiveNumber(record?.idExam);
  if (!idApplication || !record?.hasScores) return;

  navigateTo({
    path: "/user/application/review",
    query: {
      idApplication,
      ...(idExam ? { idExam } : {}),
    },
  });
};

useHead({
  title: "Danh sách hồ sơ cá nhân",
});
</script>
