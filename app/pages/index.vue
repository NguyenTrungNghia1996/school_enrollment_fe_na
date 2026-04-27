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
                  <h3 class="text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">
                    {{ exam.title }}
                  </h3>
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
                  <a-button
                    block
                    type="primary"
                    class="h-11 rounded-lg bg-primary font-bold hover:bg-primary/90"
                    :disabled="exam.isClosed"
                    @click="handleRegistration(exam)">
                    ĐĂNG KÝ NGAY
                  </a-button>
                </div>
              </article>
            </div>

            <div v-if="loading && !exams.length" class="py-10 text-center">
              <a-spin size="large" />
            </div>

            <div v-if="!loading && !exams.length" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">Chưa có kỳ khảo thí nào để hiển thị.</div>

            <div v-if="examsExpanded && examTotal > expandedPageSize" class="flex justify-center pt-8">
              <a-pagination
                v-model:current="pageIndex"
                :total="examTotal"
                :page-size="expandedPageSize"
                :show-size-changer="false"
                @change="handleExamPageChange" />
            </div>
          </section>

          <!-- Notifications Section -->
          <section>
            <div class="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 class="flex items-center gap-3 text-2xl font-bold text-slate-800">
                <Icon name="lucide:megaphone" class="text-primary" />
                Thông Báo Quan Trọng
              </h2>
            </div>
            <div class="space-y-4">
              <div v-for="i in 3" :key="i" class="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-white hover:shadow-sm">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                  <Icon name="lucide:file-text" class="text-2xl" />
                </div>
                <div>
                  <h4 class="font-bold text-slate-900">Danh sách phòng thi kỳ thi Olympic hóa học năm 2026</h4>
                  <p class="mt-1 text-sm text-slate-500">Đăng ngày: 20/03/2026</p>
                </div>
              </div>
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
            <a-button block ghost class="mt-8 h-12 rounded-lg border-white/20 font-bold hover:bg-white hover:text-slate-900">GỬI YÊU CẦU HỖ TRỢ</a-button>
          </div>

          <!-- Statistics -->
          <div class="rounded-2xl border border-slate-200 bg-white p-8">
            <h3 class="mb-6 text-lg font-bold uppercase tracking-wider text-slate-900">Thống kê cổng</h3>
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-500">Hồ sơ đã tiếp nhận</span>
                <span class="text-xl font-bold text-primary">3,492</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-500">Đợt thi hiện tại</span>
                <span class="text-xl font-bold text-primary">{{ examTotal }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-500">Lượt truy cập</span>
                <span class="text-xl font-bold text-primary">12K+</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $dayjs } = useNuxtApp();
const unitStore = useUnitStore();
const userStore = useUserStore();
const { examUser } = useApi();

const INITIAL_PAGE_SIZE = 3;
const EXPANDED_PAGE_SIZE = 6;
const exams = ref([]);
const examTotal = ref(0);
const pageIndex = ref(1);
const loading = ref(false);
const examsExpanded = ref(false);
const examSearchText = ref("");
const pageSize = computed(() => (examsExpanded.value ? EXPANDED_PAGE_SIZE : INITIAL_PAGE_SIZE));
const expandedPageSize = computed(() => EXPANDED_PAGE_SIZE);
const showViewMoreButton = computed(() => !examsExpanded.value && examTotal.value > INITIAL_PAGE_SIZE);

const getExamStatus = exam => {
  const now = $dayjs();
  const startDate = $dayjs(exam.startDate);
  const endDate = $dayjs(exam.endDate);

  if (now.isBefore(startDate)) {
    return {
      label: "Sắp mở",
      badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
      isClosed: true,
    };
  }

  if (now.isAfter(endDate)) {
    return {
      label: "Đã đóng",
      badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
      isClosed: true,
    };
  }

  return {
    label: "Đang mở",
    badgeClass: "bg-primary/10 text-primary ring-primary/10",
    isClosed: false,
  };
};

const mapExamItem = exam => {
  const status = getExamStatus(exam);

  return {
    id: exam.id,
    title: exam.examName,
    start: $dayjs(exam.startDate).format("DD/MM/YYYY"),
    end: $dayjs(exam.endDate).format("DD/MM/YYYY"),
    status: status.label,
    badgeClass: status.badgeClass,
    isClosed: status.isClosed,
    raw: exam,
  };
};

const fetchExams = async () => {
  loading.value = true;

  try {
    const { data, error } = await examUser.get({
      query: {
        pageIndex: pageIndex.value,
        pageSize: pageSize.value,
        search: examSearchText.value.trim(),
      },
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không tải được danh sách kỳ khảo thí");
    }

    const items = Array.isArray(data.value?.data?.items) ? data.value.data.items : [];
    exams.value = items.map(mapExamItem);
    examTotal.value = Number(data.value?.data?.total || 0);
  } catch (error) {
    exams.value = [];
    examTotal.value = 0;
    message.error(error?.message || "Không tải được danh sách kỳ khảo thí");
  } finally {
    loading.value = false;
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

await fetchExams();

const handleRegistration = exam => {
  if (!userStore.token) {
    message.warning("Bạn cần phàn đăng nhập để thực hiện thao tác này");
    userStore.openLogin();
  } else {
    message.info(`Đang chuyển tới trang đăng ký cho: ${exam.title}`);
  }
};

const handleCta = () => {
  if (!userStore.token) {
    userStore.openLogin();
  } else {
    message.success("Chào mừng bạn quay lại!");
  }
};
</script>

<style scoped>
/* Optional: specific styles for hero background */
</style>
