<template>
  <a-modal :open="open" title="Kết quả kỳ tuyển sinh" :width="720" :footer="null" centered @cancel="emit('close')">
    <div v-if="loading" class="py-12 text-center">
      <a-spin size="large" />
      <p class="mt-4 text-sm text-slate-500">Đang tải kết quả thi...</p>
    </div>

    <div v-else-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-center">
      <div class="text-base font-semibold text-rose-700">Không tải được kết quả thi</div>
      <p class="mt-2 text-sm text-rose-600">{{ errorMessage }}</p>
      <a-button type="primary" danger class="mt-4" @click="fetchResult">Thử lại</a-button>
    </div>

    <div v-else-if="result" class="space-y-6">
      <section class="rounded-2xl border border-slate-200 p-5">
        <h3 class="text-base font-bold text-cyan-700">Thông tin học sinh</h3>
        <div class="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <span class="text-slate-500">Họ và tên:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ result.fullName || "-" }}</span>
          </div>
          <div>
            <span class="text-slate-500">Mã học sinh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ studentCode }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-500">Kỳ tuyển sinh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ result.examName || "-" }}</span>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 p-5">
        <h3 class="text-base font-bold text-cyan-700">Phòng kiểm tra</h3>
        <div class="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <span class="text-slate-500">Số báo danh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ result.examNumber || "-" }}</span>
          </div>
          <div>
            <span class="text-slate-500">Phòng kiểm tra:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ result.room || "-" }}</span>
          </div>
        </div>
      </section>

      <section v-if="canDisplayScores" class="rounded-2xl border border-slate-200 p-5">
        <h3 class="text-base font-bold text-cyan-700">Kết quả kiểm tra đánh giá năng lực</h3>
        <div class="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <span>Toán:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(result.mathScore) }}</span>
          </div>
          <div>
            <span>Ngữ Văn:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(result.literatureScore) }}</span>
          </div>
          <div>
            <span>Tiếng Anh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(result.englishScore) }}</span>
          </div>
          <div>
            <span>Điểm ưu tiên:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(priorityPoint) }}</span>
          </div>
          <div>
            <span>Điểm khuyến khích:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(bonusPoint) }}</span>
          </div>
          <div>
            <span>Điểm chuẩn trúng tuyển:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ formatScore(admissionScore) }}</span>
          </div>
          <div class="border-t border-slate-200 pt-4 font-semibold sm:col-span-3">
            <span>Tổng điểm:</span>
            <span class="ml-2 text-lg text-slate-900">{{ formatScore(totalScore) }}</span>
          </div>
        </div>
      </section>

      <section v-if="canDisplayAdmission && admissionResult" class="rounded-2xl border p-5" :class="admissionResult.className">
        <h3 class="text-base font-bold">Kết quả</h3>
        <div class="mt-3 text-xl font-extrabold uppercase">{{ admissionResult.title }}</div>
      </section>

      <div class="flex justify-end pt-6"><a-button class="min-w-24" @click="emit('close')">Quay lại</a-button></div>
    </div>
  </a-modal>
</template>

<script setup>
const props = defineProps({ open: Boolean, applicationId: { type: Number, default: undefined } });
const emit = defineEmits(["close"]);
const { examScoreUser } = useApi();
const loading = ref(false);
const errorMessage = ref("");
const result = ref(null);
const EXAM_STATUS = { SUMMARIZED: 3, COMPLETED: 4 };

const statusId = computed(() => Number(result.value?.idExamStatus));
const canDisplayScores = computed(() => Number.isFinite(statusId.value) && statusId.value >= EXAM_STATUS.SUMMARIZED);
const canDisplayAdmission = computed(() => Number.isFinite(statusId.value) && statusId.value >= EXAM_STATUS.COMPLETED);
const studentCode = computed(() => result.value?.studentCode || result.value?.student_code || result.value?.applicationCode || "-");
const priorityPoint = computed(() => result.value?.priority_point ?? result.value?.priorityPoint);
const bonusPoint = computed(() => result.value?.bonus_point ?? result.value?.bonusPoint);
const admissionScore = computed(() => result.value?.admissionScore ?? result.value?.cutoffScore ?? result.value?.benchmarkScore ?? result.value?.passingScore);

const normalizeScore = value => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(typeof value === "string" ? value.replace(",", ".") : value);
  return Number.isFinite(parsed) ? parsed : null;
};
const formatScore = value => {
  const score = normalizeScore(value);
  return score === null ? "-" : score.toFixed(2).replace(/\.?0+$/, "");
};
const totalScore = computed(() => {
  const subjectScores = [result.value?.mathScore, result.value?.literatureScore, result.value?.englishScore].map(normalizeScore);
  if (subjectScores.some(score => score === null)) return null;

  const extraScores = [priorityPoint.value, bonusPoint.value].map(normalizeScore);
  return [...subjectScores, ...extraScores].reduce((total, score) => total + (score ?? 0), 0);
});
const admissionResult = computed(() => {
  if (result.value?.isDirect === true || result.value?.isAdmitted === true) return { title: "Trúng tuyển", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (result.value?.isAdmitted === false) return { title: "Không trúng tuyển", className: "border-rose-200 bg-rose-50 text-rose-700" };
  return null;
});

const fetchResult = async () => {
  if (!props.applicationId) return;
  loading.value = true;
  errorMessage.value = "";
  result.value = null;
  try {
    const { data, error } = await examScoreUser.getByRest("detail", { params: { idApplication: props.applicationId }, key: `home-exam-result-${props.applicationId}-${Date.now()}` });
    if (error.value || data.value?.success === false || !data.value?.data) throw new Error(error.value?.data?.message || data.value?.message || "Không tải được kết quả thi");
    result.value = data.value.data;
  } catch (error) {
    errorMessage.value = error?.message || "Không tải được kết quả thi";
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.open, props.applicationId],
  ([open, id]) => {
    if (open && id) fetchResult();
  },
  { immediate: true },
);
</script>
