<template>
  <div class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
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
        <section class="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div class="border-b border-slate-100 px-6 py-6 sm:px-8">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div class="mb-3">
                  <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]" :class="status.badgeClass">
                    {{ status.label }}
                  </span>
                </div>
                <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">{{ examDetail.examName }}</h1>
              </div>

              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Thời gian còn lại</div>
                  <div class="mt-2 font-bold text-slate-900">{{ remainingText }}</div>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lệ phí</div>
                  <div class="mt-2 font-bold text-slate-900">{{ formatCurrency(examDetail.fee) }}</div>
                </div>
              </div>
            </div>
          </div>

          <a-form ref="formRef" :model="formState" layout="vertical" class="px-6 py-6 sm:px-8" @finish="handleSubmit">
            <section class="border-b border-slate-100 pb-8">
              <h2 class="text-base font-semibold text-sky-700">Thông tin thí sinh</h2>
              <div class="mt-5 grid gap-x-4 gap-y-1 md:grid-cols-3">
                <a-form-item label="Ảnh 3x4" name="avatar" class="md:col-span-3">
                  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div class="flex flex-col gap-4 md:flex-row md:items-start">
                      <button type="button" class="flex h-48 w-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white" :class="formState.avatar ? 'cursor-pointer' : 'cursor-default'" :disabled="!formState.avatar" @click="openAvatarPreview">
                        <img v-if="formState.avatar" :src="formState.avatar" alt="Ảnh 3x4" class="h-full w-full object-cover" />
                        <div v-else class="px-4 text-center text-sm leading-6 text-slate-400">Chưa có ảnh 3x4</div>
                      </button>

                      <div class="flex-1">
                        <input id="avatar-upload" type="file" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white" :disabled="avatarUploading || isProcessing" accept=".png,.jpg,.jpeg,.webp" @change="handleAvatarUpload" />

                        <div v-if="avatarUploading" class="mt-4 flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                          <a-spin size="small" />
                          Đang upload ảnh 3x4...
                        </div>

                        <div v-else class="mt-4 space-y-3">
                          <p class="text-sm text-slate-500">Chỉ chấp nhận ảnh định dạng JPG, PNG, WEBP với tỷ lệ 3:4.</p>
                          <div v-if="formState.avatar" class="flex flex-wrap gap-2">
                            <a-button danger ghost size="small" :disabled="isProcessing" @click="removeAvatar">Xóa ảnh</a-button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <a-image
                      v-if="formState.avatar"
                      :src="formState.avatar"
                      class="hidden"
                      :preview="{
                        visible: isAvatarPreviewOpen,
                        src: formState.avatar,
                        onVisibleChange: handleAvatarPreviewVisibleChange,
                      }" />
                  </div>
                </a-form-item>

                <a-form-item label="Họ tên đầy đủ" name="fullName" class="md:col-span-1" :rules="[{ required: true, message: 'Vui lòng nhập họ tên đầy đủ' }]">
                  <a-input v-model:value="formState.fullName" placeholder="Nhập họ tên đầy đủ" />
                </a-form-item>

                <a-form-item label="Ngày sinh" name="dateOfBirth" :rules="[{ required: true, message: 'Vui lòng chọn ngày sinh' }]">
                  <a-date-picker v-model:value="formState.dateOfBirth" format="DD/MM/YYYY" class="w-full" placeholder="Chọn ngày sinh" />
                </a-form-item>

                <div>
                  <UserSelectProvince v-model="formState.idProvince" label="Nơi sinh" name="idProvince" placeholder="Chọn tỉnh thành phố" :rules="[{ required: true, message: 'Vui lòng chọn nơi sinh' }]" />
                </div>

                <a-form-item
                  label="Số CCCD"
                  name="identityNumber"
                  :rules="[
                    { required: true, message: 'Vui lòng nhập số CCCD' },
                    { pattern: /^\d{9,12}$/, message: 'Số CCCD phải gồm 9 đến 12 chữ số' },
                  ]">
                  <a-input v-model:value="formState.identityNumber" placeholder="Nhập số CCCD" />
                </a-form-item>

                <a-form-item label="Ngày cấp CCCD" name="identityIssueDate" :rules="[{ required: true, message: 'Vui lòng chọn ngày cấp CCCD' }]">
                  <a-date-picker v-model:value="formState.identityIssueDate" format="DD/MM/YYYY" class="w-full" placeholder="Chọn ngày cấp CCCD" />
                </a-form-item>

                <a-form-item label="Nơi cấp CCCD" name="identityIssuePlace" :rules="[{ required: true, message: 'Vui lòng nhập nơi cấp CCCD' }]">
                  <a-input v-model:value="formState.identityIssuePlace" placeholder="Nhập nơi cấp CCCD" />
                </a-form-item>

                <div>
                  <UserSelectEthnicity v-model="formState.idEthnicity" label="Dân tộc" name="idEthnicity" placeholder="Chọn dân tộc" :rules="[{ required: true, message: 'Vui lòng chọn dân tộc' }]" />
                </div>

                <a-form-item label="Giới tính" name="gender" :rules="[{ required: true, message: 'Vui lòng chọn giới tính' }]">
                  <a-select v-model:value="formState.gender" :options="genderOptions" placeholder="Chọn giới tính" />
                </a-form-item>

                <div class="grid gap-x-4 md:col-span-3 md:grid-cols-3">
                  <div>
                    <UserSelectProvince v-model="formState.permanentProvinceId" label="Tỉnh/thành phố cư trú" name="permanentProvinceId" placeholder="Chọn tỉnh thành phố" :rules="[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố cư trú' }]" />
                  </div>

                  <div>
                    <UserSelectCommune v-model="formState.idCommune" :id-province="formState.permanentProvinceId" label="Phường/xã cư trú" name="idCommune" placeholder="Chọn phường/xã" :rules="[{ required: true, message: 'Vui lòng chọn phường/xã cư trú' }]" />
                  </div>

                  <a-form-item label="Địa chỉ thường trú" name="permanentAddress" :rules="[{ required: true, message: 'Vui lòng nhập địa chỉ thường trú' }]">
                    <a-input v-model:value="formState.permanentAddress" placeholder="Nhập địa chỉ thường trú" />
                  </a-form-item>
                </div>
              </div>
            </section>

            <section class="border-b border-slate-100 py-8">
              <h2 class="text-base font-semibold text-sky-700">Thông tin liên hệ</h2>

              <div class="mt-5 grid gap-x-4 gap-y-1 md:grid-cols-3">
                <a-form-item
                  label="Số điện thoại"
                  name="phoneNumber"
                  :rules="[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ' },
                  ]">
                  <a-input v-model:value="formState.phoneNumber" placeholder="Nhập số điện thoại" />
                </a-form-item>

                <div>
                  <UserSelectProvince v-model="formState.currentProvinceId" label="Tỉnh/thành phố nơi ở hiện tại" name="currentProvinceId" placeholder="Chọn tỉnh thành phố" :rules="[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố hiện tại' }]" />
                </div>

                <div>
                  <UserSelectCommune v-model="formState.idCurrentCommune" :id-province="formState.currentProvinceId" label="Phường/xã nơi ở hiện tại" name="idCurrentCommune" placeholder="Chọn phường/xã" :rules="[{ required: true, message: 'Vui lòng chọn phường/xã hiện tại' }]" />
                </div>

                <a-form-item label="Địa chỉ nơi ở hiện tại" name="currentAddress" class="md:col-span-3" :rules="[{ required: true, message: 'Vui lòng nhập địa chỉ nơi ở hiện tại' }]">
                  <a-input v-model:value="formState.currentAddress" placeholder="Nhập địa chỉ nơi ở hiện tại" />
                </a-form-item>
              </div>
            </section>

            <section class="py-8">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-base font-semibold text-sky-700">Hồ sơ yêu cầu</h2>
                  <!-- <p class="mt-1 text-sm text-slate-500">Tải đúng giấy tờ theo từng loại hồ sơ. File sẽ được upload trực tiếp lên S3 trước khi nộp đơn.</p> -->
                </div>

                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{{ documentUploads.length }} hồ sơ</span>
              </div>

              <div v-if="documentUploads.length" class="mt-5 space-y-4">
                <div v-for="(document, index) in documentUploads" :key="document.key" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <h3 class="font-semibold text-slate-900">{{ index + 1 }}. {{ document.documentName }}</h3>
                        <span class="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.15em]" :class="document.isRequired ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'">
                          {{ document.isRequired ? "Bắt buộc" : "Tùy chọn" }}
                        </span>
                      </div>
                      <p class="mt-2 text-sm text-slate-500">Chấp nhận ảnh hoặc PDF</p>
                    </div>

                    <div class="w-full lg:w-64">
                      <input :id="`document-upload-${index}`" type="file" class="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white" :disabled="document.uploading || isProcessing" accept=".pdf,.png,.jpg,.jpeg,.webp" multiple @change="event => handleDocumentUpload(index, event)" />
                    </div>
                  </div>

                  <div v-if="document.uploading" class="mt-4 flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    <a-spin size="small" />
                    Đang upload {{ document.pendingLabel || "file" }}...
                  </div>

                  <div v-else-if="document.files.length" class="mt-4 rounded-xl border border-emerald-200 bg-white px-4 py-4">
                    <div class="space-y-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <div v-for="(link, fileIndex) in document.files" :key="link.url" class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1 break-all">
                          <BaseImagePreviewLink v-if="getFileType(link.url) === 'image'" :src="link.url" />
                          <BasePdfPreviewLink v-else-if="getFileType(link.url) === 'pdf'" :src="link.url" />
                          <span v-else class="text-sm text-slate-700">
                            {{ getDisplayName(link.url) }}
                          </span>
                        </div>
                        <a-button type="link" danger size="small" :disabled="isProcessing" @click="removeDocumentFile(index, fileIndex)">
                          Xóa
                        </a-button>
                      </div>
                    </div>

                    <div v-if="document.files.length > 1" class="mt-3 flex justify-end">
                      <a-button danger ghost size="small" :disabled="isProcessing" @click="clearDocument(index)">
                        Xóa tất cả
                      </a-button>
                    </div>
                  </div>

                  <div v-else class="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                    {{ document.isRequired ? "Hồ sơ này bắt buộc phải tải lên trước khi nộp." : "Bạn có thể bổ sung hồ sơ này nếu cần." }}
                  </div>
                </div>
              </div>

              <div v-else class="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">Kỳ khảo thí này hiện chưa cấu hình hồ sơ bắt buộc.</div>
            </section>

            <div class="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
              <a-button class="min-w-28" :loading="saveLoading" :disabled="isProcessing" @click="saveDraft">Lưu</a-button>
              <a-button class="min-w-28" danger ghost :disabled="isProcessing" @click="handleCancel">Hủy</a-button>
              <a-button type="primary" class="min-w-32" html-type="submit" :loading="submitLoading" :disabled="status.isClosed || hasUploadingDocuments || isProcessing">Nộp hồ sơ</a-button>
            </div>
          </a-form>
        </section>

        <aside class="space-y-6">
          <div class="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
            <h2 class="text-xl font-bold">Thông tin kỳ khảo thí</h2>

            <div class="mt-5 space-y-3">
              <div class="rounded-2xl bg-white/10 px-4 py-3">
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Trạng thái</div>
                <div class="mt-2 font-bold">{{ status.label }}</div>
              </div>
              <div class="rounded-2xl bg-white/10 px-4 py-3">
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Bắt đầu</div>
                <div class="mt-2 font-bold">{{ formatDateTime(examDetail.startDate) }}</div>
              </div>
              <div class="rounded-2xl bg-white/10 px-4 py-3">
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Kết thúc</div>
                <div class="mt-2 font-bold">{{ formatDateTime(examDetail.endDate) }}</div>
              </div>
              <div class="rounded-2xl bg-white/10 px-4 py-3">
                <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Số lượng hồ sơ yêu cầu</div>
                <div class="mt-2 font-bold">{{ documentUploads.length }}</div>
              </div>
            </div>
          </div>

          <div class="rounded-3xl bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900">Lưu ý</h3>
            <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-500">
              <li>Chỉ nộp hồ sơ khi đã điền đầy đủ thông tin cá nhân.</li>
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
const { examUser, applicationUser, s3 } = useApi();

