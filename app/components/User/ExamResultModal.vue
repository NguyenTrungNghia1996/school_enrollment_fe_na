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
      <section>
        <h3 class="text-base font-bold text-cyan-700">Thông tin dự thi</h3>
        <div class="mt-4 grid gap-4 border-b border-slate-200 pb-5 text-sm sm:grid-cols-2">
          <div class="sm:col-span-2">
            <span class="text-slate-500">Kỳ tuyển sinh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ result.examName || "-" }}</span>
          </div>
          <div>
            <span class="text-slate-500">Số báo danh:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ result.examNumber || "-" }}</span>
          </div>
          <div>
            <span class="text-slate-500">Phòng thi:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ result.room || "-" }}</span>
          </div>
          <div class="sm:col-span-2">
            <span class="text-slate-500">Họ tên:</span>
            <span class="ml-2 font-semibold text-slate-900">{{ result.fullName || "-" }}</span>
          </div>
        </div>
      </section>

      <section v-if="canDisplayScores">
        <h3 class="text-base font-bold text-cyan-700">Thông tin điểm thi</h3>
        <div class="mt-4 grid gap-4 border-slate-200 pb-5 text-sm sm:grid-cols-3">
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
          <div class="font-semibold sm:col-span-3">
            <span>Tổng điểm:</span>
            <span class="ml-2 text-slate-900">{{ totalScore }}</span>
          </div>
        </div>
      </section>

      <section v-if="canDisplayAdmission && admissionResult" class="border-t border-slate-200 pt-5">
        <h3 class="text-base font-bold text-cyan-700">Thông tin kết quả tuyển sinh</h3>
        <div class="mt-5 space-y-4 text-sm leading-6 text-slate-800">
          <div class="text-base font-bold uppercase text-slate-950">[{{ admissionResult.title }}]</div>
          <p class="mb-0">{{ admissionResult.description }}</p>
        </div>
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
  const scores = [result.value?.mathScore, result.value?.literatureScore, result.value?.englishScore].map(normalizeScore);
  return scores.some(score => score === null) ? "-" : formatScore(scores.reduce((sum, score) => sum + score, 0));
});
const admissionResult = computed(() => {
  if (result.value?.isDirect === true) return { title: "Trúng tuyển thẳng", description: "Chúc mừng thí sinh đã trúng tuyển thẳng." };
  if (result.value?.isAdmitted === true) return { title: "Trúng tuyển", description: "Chúc mừng thí sinh đã trúng tuyển." };
  if (result.value?.isAdmitted === false) return { title: "Không trúng tuyển", description: "Thí sinh chưa đạt điều kiện trúng tuyển trong kỳ tuyển sinh này." };
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
