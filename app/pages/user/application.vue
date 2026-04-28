<template>
  <div class="min-h-screen bg-slate-50 px-2 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <section class="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
          <a-input-search v-model:value="searchText" placeholder="Tìm theo mã hồ sơ, họ tên, kỳ tuyển sinh..." allow-clear enter-button @search="handleSearch" />

          <UserSelectEnrollment v-model="selectedExamId" no-form-item :inlineLabel="false" placeholder="Lọc theo kỳ tuyển sinh" label="" @change="handleExamChange" />

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
                    <a-tag :color="getStatusColor(record.statusName)">
                      {{ record.statusName || "Không xác định" }}
                    </a-tag>
                  </template>

                  <template v-else-if="column.key === 'action'">
                    <div class="flex justify-center">
                      <a-button type="link" class="px-0" @click="openDetail(record)">Xem chi tiết</a-button>
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
                <a-tag :color="getStatusColor(record.statusName)">
                  {{ record.statusName || "Không xác định" }}
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

              <div class="mt-4 flex justify-end">
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

    <a-modal v-model:open="detailVisible" title="Chi tiết hồ sơ" :width="1000" :footer="null" @cancel="closeDetail">
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
              <a-tag :color="getStatusColor(detailData.statusName)">{{ detailData.statusName || `#${detailData.idStatus}` }}</a-tag>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.2em] text-slate-400">Số tài liệu</div>
            <div class="mt-2 font-bold text-slate-900">{{ normalizedDocuments.length }}</div>
          </div>
        </div>

        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="Họ tên">{{ detailData.fullName || detailData.fullname || "-" }}</a-descriptions-item>
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
          <a-descriptions-item label="Phường/xã hiện tại">{{ detailData.currentCommuneName || `#${detailData.idCurrentCommune || "-"}` }}</a-descriptions-item>
          <a-descriptions-item label="Địa chỉ hiện tại" :span="2">{{ detailData.currentAddress || "-" }}</a-descriptions-item>
          <a-descriptions-item label="Ghi chú" :span="2">{{ detailData.note || "-" }}</a-descriptions-item>
        </a-descriptions>

        <div>
          <h3 class="mb-3 text-base font-semibold text-slate-900">Hồ sơ đính kèm</h3>

          <div v-if="normalizedDocuments.length" class="space-y-4">
            <div v-for="document in normalizedDocuments" :key="document.key" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div class="font-medium text-slate-900">Hồ sơ #{{ document.idExamDocument }}</div>
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
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

definePageMeta({
  layout: "default",
});

const userStore = useUserStore();
const { applicationUser } = useApi();

if (!userStore.token) {
  userStore.openLogin();
  await navigateTo("/");
}

const searchText = ref("");
const selectedExamId = ref(undefined);
const loadError = ref("");
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref(null);
const selectedRecord = ref(null);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const params = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  idExam: undefined,
});

const columns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Mã hồ sơ", dataIndex: "applicationCode", key: "applicationCode", width: 150 },
  { title: "Kỳ tuyển sinh", dataIndex: "examName", key: "examName", ellipsis: true },
  { title: "Họ tên", dataIndex: "fullname", key: "fullname", ellipsis: true },
  { title: "Trạng thái", dataIndex: "statusName", key: "statusName", width: 140, align: "center" },
  { title: "Thao tác", key: "action", width: 140, align: "center" },
];

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

const normalizedDocuments = computed(() => {
  const documents = Array.isArray(detailData.value?.documents) ? detailData.value.documents : [];

  return documents
    .map((document, index) => {
      if (typeof document === "string") {
        return {
          key: `document-${index}`,
          idExamDocument: index + 1,
          links: splitDocumentLinks(document),
        };
      }

      return {
        key: `${document?.idExamDocument || document?.id || "document"}-${index}`,
        idExamDocument: document?.idExamDocument || document?.id || index + 1,
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

const formatDate = value => {
  if (!value) return "-";
  return dayjs(value).format("DD/MM/YYYY");
};

const formatGender = value => {
  if (value === true) return "Nam";
  if (value === false) return "Nữ";
  return "-";
};

const getStatusColor = statusName => {
  const normalized = String(statusName || "")
    .trim()
    .toLowerCase();

  if (normalized.includes("duyệt") || normalized.includes("đạt") || normalized.includes("thành công")) {
    return "success";
  }

  if (normalized.includes("từ chối") || normalized.includes("hủy")) {
    return "error";
  }

  if (normalized.includes("nháp") || normalized.includes("chờ")) {
    return "processing";
  }

  return "default";
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

const openDetail = async record => {
  selectedRecord.value = record;
  detailVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;

  try {
    const { data, error } = await applicationUser.getDetail({
      params: { id: record.id },
    });

    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể tải thông tin chi tiết");
    }

    detailData.value = normalizeApplicationDetail(data.value.data, record);
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

useHead({
  title: "Danh sách hồ sơ cá nhân",
});
</script>
