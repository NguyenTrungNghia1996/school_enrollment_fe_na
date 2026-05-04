<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm người dùng..." enter-button @search="handleSearch" class="w-full" />
      <div class="flex w-full gap-2 md:w-auto">
        <a-button @click="resetForm" class="flex-1 md:flex-none">Đặt lại</a-button>
        <a-button type="primary" @click="showModal" class="flex-1 md:flex-none" :disabled="!adminStore.canEditCurrentPage">Thêm mới</a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1000' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'active'">
            <a-tag :color="record.active ? 'success' : 'error'">
              {{ record.active ? "Hoạt động" : "Khóa" }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center space-x-2">
              <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!adminStore.canEditCurrentPage">
                <template #icon><EditOutlined /></template>
              </a-button>
              <a-popconfirm title="Bạn chắc chắn muốn xóa người dùng này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-button type="link" danger size="small" :disabled="!adminStore.canEditCurrentPage">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Cập nhật trạng thái' : 'Thêm mới người dùng'" @cancel="handleCancel" :width="400" :confirm-loading="confirmLoading" @ok="handleOk">
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical" class="mt-4">
        <template v-if="!isEdit">
          <a-form-item label="Tên đăng nhập" name="username">
            <a-input v-model:value="formState.username" placeholder="Nhập tên đăng nhập" />
          </a-form-item>

          <a-form-item label="Mật khẩu" name="password">
            <a-input-password v-model:value="formState.password" placeholder="Nhập mật khẩu" />
          </a-form-item>
        </template>

        <a-form-item label="Trạng thái" name="active">
          <a-switch v-model:checked="formState.active" checked-children="Hoạt động" un-checked-children="Khóa" />
        </a-form-item>

        <div v-if="isEdit" class="mt-4 rounded bg-gray-50 p-3 text-xs text-gray-500">
          <p>
            <strong>Username:</strong>
            {{ formState.username }}
          </p>
          <p v-if="formState.name">
            <strong>Họ tên:</strong>
            {{ formState.name }}
          </p>
          <p class="mt-1 italic text-amber-600">* Hiện tại hệ thống chỉ cho phép cập nhật trạng thái hoạt động của người dùng.</p>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

const adminStore = useAdminStore();
const { adminUser } = useApi();

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
  { title: "Tên đăng nhập", dataIndex: "username", key: "username", ellipsis: true },
  { title: "Họ tên", dataIndex: "name", key: "name", ellipsis: true },
  // { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber", width: 130 },
  // { title: "Chức vụ", dataIndex: "position", key: "position", ellipsis: true },
  // { title: "Site", dataIndex: "site", key: "site", width: 80, align: "center" },
  { title: "Trạng thái", dataIndex: "active", key: "active", width: 120, align: "center" },
  { title: "Thao tác", key: "action", width: 100, align: "center", fixed: "right" },
];

const formState = reactive({
  id: null,
  username: "",
  password: "",
  active: true,
  name: "", // Dùng để hiển thị khi edit
});

const rules = {
  username: [{ required: true, message: "Vui lòng nhập tên đăng nhập", trigger: "blur" }],
  password: [{ required: true, message: "Vui lòng nhập mật khẩu", trigger: "blur" }],
};

const param = ref({ PageIndex: 1, PageSize: 10, search: "" });

const {
  data: userResponse,
  refresh: refreshUsers,
  pending: loading,
} = await adminUser.get({
  params: param,
  key: "admin-users-list",
});

const dataSource = computed(() => {
  if (!userResponse.value?.success) return [];
  return userResponse.value.data.items || [];
});

watch(
  () => userResponse.value,
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

const handleSearch = () => {
  const search = (searchText.value || "").trim();
  param.value.search = search;
  param.value.PageIndex = 1;
  pagination.current = 1;
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, {
    id: null,
    username: "",
    password: "",
    active: true,
    name: "",
  });
  visible.value = true;
};

const editItem = async id => {
  isEdit.value = true;
  try {
    // key: `admin-permission-${Date.now()}`
    const { data } = await adminUser.getByRest("detail", {
      params: { id: id },
      key: `admin-user-detail-${id}-${Date.now()}`,
    });
    if (data.value?.success) {
      const detail = data.value.data;
      Object.assign(formState, {
        id: detail.id,
        username: detail.username,
        active: detail.active,
        name: detail.name,
      });
      visible.value = true;
    }
  } catch (err) {
    message.error("Không thể lấy thông tin chi tiết");
  }
};

const handleOk = async () => {
  try {
    if (!isEdit.value) {
      await formRef.value.validate();
    }
    confirmLoading.value = true;

    let res;
    if (isEdit.value) {
      const payload = {
        id: formState.id,
        active: formState.active,
      };
      res = await adminUser.put({ body: payload });
    } else {
      const payload = {
        username: formState.username,
        password: formState.password,
        active: formState.active,
      };
      res = await adminUser.post({ body: payload });
    }

    if (res.data.value?.success) {
      message.success(res.data.value?.message || "Thành công");
      visible.value = false;
      await refreshUsers();
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
    const { data } = await adminUser.delete({ params: { id: id } });
    if (data.value?.success) {
      message.success(data.value?.message || "Đã xóa");
      await refreshUsers();
    } else {
      message.error(data.value?.message || "Không thể xóa");
    }
  } catch (err) {
    message.error("Lỗi khi xóa");
  }
};

const resetForm = () => {
  searchText.value = "";
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  pagination.current = 1;
};
</script>