const formRef = ref();
const examDetail = ref(null);
const loading = ref(true);
const saveLoading = ref(false);
const submitLoading = ref(false);
const avatarUploading = ref(false);
const isAvatarPreviewOpen = ref(false);
const loadError = ref("");
const documentUploads = ref([]);

const genderOptions = [
  { label: "Nam", value: true },
  { label: "Nữ", value: false },
];

const formState = reactive({
  avatar: "",
  fullName: "",
  dateOfBirth: null,
  idProvince: undefined,
  identityNumber: "",
  identityIssueDate: null,
  identityIssuePlace: "",
  idEthnicity: undefined,
  gender: undefined,
  permanentProvinceId: undefined,
  idCommune: undefined,
  permanentAddress: "",
  phoneNumber: "",
  currentProvinceId: undefined,
  idCurrentCommune: undefined,
  currentAddress: "",
});

const examId = computed(() => {
  const rawId = route.params.id;
  const value = Array.isArray(rawId) ? rawId[0] : rawId;
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
});

const draftStorageKey = computed(() => `application-draft-${examId.value || "unknown"}`);

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

const hasUploadingDocuments = computed(() => documentUploads.value.some(item => item.uploading));
const isProcessing = computed(() => saveLoading.value || submitLoading.value || avatarUploading.value);

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

