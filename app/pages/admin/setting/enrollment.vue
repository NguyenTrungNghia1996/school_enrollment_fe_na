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
              <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!adminStore.canEditCurrentPage">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa kỳ tuyển sinh' : 'Thêm mới kỳ tuyển sinh'" @cancel="handleCancel" :width="700" :confirm-loading="confirmLoading" @ok="handleOk" centered>
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical" class="mt-4 max-h-[70vh] overflow-y-auto pr-2" @submit.prevent>
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <a-form-item label="Tên kỳ tuyển sinh" name="examName" class="md:col-span-2">
            <a-input v-model:value="formState.examName" placeholder="Nhập tên kỳ tuyển sinh" />
          </a-form-item>

          <a-form-item label="Khoảng thời gian" name="dateRange" class="md:col-span-2">
            <a-range-picker v-model:value="formState.dateRange" format="DD/MM/YYYY" class="w-full" :placeholder="['Chọn ngày bắt đầu', 'Chọn ngày kết thúc']" />
          </a-form-item>

          <a-form-item label="Lệ phí (VNĐ)" name="fee">
            <a-input-number v-model:value="formState.fee" :min="0" :step="10000" class="w-full" :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="value => value.replace(/\$\s?|(,*)/g, '')" />
          </a-form-item>

          <a-form-item label="Số lượng chỉ tiêu" name="quantity">
            <a-input-number v-model:value="formState.quantity" :min="0" class="w-full" />
          </a-form-item>

          <div class="md:col-span-2">
            <AdminSelectSubject v-model="formState.subjectIds" multiple label="Danh sách môn thi" placeholder="Chọn các môn thi" />
          </div>

          <div class="mt-2 md:col-span-2">
            <div class="mb-2 flex items-center justify-between">
              <span class="font-medium text-gray-700">Hồ sơ yêu cầu</span>
              <a-button type="dashed" size="small" @click="addDocument" html-type="button">
                <template #icon><PlusOutlined /></template>
                Thêm hồ sơ
              </a-button>
            </div>

            <div v-if="formState.documents.length === 0" class="rounded border border-dashed border-gray-300 bg-gray-50 py-4 text-center text-xs italic text-gray-400">Chưa có hồ sơ nào được yêu cầu</div>

            <div v-for="(doc, index) in formState.documents" :key="index" class="group relative mb-2 flex items-start gap-2 rounded bg-slate-50 p-2">
              <a-form-item :name="['documents', index, 'documentName']" :rules="{ required: true, message: 'Nhập tên hồ sơ', trigger: 'blur' }" class="mb-0 flex-1">
                <a-input v-model:value="doc.documentName" placeholder="Tên loại hồ sơ (vd: Giấy khai sinh)" size="small" />
              </a-form-item>

              <div class="flex h-8 items-center px-2">
                <a-checkbox v-model:checked="doc.isRequired" class="text-xs">Bắt buộc</a-checkbox>
              </div>

              <a-button type="text" danger size="small" @click="removeDocument(index)" class="opacity-0 transition-opacity group-hover:opacity-100" html-type="button">
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

const formState = reactive({
  id: null,
  dateRange: [],
  examName: "",
  startDate: null,
  endDate: null,
  examType: 0,
  fee: 0,
  quantity: 0,
  subjectIds: [],
  documents: [],
});

const rules = {
  examName: [{ required: true, message: "Vui lòng nhập tên kỳ tuyển sinh", trigger: "blur" }],
  dateRange: [
    {
      required: true,
      type: "array",
      message: "Vui lòng chọn khoảng thời gian",
      trigger: "change",
    },
  ],
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
  Object.assign(formState, {
    id: null,
    dateRange: [],
    examName: "",
    startDate: null,
    endDate: null,
    examType: 0,
    fee: 0,
    quantity: 0,
    subjectIds: [],
    documents: [],
  });
  visible.value = true;
};

const editItem = async id => {
  isEdit.value = true;
  try {
    const { data } = await adminEnrollment.getByRest("detail", { params: { id: id } });
    if (data.value?.success) {
      const detail = data.value.data;
      const startDate = detail.startDate ? dayjs(detail.startDate) : null;
      const endDate = detail.endDate ? dayjs(detail.endDate) : null;
      Object.assign(formState, {
        id: detail.id,
        dateRange: startDate && endDate ? [startDate, endDate] : [],
        examName: detail.examName,
        startDate,
        endDate,
        examType: detail.examType,
        fee: detail.fee,
        quantity: detail.quantity,
        subjectIds: detail.subjectIds ? [...detail.subjectIds] : [],
        documents: detail.documents ? JSON.parse(JSON.stringify(detail.documents)) : [],
      });
      visible.value = true;
    }
  } catch (err) {
    message.error("Không thể lấy thông tin chi tiết");
  }
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    formState.startDate = formState.dateRange?.[0] || null;
    formState.endDate = formState.dateRange?.[1] || null;

    const payload = {
      ...formState,
      dateRange: undefined,
      startDate: formState.startDate ? formState.startDate.toISOString() : null,
      endDate: formState.endDate ? formState.endDate.toISOString() : null,
    };

    let res;
    if (isEdit.value) {
      res = await adminEnrollment.put({ body: payload });
    } else {
      const createPayload = { ...payload };
      delete createPayload.id;
      res = await adminEnrollment.post({ body: createPayload });
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
    const { data } = await adminEnrollment.delete({ params: { id: id } });
    if (data.value?.success) {
      message.success(data.value?.message || "Đã xóa");
      await refreshEnrollments();
    } else {
      message.error(data.value?.message || "Không thể xóa");
    }
  } catch (err) {
    message.error("Lỗi khi xóa");
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
