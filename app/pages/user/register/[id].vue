<template>
  <div class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6">
        <a-button type="text" class="!px-0 text-slate-500" @click="navigateTo('/')">
          <template #icon>
            <Icon name="lucide:arrow-left" />
          </template>
          Quay lại trang chủ
        </a-button>
      </div>

      <div v-if="loading" class="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
        <a-spin size="large" />
        <p class="mt-4 text-slate-500">Đang tải thông tin kỳ khảo thí...</p>
      </div>

      <div v-else-if="loadError" class="rounded-3xl border border-rose-200 bg-white px-6 py-16 text-center shadow-sm">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
          <Icon name="lucide:shield-x" class="text-3xl text-rose-500" />
        </div>
        <h1 class="mt-5 text-2xl font-bold text-slate-900">Không tải được kỳ khảo thí</h1>
        <p class="mt-3 text-slate-500">{{ loadError }}</p>
        <a-button type="primary" class="mt-6 h-11 rounded-xl px-6 font-bold" @click="fetchExamDetail">Thử lại</a-button>
      </div>

      <div v-else-if="examDetail" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section class="space-y-6">
          <div class="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div class="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="mb-3">
                  <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]" :class="status.badgeClass">
                    {{ status.label }}
                  </span>
                </div>
                <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">{{ examDetail.examName }}</h1>
                <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Kiểm tra thông tin kỳ khảo thí, chuẩn bị đầy đủ hồ sơ yêu cầu và hoàn tất các bước đăng ký trong thời gian mở cổng.</p>
              </div>

              <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div class="font-semibold text-slate-900">Mã kỳ khảo thí</div>
                <div class="mt-1 font-mono text-xs">#{{ examDetail.id }}</div>
              </div>
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Bắt đầu</div>
                <div class="mt-2 text-base font-bold text-slate-900">{{ formatDateTime(examDetail.startDate) }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Kết thúc</div>
                <div class="mt-2 text-base font-bold text-slate-900">{{ formatDateTime(examDetail.endDate) }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lệ phí</div>
                <div class="mt-2 text-base font-bold text-slate-900">{{ formatCurrency(examDetail.fee) }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Số lượng</div>
                <div class="mt-2 text-base font-bold text-slate-900">{{ examDetail.quantity || 0 }}</div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon name="lucide:book-check" class="text-2xl" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-900">Danh sách môn thi</h2>
                <p class="text-sm text-slate-500">Các môn áp dụng cho kỳ khảo thí này.</p>
              </div>
            </div>

            <div v-if="examDetail.subjectIds?.length" class="mt-6 flex flex-wrap gap-3">
              <span v-for="subjectId in examDetail.subjectIds" :key="subjectId" class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">Môn #{{ subjectId }}</span>
            </div>
            <div v-else class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">Chưa cấu hình môn thi cho kỳ khảo thí này.</div>
          </div>

          <div class="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Icon name="lucide:file-stack" class="text-2xl" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-slate-900">Hồ sơ cần chuẩn bị</h2>
                <p class="text-sm text-slate-500">Đảm bảo chuẩn bị đúng loại giấy tờ trước khi nộp hồ sơ.</p>
              </div>
            </div>

            <div v-if="examDetail.documents?.length" class="mt-6 space-y-3">
              <div v-for="(document, index) in examDetail.documents" :key="`${document.documentName}-${index}`" class="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <div class="font-semibold text-slate-900">{{ document.documentName }}</div>
                  <div class="mt-1 text-sm text-slate-500">{{ document.isRequired ? "Bắt buộc nộp" : "Khuyến khích bổ sung" }}</div>
                </div>
                <span class="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]" :class="document.isRequired ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'">
                  {{ document.isRequired ? "Bắt buộc" : "Tùy chọn" }}
                </span>
              </div>
            </div>
            <div v-else class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">Kỳ khảo thí này chưa có danh sách hồ sơ yêu cầu.</div>
          </div>
        </section>

        <aside class="space-y-6">
          <div class="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
            <h2 class="text-xl font-bold">Đăng ký kỳ khảo thí</h2>
            <p class="mt-3 text-sm leading-6 text-slate-300">Trang này đang hiển thị thông tin chi tiết của kỳ khảo thí. Khi có API nộp hồ sơ đăng ký, có thể nối trực tiếp tại đây.</p>

            <div class="mt-6 space-y-3">
              <div class="rounded-2xl bg-white/10 px-4 py-3">
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</div>
                <div class="mt-2 font-bold">{{ status.label }}</div>
              </div>
              <div class="rounded-2xl bg-white/10 px-4 py-3">
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Thời gian còn lại</div>
                <div class="mt-2 font-bold">{{ remainingText }}</div>
              </div>
            </div>

            <a-button block type="primary" size="large" class="mt-6 h-12 rounded-2xl font-bold" :disabled="status.isClosed">Tiếp tục đăng ký</a-button>
          </div>

          <div class="rounded-3xl bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900">Lưu ý</h3>
            <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-500">
              <li>Đăng ký chỉ thực hiện được khi kỳ khảo thí đang mở.</li>
              <li>Thời gian và hồ sơ có thể được nhà trường cập nhật thêm.</li>
              <li>Kiểm tra lại thông tin cá nhân trước khi nộp hồ sơ chính thức.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
});

const route = useRoute();
const { $dayjs } = useNuxtApp();
const { examUser } = useApi();

const examDetail = ref(null);
const loading = ref(true);
const loadError = ref("");

const examId = computed(() => {
  const rawId = route.params.id;
  const value = Array.isArray(rawId) ? rawId[0] : rawId;
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
});

const status = computed(() => {
  const exam = examDetail.value;
  if (!exam) {
    return {
      label: "Không xác định",
      badgeClass: "bg-slate-100 text-slate-500",
      isClosed: true,
    };
  }

  const now = $dayjs();
  const startDate = $dayjs(exam.startDate);
  const endDate = $dayjs(exam.endDate);

  if (now.isBefore(startDate)) {
    return {
      label: "Sắp mở",
      badgeClass: "bg-sky-50 text-sky-700",
      isClosed: true,
    };
  }

  if (now.isAfter(endDate)) {
    return {
      label: "Đã đóng",
      badgeClass: "bg-slate-100 text-slate-600",
      isClosed: true,
    };
  }

  return {
    label: "Đang mở",
    badgeClass: "bg-emerald-50 text-emerald-700",
    isClosed: false,
  };
});

const remainingText = computed(() => {
  const exam = examDetail.value;
  if (!exam) return "-";

  const now = $dayjs();
  const startDate = $dayjs(exam.startDate);
  const endDate = $dayjs(exam.endDate);

  if (now.isBefore(startDate)) {
    return `Mở sau ${startDate.from(now, true)}`;
  }

  if (now.isAfter(endDate)) {
    return "Kỳ khảo thí đã kết thúc";
  }

  return `Còn ${endDate.from(now, true)}`;
});

const formatDateTime = value => {
  if (!value) return "-";
  return $dayjs(value).format("DD/MM/YYYY HH:mm");
};

const formatCurrency = value => {
  if (value === undefined || value === null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const fetchExamDetail = async () => {
  loading.value = true;
  loadError.value = "";

  try {
    if (!examId.value) {
      throw new Error("Mã kỳ khảo thí không hợp lệ.");
    }

    const { data, error } = await examUser.getByRest("detail", { params: { id: examId.value } });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể tải thông tin kỳ khảo thí.");
    }

    examDetail.value = data.value.data;
  } catch (error) {
    examDetail.value = null;
    loadError.value = error?.message || "Không thể tải thông tin kỳ khảo thí.";
  } finally {
    loading.value = false;
  }
};

watch(
  examId,
  () => {
    fetchExamDetail();
  },
  { immediate: true },
);
</script>