const createDocumentUploads = (documents = [], existingDocuments = []) => {
  return documents.map((document, index) => {
    const documentId = document.id ?? document.idExamDocument ?? index;
    const existing = existingDocuments.find(item => Number(item.idExamDocument) === Number(documentId));

    return {
      key: `${documentId}-${document.documentName}`,
      idExamDocument: documentId,
      documentName: document.documentName,
      isRequired: !!document.isRequired,
      files: existingDocuments
        .filter(item => Number(item.idExamDocument) === Number(documentId) && item.url)
        .map(item => ({
          url: item.url,
          fileName: item.fileName || getDisplayName(item.url),
        })),
      uploading: false,
      pendingLabel: "",
    };
  });
};

const resetFormState = () => {
  Object.assign(formState, {
    avatar: "",
    fullName: "",
    dateOfBirth: null,
    idProvince: undefined,
    identityNumber: "",
    identityIssueDate: null,
    identityIssuePlace: "",
    idEthnicity: undefined,
    gender: undefined,
    permanentProvinceId: undefined,
    idCommune: undefined,
    permanentAddress: "",
    phoneNumber: "",
    currentProvinceId: undefined,
    idCurrentCommune: undefined,
    currentAddress: "",
  });
};

const saveDraftSnapshot = () => {
  if (!import.meta.client) return;

  const snapshot = {
    formState: {
      ...formState,
      dateOfBirth: formState.dateOfBirth ? $dayjs(formState.dateOfBirth).toISOString() : null,
      identityIssueDate: formState.identityIssueDate ? $dayjs(formState.identityIssueDate).toISOString() : null,
    },
    documents: documentUploads.value
      .map(item => ({
        idExamDocument: item.idExamDocument,
        files: item.files,
      }))
      .flatMap(item =>
        item.files.map(file => ({
          idExamDocument: item.idExamDocument,
          url: file.url,
          fileName: file.fileName,
        })),
      ),
  };

  localStorage.setItem(draftStorageKey.value, JSON.stringify(snapshot));
};

