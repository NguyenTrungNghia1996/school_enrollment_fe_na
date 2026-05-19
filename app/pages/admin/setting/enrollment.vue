<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm kỳ tuyển sinh..." enter-button @search="handleSearch" class="w-full" />
      <div class="flex w-full gap-2 md:w-auto">
        <a-button @click="resetForm" class="flex-1 md:flex-none">Đặt lại</a-button>
        <a-button type="primary" @click="showModal" class="flex-1 md:flex-none" :disabled="!adminStore.canEditCurrentPage">Thêm mới</a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1200' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'dates'">
            <div class="text-xs">
              <div>
                <span class="text-gray-400">Từ:</span>
                {{ formatDate(record.startDate) }}
              </div>
              <div>
                <span class="text-gray-400">Đến:</span>
                {{ formatDate(record.endDate) }}
              </div>
            </div>
          </template>
          <template v-if="column.key === 'fee'">
            {{ formatCurrency(record.fee) }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center space-x-2">
              <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!adminStore.canViewCurrentPage">
                <template #icon><EditOutlined /></template>
              </a-button>
              <a-popconfirm title="Bạn chắc chắn muốn xóa kỳ tuyển sinh này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-button type="link" danger size="small" :disabled="!adminStore.canEditCurrentPage">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa kỳ tuyển sinh' : 'Thêm mới kỳ tuyển sinh'" @cancel="handleCancel" :width="700" :confirm-loading="confirmLoading" :ok-button-props="{ disabled: isEdit && !adminStore.canEditCurrentPage }" @ok="handleOk" centered>
      <a-form ref="formRef" :model="formState" :rules="rules" :disabled="isEditReadOnly" layout="vertical" class="mt-4 max-h-[70vh] overflow-y-auto pr-2" @submit.prevent>
        <a-alert v-if="isEnrollmentLocked" type="info" show-icon class="mb-4" :message="isReviewLocked ? 'Kỳ tuyển sinh đã có hồ sơ đăng ký. Không được phép cập nhật thông tin tuyển sinh.' : 'Kỳ tuyển sinh đã có hồ sơ đăng ký. Chỉ được phép cập nhật thời gian phúc khảo và lệ phí phúc khảo.'" />
        <a-alert v-if="isReviewLocked" type="info" show-icon class="mb-4" message="Kỳ tuyển sinh đã có hồ sơ phúc khảo. Không được phép cập nhật thời gian phúc khảo và lệ phí phúc khảo." />

        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <a-form-item label="Tên đợt tuyển sinh" name="examName" class="md:col-span-2">
            <a-input v-model:value="formState.examName" placeholder="Nhập tên đợt tuyển sinh" :maxlength="300" show-count :disabled="isGeneralFieldsReadOnly" />
          </a-form-item>

          <a-form-item label="Khoảng thời gian" name="dateRange" class="md:col-span-2">
            <a-range-picker v-model:value="formState.dateRange" format="DD/MM/YYYY HH:mm" show-time class="w-full" :placeholder="['Chọn ngày giờ bắt đầu', 'Chọn ngày giờ kết thúc']" :disabled="isGeneralFieldsReadOnly" />
          </a-form-item>

          <a-form-item label="Link đăng ký" name="url" class="md:col-span-2">
            <a-input v-model:value="formState.url" placeholder="Nhập đường dẫn đăng ký hoặc thông tin liên quan" :disabled="isGeneralFieldsReadOnly" />
          </a-form-item>

          <a-form-item label="Lệ phí (VNĐ)" name="fee">
            <a-input-number v-model:value="formState.fee" :min="0" :step="1000" class="w-full" :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="value => value.replace(/\$\s?|(,*)/g, '')" :disabled="isGeneralFieldsReadOnly" />
          </a-form-item>

          <a-form-item label="Số lượng chỉ tiêu" name="quantity">
            <a-input-number v-model:value="formState.quantity" :min="1" class="w-full" :disabled="isGeneralFieldsReadOnly" />
          </a-form-item>

          <a-form-item label="Thời gian phúc khảo" name="reviewDateRange" class="md:col-span-2">
            <a-range-picker v-model:value="formState.reviewDateRange" format="DD/MM/YYYY HH:mm" show-time class="w-full" :disabled-date="disabledReviewDate" :placeholder="['Chọn ngày giờ bắt đầu phúc khảo', 'Chọn ngày giờ kết thúc phúc khảo']" :disabled="isReviewFieldsReadOnly" />
          </a-form-item>

          <a-form-item label="Lệ phí phúc khảo (VNĐ)" name="reviewFee">
            <a-input-number v-model:value="formState.reviewFee" :min="0" :step="1000" class="w-full" :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="value => value.replace(/\$\s?|(,*)/g, '')" :disabled="isReviewFieldsReadOnly" />
          </a-form-item>

          <div />

          <div class="md:col-span-2">
            <AdminSelectBank v-model="formState.idBank" label="Ngân hàng" name="idBank" placeholder="Chọn ngân hàng" :rules="[{ required: true, message: 'Vui lòng chọn ngân hàng', trigger: 'change' }]" :disabled="isGeneralFieldsReadOnly" />
          </div>

          <a-form-item label="Số tài khoản" name="accountNumber">
            <a-input v-model:value="formState.accountNumber" placeholder="Nhập số tài khoản" :disabled="isGeneralFieldsReadOnly" />
          </a-form-item>

          <a-form-item label="Chủ tài khoản" name="accountName">
            <a-input v-model:value="formState.accountName" placeholder="Nhập tên chủ tài khoản" :disabled="isGeneralFieldsReadOnly" />
          </a-form-item>

          <div class="mt-2 md:col-span-2">
            <div class="mb-2 flex items-center justify-between">
              <span class="font-medium text-gray-700">Hồ sơ yêu cầu</span>
              <a-button type="dashed" size="small" @click="addDocument" html-type="button" :disabled="isGeneralFieldsReadOnly">
                <template #icon><PlusOutlined /></template>
                Thêm hồ sơ
              </a-button>
            </div>

            <div v-if="formState.documents.length === 0" class="rounded border border-dashed border-gray-300 bg-gray-50 py-4 text-center text-xs italic text-gray-400">Chưa có hồ sơ nào được yêu cầu</div>

            <div v-for="(doc, index) in formState.documents" :key="index" class="group relative mb-2 flex items-start gap-2 rounded bg-slate-50 p-2">
              <a-form-item :name="['documents', index, 'documentName']" :rules="{ required: true, message: 'Nhập tên hồ sơ', trigger: 'blur' }" class="mb-0 flex-1">
                <a-input v-model:value="doc.documentName" placeholder="Tên loại hồ sơ (vd: Giấy khai sinh)" size="small" :disabled="isGeneralFieldsReadOnly" />
              </a-form-item>

              <div class="flex h-8 items-center px-2">
                <a-checkbox v-model:checked="doc.isRequired" class="text-xs" :disabled="isGeneralFieldsReadOnly">Bắt buộc</a-checkbox>
              </div>

              <a-button type="text" danger size="small" @click="removeDocument(index)" class="opacity-0 transition-opacity group-hover:opacity-100" html-type="button" :disabled="isGeneralFieldsReadOnly">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
          </div>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

definePageMeta({
  layout: "admin",
});

const adminStore = useAdminStore();
const { adminEnrollment } = useApi();

const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const isEditReadOnly = computed(() => isEdit.value && !adminStore.canEditCurrentPage);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50", "100"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên kỳ tuyển sinh", dataIndex: "examName", key: "examName", ellipsis: true },
  { title: "Thời gian", key: "dates", width: 200 },
  { title: "Lệ phí", dataIndex: "fee", key: "fee", width: 120, align: "right" },
  { title: "Chỉ tiêu", dataIndex: "quantity", key: "quantity", width: 100, align: "center" },
  { title: "Thao tác", key: "action", width: 100, align: "center", fixed: "right" },
];

