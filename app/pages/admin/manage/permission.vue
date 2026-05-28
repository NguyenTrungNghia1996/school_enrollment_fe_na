<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm Nhóm quyền..." enter-button @search="handleSearch" class="w-full" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!adminStore.canEditCurrentPage">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '800' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'description'">
            <span v-if="record.description">{{ record.description }}</span>
            <span v-else class="text-gray-400">Trống</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="space-x-2 md:flex">
                <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!adminStore.canViewCurrentPage">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                  <a-button type="link" danger size="small" :disabled="!adminStore.canEditCurrentPage">
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa Nhóm quyền' : 'Thêm mới Nhóm quyền'" @cancel="handleCancel" :width="modalWidth" :bodyStyle="{ maxHeight: '70vh', overflowY: 'auto' }">
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <a-form ref="formRef" :model="formState" :disabled="isEditReadOnly" layout="vertical">
          <a-form-item label="Tên Nhóm quyền" name="name" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" :rules="rules.name">
            <a-input v-model:value="formState.name" placeholder="Nhập tên Nhóm quyền" :maxlength="50" show-count :disabled="isEditReadOnly" />
          </a-form-item>

          <a-form-item label="Mô tả" name="description" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <a-textarea v-model:value="formState.description" :rows="4" placeholder="Nhập mô tả (nếu có)" :maxlength="250" show-count :disabled="isEditReadOnly" />
          </a-form-item>
        </a-form>
        <AdminPermissionEditor v-model="formState.permission" :disabled="isEditReadOnly" />
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading" :disabled="isEdit && !adminStore.canEditCurrentPage">
            Lưu
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});
const adminStore = useAdminStore();
const { loadPermissions } = usePermissions();
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
const { adminRoles } = useApi();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");
const modalWidth = computed(() => (isMobile.value ? "95vw" : 1000));
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
  pageSizeOptions: ["1", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const columns = [
  { title: "STT", key: "stt", width: 50, align: "center" },
  { title: "Tên Nhóm quyền", dataIndex: "name", key: "name", ellipsis: true },
  { title: "Mô tả", dataIndex: "description", key: "description", ellipsis: true },
  { title: "Thao tác", key: "action", width: 80, align: "center", fixed: "right" },
];

const formState = reactive({
  id: null,
  name: "",
  description: "",
  permission: [],
});

const rules = reactive({
  name: [
    { required: true, message: "Vui lòng nhập tên Nhóm quyền", trigger: "blur" },
    { min: 2, message: "Tên phải có ít nhất 2 ký tự", trigger: "blur" },
    { max: 50, message: "Tên nhiều nhất 50 ký tự", trigger: "blur" },
  ],
});

const param = ref({ PageIndex: 1, PageSize: 10, search: "" });

const {
  data: roleResponse,
  refresh: refreshRoles,
  pending: loading,
} = await adminRoles.get({
  params: param,
  key: "admin-roles",
});

const dataSource = computed(() => {
  if (!roleResponse.value?.success) return [];
  return roleResponse.value.data.items || [];
});

watch(
  () => roleResponse.value,
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
  param.value.PageIndex = pag.current;
  param.value.PageSize = pag.pageSize;
};

const handleSearch = async () => {
  const search = (searchText.value || "").trim();
  if (search) {
    param.value.search = search;
  } else {
    delete param.value.search;
  }
  param.value.PageIndex = 1;
  pagination.current = 1;
};

const showModal = async () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, name: "", description: "", permission: [] });
  visible.value = true;
};

const editItem = async id => {
  isEdit.value = true;
  try {
    const { data } = await adminRoles.getByRest("detail", {
      params: { id: id },
      key: `admin-role-detail-${id}-${Date.now()}`,
    });
    if (data.value?.success) {
      Object.assign(formState, data.value.data);
      visible.value = true;
    }
  } catch (err) {
    message.error("Không thể lấy dữ liệu chi tiết");
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

    const payload = {
      ...(isEdit.value ? { id: formState.id } : {}),
      name: String(formState.name || "").trim(),
      description: String(formState.description || "").trim(),
      permission: Array.isArray(formState.permission) ? formState.permission : [],
    };

    let res;
    if (isEdit.value) {
      res = await adminRoles.put({ body: payload });
    } else {
      res = await adminRoles.post({ body: payload });
    }

    if (res.data.value?.success) {
      message.success(res.data.value?.message || "Thành công");
      visible.value = false;
      formRef.value.resetFields();
    } else {
      throw new Error(res.error?.value?.data?.message || "Lỗi không xác định");
    }
  } catch (err) {
    message.error(err.message || "Lỗi khi lưu thông tin");
  } finally {
    await loadPermissions();
    await refreshRoles();
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data } = await adminRoles.delete({ params: { id: id } });
    if (data.value?.success) {
      message.success(data.value?.message || "Đã xóa");
      const nextTotal = Math.max(Number(pagination.total || 0) - 1, 0);
      const nextPage = Math.max(1, Math.ceil(nextTotal / pagination.pageSize));
      if (pagination.current > nextPage) {
        pagination.current = nextPage;
        param.value.PageIndex = nextPage;
      }
      await refreshRoles();
    } else {
      message.error(data.value?.message || "Không thể xóa");
    }
  } catch (err) {
    message.error("Lỗi khi xóa");
  }
};

const resetForm = async () => {
  if (formRef.value) formRef.value.resetFields();
  searchText.value = "";
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  pagination.current = 1;
  pagination.pageSize = 10;
};
</script>
<style scoped>
/* Thêm style cho modal */
.custom-modal :deep(.ant-modal-body) {
  padding: 16px 24px;
}

.custom-modal :deep(.ant-modal-content) {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.custom-modal :deep(.ant-modal-header) {
  flex-shrink: 0;
}

.custom-modal :deep(.ant-modal-footer) {
  flex-shrink: 0;
}
</style>