const restoreDraft = () => {
  if (!import.meta.client) return false;

  const raw = localStorage.getItem(draftStorageKey.value);
  if (!raw) return false;

  try {
    const draft = JSON.parse(raw);
    const draftFormState = draft?.formState || {};

    Object.assign(formState, {
      ...formState,
      ...draftFormState,
      avatar: draftFormState.avatar || "",
      dateOfBirth: draftFormState.dateOfBirth ? $dayjs(draftFormState.dateOfBirth) : null,
      identityIssueDate: draftFormState.identityIssueDate ? $dayjs(draftFormState.identityIssueDate) : null,
    });

    documentUploads.value = createDocumentUploads(examDetail.value?.documents || [], draft?.documents || []);
    return true;
  } catch {
    localStorage.removeItem(draftStorageKey.value);
    return false;
  }
};

const clearDraftStorage = () => {
  if (!import.meta.client) return;
  localStorage.removeItem(draftStorageKey.value);
};

const saveDraft = async () => {
  if (avatarUploading.value) {
    message.warning("Vui lòng chờ upload ảnh 3x4 hoàn tất");
    return;
  }

  if (hasUploadingDocuments.value) {
    message.warning("Vui lòng chờ upload hồ sơ hoàn tất");
    return;
  }

  saveDraftSnapshot();
  saveLoading.value = true;

  try {
    const { data, error } = await applicationUser.post({
      body: buildPayload(),
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Lưu hồ sơ thất bại");
    }

    message.success(data.value?.message || "Lưu hồ sơ thành công");
  } catch (error) {
    message.error(error?.message || "Lưu hồ sơ thất bại");
  } finally {
    saveLoading.value = false;
  }
};

const clearDocument = index => {
  const document = documentUploads.value[index];
  if (!document) return;

  document.files = [];
};

const ensureRequiredDocumentsUploaded = () => {
  const missingDocument = documentUploads.value.find(item => item.isRequired && item.files.length === 0);

  if (missingDocument) {
    throw new Error(`Vui lòng tải lên hồ sơ bắt buộc: ${missingDocument.documentName}`);
  }
};

const removeDocumentFile = (documentIndex, fileIndex) => {
  const document = documentUploads.value[documentIndex];
  if (!document) return;

  document.files.splice(fileIndex, 1);
};

const loadImageMeta = file =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không thể đọc kích thước ảnh"));
    };

    image.src = objectUrl;
  });

const validateAvatarRatio = async file => {
  const { width, height } = await loadImageMeta(file);
  const ratio = width / height;
  const expectedRatio = 3 / 4;

  if (Math.abs(ratio - expectedRatio) > 0.08) {
    throw new Error("Ảnh avatar phải có tỷ lệ 3:4");
  }
};