const createInitialFormState = () => ({
  id: null,
  hasApplications: false,
  hasApplicationsReview: false,
  dateRange: [],
  reviewDateRange: [],
  examName: "",
  startDate: null,
  endDate: null,
  reviewStartDate: null,
  reviewEndDate: null,
  fee: null,
  quantity: null,
  url: "",
  reviewFee: null,
  idBank: undefined,
  accountNumber: "",
  accountName: "",
  documents: [],
});

const formState = reactive(createInitialFormState());
const isEnrollmentLocked = computed(() => isEdit.value && formState.hasApplications);
const isReviewLocked = computed(() => isEdit.value && formState.hasApplicationsReview);
const isGeneralFieldsReadOnly = computed(() => isEnrollmentLocked.value || isEditReadOnly.value);
const isReviewFieldsReadOnly = computed(() => isReviewLocked.value || isEditReadOnly.value);

const validateRequiredNumber = fieldLabel => ({
  validator: async (_, value) => {
    // if (value === null || value === undefined || value === "") {
    //   throw new Error(`Vui lòng nhập ${fieldLabel}`);
    // }
  },
  trigger: "change",
});

const validateDateRange = async (_, value) => {
  // if (!Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
  //   throw new Error("Vui lòng chọn khoảng thời gian");
  // }
};

