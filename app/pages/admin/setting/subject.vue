<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm môn học..." enter-button @search="handleSearch" class="w-full" />
      <div class="flex w-full gap-2 md:w-auto">
        <a-button @click="resetForm" class="flex-1 md:flex-none">Đặt lại</a-button>
        <a-button type="primary" @click="showModal" class="flex-1 md:flex-none" :disabled="!adminStore.canEditCurrentPage">Thêm mới</a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '800' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'isDefault'">
            <a-tag :color="record.isDefault ? 'success' : 'default'">
              {{ record.isDefault ? "Mặc định" : "Tùy chọn" }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center space-x-2">
              <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!adminStore.canEditCurrentPage">
                <template #icon><EditOutlined /></template>
              </a-button>
              <a-popconfirm title="Bạn chắc chắn muốn xóa môn học này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-button type="link" danger size="small" :disabled="!adminStore.canEditCurrentPage">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa môn học' : 'Thêm mới môn học'" @cancel="handleCancel" :width="400" :confirm-loading="confirmLoading" @ok="handleOk">
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical" class="mt-4">
        <a-form-item label="Tên môn học" name="subjectName">
          <a-input v-model:value="formState.subjectName" placeholder="Nhập tên môn học" />
        </a-form-item>

        <a-form-item label="Thiết lập mặc định" name="isDefault">
          <a-switch v-model:checked="formState.isDefault" checked-children="Có" un-checked-children="Không" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

const adminStore = useAdminStore();
const { adminSubject } = useApi();

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
  { title: "Tên môn học", dataIndex: "subjectName", key: "subjectName", ellipsis: true },
  { title: "Mặc định", dataIndex: "isDefault", key: "isDefault", width: 120, align: "center" },
  { title: "Thao tác", key: "action", width: 100, align: "center" },
];

const formState = reactive({
  id: null,
  subjectName: "",
  isDefault: false,
});

const rules = {
  subjectName: [{ required: true, message: "Vui lòng nhập tên môn học", trigger: "blur" }],
};

const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const {
  data: subjectResponse,
  refresh: refreshSubjects,
  pending: loading,
} = await adminSubject.get({
  params: param,
  key: "subject-list",
});

const dataSource = computed(() => {
  if (!subjectResponse.value?.success) return [];
  return subjectResponse.value.data.items || [];
});

watch(
  () => subjectResponse.value,
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
    subjectName: "",
    isDefault: false,
  });
  visible.value = true;
};

const editItem = async id => {
  isEdit.value = true;
  try {
    const { data } = await adminSubject.getByRest("detail", {
      params: { id: id },
      key: `admin-subject-detail-${id}-${Date.now()}`,
    });
    if (data.value?.success) {
      const detail = data.value.data;
      Object.assign(formState, {
        id: detail.id,
        subjectName: detail.subjectName,
        isDefault: detail.isDefault,
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

    let res;
    if (isEdit.value) {
      res = await adminSubject.put({ body: formState });
    } else {
      const payload = { ...formState };
      delete payload.id;
      res = await adminSubject.post({ body: payload });
    }

    if (res.data.value?.success) {
      message.success(res.data.value?.message || "Thành công");
      visible.value = false;
      await refreshSubjects();
    } else {
      throw new Error(res.error?.value?.data?.message || res.data.value?.message || "Lỗi không xác định");
    }
  } catch (err) {
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
    const { data } = await adminSubject.delete({ params: { id: id } });
    if (data.value?.success) {
      message.success(data.value?.message || "Đã xóa");
      await refreshSubjects();
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
</script>