const removeAvatar = () => {
  formState.avatar = "";
  isAvatarPreviewOpen.value = false;
};

const openAvatarPreview = () => {
  if (!formState.avatar) return;
  isAvatarPreviewOpen.value = true;
};

const handleAvatarPreviewVisibleChange = visible => {
  isAvatarPreviewOpen.value = visible;
};

const handleAvatarUpload = async event => {
  const file = event?.target?.files?.[0];
  if (!file) return;

  avatarUploading.value = true;

  try {
    await validateAvatarRatio(file);

    const result = await s3.upload(file, {
      key: `${Date.now()}-${file.name}`,
      contentType: file.type || "application/octet-stream",
    });

    formState.avatar = result.directUrl;
    message.success("Đã tải lên ảnh 3x4");
  } catch (error) {
    message.error(error?.message || "Upload ảnh 3x4 thất bại");
  } finally {
    avatarUploading.value = false;
    if (event?.target) {
      event.target.value = "";
    }
  }
};

const handleDocumentUpload = async (index, event) => {
  const files = Array.from(event?.target?.files || []);
  if (!files.length) return;

  const document = documentUploads.value[index];
  if (!document) return;

  document.uploading = true;
  document.pendingLabel = files.length === 1 ? files[0].name : `${files.length} file`;

  try {
    const uploadedFiles = await Promise.all(
      files.map(async file => {
        const result = await s3.upload(file, {
          key: `${Date.now()}-${file.name}`,
          contentType: file.type || "application/octet-stream",
        });

        return {
          url: result.directUrl,
          fileName: file.name,
        };
      }),
    );

    document.files.push(...uploadedFiles);
    message.success(`Đã tải lên ${document.documentName}`);
  } catch (error) {
    message.error(error?.message || `Upload thất bại: ${document.documentName}`);
  } finally {
    document.uploading = false;
    document.pendingLabel = "";
    if (event?.target) {
      event.target.value = "";
    }
  }
};

const buildPayload = () => {
  return {
    idExam: examId.value,
    avatar: String(formState.avatar || "").trim(),
    fullName: formState.fullName.trim(),
    dateOfBirth: $dayjs(formState.dateOfBirth).toISOString(),
    idProvince: Number(formState.idProvince),
    identityNumber: formState.identityNumber.trim(),
    identityIssueDate: $dayjs(formState.identityIssueDate).toISOString(),
    identityIssuePlace: formState.identityIssuePlace.trim(),
    idEthnicity: Number(formState.idEthnicity),
    gender: formState.gender,
    idCommune: Number(formState.idCommune),
    permanentAddress: formState.permanentAddress.trim(),
    phoneNumber: formState.phoneNumber.trim(),
    idCurrentCommune: Number(formState.idCurrentCommune),
    currentAddress: formState.currentAddress.trim(),
    documents: documentUploads.value
      .filter(item => item.files.length)
      .map(item => ({
        idExamDocument: Number(item.idExamDocument),
        url: item.files.map(file => file.url).join(","),
      })),
  };
};

const handleSubmit = async () => {
  if (status.value.isClosed) {
    message.warning("Kỳ khảo thí này hiện chưa mở hoặc đã kết thúc");
    return;
  }

  if (avatarUploading.value) {
    message.warning("Vui lòng chờ upload ảnh 3x4 hoàn tất");
    return;
  }

  if (hasUploadingDocuments.value) {
    message.warning("Vui lòng chờ upload hồ sơ hoàn tất");
    return;
  }

  submitLoading.value = true;

  try {
    ensureRequiredDocumentsUploaded();

    const { data, error } = await applicationUser.putByRest("submit", {
      body: buildPayload(),
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Nộp hồ sơ thất bại");
    }

    clearDraftStorage();
    message.success(data.value?.message || "Nộp hồ sơ thành công");
    navigateTo("/");
  } catch (error) {
    message.error(error?.message || "Nộp hồ sơ thất bại");
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  clearDraftStorage();
  resetFormState();
  documentUploads.value = createDocumentUploads(examDetail.value?.documents || []);
  message.info("Đã hủy thông tin đang nhập");
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/");
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

    if (!restoreDraft()) {
      documentUploads.value = createDocumentUploads(examDetail.value.documents || []);
    }
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
    resetFormState();
    documentUploads.value = [];
    fetchExamDetail();
  },
  { immediate: true },
);

useHead(() => ({
  title: examDetail.value ? `Đăng ký ${examDetail.value.examName}` : "Đăng ký kỳ khảo thí",
}));
</script>