const disabledReviewDate = current => {
  const enrollmentEnd = formState.dateRange?.[1];
  if (!current || !enrollmentEnd) return false;
  return !current.endOf("day").isAfter(enrollmentEnd);
};

const validateReviewDateRange = async (_, value) => {
  // if (!Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
  //   throw new Error("Vui lòng chọn thời gian phúc khảo");
  // }

  const enrollmentEnd = formState.dateRange?.[1];
  if (enrollmentEnd && !dayjs(value[0]).isAfter(enrollmentEnd)) {
    throw new Error("Thời gian phúc khảo phải sau thời gian nộp hồ sơ");
  }
};

const rules = {
  examName: [
    { required: true, message: "Vui lòng nhập tên đợt tuyển sinh", trigger: "blur" },
    { max: 300, message: "Tên đợt tuyển sinh không được vượt quá 300 ký tự", trigger: "blur" },
  ],
  dateRange: [
    { required: true, message: "Vui lòng chọn khoảng thời gian", trigger: "change" },
    {
      validator: validateDateRange,
      trigger: "change",
    },
  ],
  reviewDateRange: [
    { required: true, message: "Vui lòng chọn thời gian phúc khảo", trigger: "change" },
    {
      validator: validateReviewDateRange,
      trigger: "change",
    },
  ],
  fee: [{ required: true, message: "Vui lòng nhập lệ phí thi", trigger: "blur" }, validateRequiredNumber("lệ phí thi")],
  quantity: [
    { required: true, message: "Vui lòng nhập chỉ tiêu", trigger: "blur" },
    { type: "number", min: 1, message: "Chỉ tiêu nhỏ nhất là 1", trigger: "blur" },
    validateRequiredNumber("chỉ tiêu"),
  ],
  reviewFee: [{ required: true, message: "Vui lòng nhập lệ phí phúc khảo", trigger: "blur" }, validateRequiredNumber("lệ phí phúc khảo")],
  accountNumber: [{ required: true, message: "Vui lòng nhập số tài khoản", trigger: "blur" }],
  accountName: [{ required: true, message: "Vui lòng nhập chủ tài khoản", trigger: "blur" }],
};

const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const {
  data: enrollmentResponse,
  refresh: refreshEnrollments,
  pending: loading,
} = await adminEnrollment.get({
  params: param,
  key: "admin-enrollment-list",
});

const dataSource = computed(() => {
  if (!enrollmentResponse.value?.success) return [];
  return enrollmentResponse.value.data.items || [];
});

watch(
  () => enrollmentResponse.value,
  newVal => {
    if (newVal?.success) {
      pagination.total = newVal.data.total || 0;
    }
  },
  { immediate: true },
);

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.pageIndex = pag.current;
  param.value.pageSize = pag.pageSize;
};

const handleSearch = () => {
  const search = (searchText.value || "").trim();
  param.value.search = search;
  param.value.pageIndex = 1;
  pagination.current = 1;
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, createInitialFormState());
  visible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};

const editItem = async id => {
  isEdit.value = true;
  try {
    const { data } = await adminEnrollment.getByRest("detail", {
      params: { id: id },
      key: `admin-enrollment-detail-${id}-${Date.now()}`,
    });
    if (data.value?.success) {
      const detail = data.value.data;
      const startDate = detail.startDate ? dayjs(detail.startDate) : null;
      const endDate = detail.endDate ? dayjs(detail.endDate) : null;
      const reviewStartDate = detail.reviewStartDate ? dayjs(detail.reviewStartDate) : null;
      const reviewEndDate = detail.reviewEndDate ? dayjs(detail.reviewEndDate) : null;
      Object.assign(formState, {
        id: detail.id,
        hasApplications: Boolean(detail.hasApplications),
        hasApplicationsReview: Boolean(detail.hasApplicationsReview),
        dateRange: startDate && endDate ? [startDate, endDate] : [],
        reviewDateRange: reviewStartDate && reviewEndDate ? [reviewStartDate, reviewEndDate] : [],
        examName: detail.examName,
        startDate,
        endDate,
        reviewStartDate,
        reviewEndDate,
        fee: detail.fee,
        quantity: detail.quantity,
        url: detail.url || "",
        reviewFee: detail.reviewFee ?? 0,
        idBank: detail.idBank ?? undefined,
        accountNumber: detail.accountNumber || "",
        accountName: detail.accountName || "",
        documents: detail.documents ? JSON.parse(JSON.stringify(detail.documents)) : [],
      });
      visible.value = true;
      nextTick(() => formRef.value?.clearValidate());
    }
  } catch (err) {
    message.error("Không thể lấy thông tin chi tiết");
  }
};

const handleOk = async () => {
  if (isEdit.value && !adminStore.canEditCurrentPage) {
    message.warning("Bạn không có quyền cập nhật thông tin");
    return;
  }
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    formState.startDate = formState.dateRange?.[0] || null;
    formState.endDate = formState.dateRange?.[1] || null;
    formState.reviewStartDate = formState.reviewDateRange?.[0] || null;
    formState.reviewEndDate = formState.reviewDateRange?.[1] || null;

    const serializeLocalDateTime = value => {
      if (!value) return null;
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed.format("YYYY-MM-DDTHH:mm:ss") : null;
    };

    const payload = {
      ...(isEdit.value ? { id: formState.id } : {}),
      examName: formState.examName.trim(),
      fee: Number(formState.fee || 0),
      quantity: Number(formState.quantity || 0),
      url: formState.url.trim(),
      reviewFee: Number(formState.reviewFee || 0),
      idBank: formState.idBank ?? 0,
      accountNumber: formState.accountNumber.trim(),
      accountName: formState.accountName.trim(),
      documents: Array.isArray(formState.documents)
        ? formState.documents
            .map(doc => ({
              documentName: String(doc?.documentName || "").trim(),
              isRequired: Boolean(doc?.isRequired),
            }))
            .filter(doc => doc.documentName)
        : [],
      startDate: serializeLocalDateTime(formState.startDate),
      endDate: serializeLocalDateTime(formState.endDate),
      reviewStartDate: serializeLocalDateTime(formState.reviewStartDate),
      reviewEndDate: serializeLocalDateTime(formState.reviewEndDate),
    };

    let res;
    if (isEdit.value) {
      res = await adminEnrollment.put({ body: payload });
    } else {
      res = await adminEnrollment.post({ body: payload });
    }

    if (res.data.value?.success) {
      message.success(res.data.value?.message || "Thành công");
      visible.value = false;
      await refreshEnrollments();
    } else {
      throw new Error(res.error?.value?.data?.message || res.data.value?.message || "Lỗi không xác định");
    }
  } catch (err) {
    if (err.errorFields) return; // Validation error
    message.error(err.message || "Lỗi khi lưu thông tin");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await adminEnrollment.delete({ params: { id: id } });
    if (data.value?.success) {
      message.success(data.value?.message || "Đã xóa");
      await refreshEnrollments();
    } else {
      throw new Error(error.value?.data?.message || "Không thể xóa");
    }
  } catch (err) {
    message.error(err.message || "Lỗi khi xóa");
  }
};

const resetForm = () => {
  searchText.value = "";
  param.value = { pageIndex: 1, pageSize: 10, search: "" };
  pagination.current = 1;
};

const addDocument = () => {
  formState.documents.push({
    documentName: "",
    isRequired: true,
  });
};

const removeDocument = index => {
  formState.documents.splice(index, 1);
};

const formatDate = date => {
  if (!date) return "-";
  return dayjs(date).format("DD/MM/YYYY HH:mm");
};

const formatCurrency = value => {
  if (value === undefined || value === null) return "0đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};
</script>
