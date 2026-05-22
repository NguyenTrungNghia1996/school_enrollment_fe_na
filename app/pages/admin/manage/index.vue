<template>
  <div class="min-h-full bg-white p-2 md:p-4">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm quản trị viên..." enter-button @search="handleSearch" class="w-full" />
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
              <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!adminStore.canViewCurrentPage">
                <template #icon><EditOutlined /></template>
              </a-button>
              <a-popconfirm title="Bạn chắc chắn muốn đặt lại mật khẩu cho quản trị viên này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="resetPassword(record.id)">
                <a-button type="link" size="small" :loading="resettingPasswordId === record.id" :disabled="!adminStore.canEditCurrentPage">
                  <template #icon><KeyOutlined /></template>
                </a-button>
              </a-popconfirm>
              <!-- <a-popconfirm title="Bạn chắc chắn muốn xóa quản trị viên này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-button type="link" danger size="small" :disabled="!adminStore.canEditCurrentPage">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm> -->
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa Quản trị viên' : 'Thêm mới Quản trị viên'" @cancel="handleCancel" :width="600" :confirm-loading="confirmLoading" :ok-button-props="{ disabled: isEdit && !adminStore.canEditCurrentPage }" @ok="handleOk">
      <a-form ref="formRef" :model="formState" :rules="rules" :disabled="isEditReadOnly" layout="vertical" class="mt-4">
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <a-form-item label="Tên đăng nhập" name="username" v-if="!isEdit">
            <a-input v-model:value="formState.username" placeholder="Nhập tên đăng nhập" :maxlength="10" show-count />
          </a-form-item>

          <a-form-item label="Họ và tên" name="name">
            <a-input v-model:value="formState.name" placeholder="Nhập họ tên" :maxlength="100" show-count />
          </a-form-item>

          <a-form-item label="Số điện thoại" name="phoneNumber">
            <a-input v-model:value="formState.phoneNumber" placeholder="Nhập số điện thoại" />
          </a-form-item>

          <a-form-item label="Chức vụ" name="position">
            <a-input v-model:value="formState.position" placeholder="Nhập chức vụ" :maxlength="100" show-count />
          </a-form-item>

          <div class="md:col-span-2">
            <AdminSelectRoles v-model="formState.idRoles" :rules="rules.idRoles" multiple label="Vai trò" placeholder="Chọn vai trò gán cho admin" name="idRoles" />
          </div>

          <a-form-item label="Trạng thái" name="active" class="md:col-span-2">
            <a-switch v-model:checked="formState.active" checked-children="Hoạt động" un-checked-children="Khóa" />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
const adminStore = useAdminStore();
const { adminManage } = useApi();

const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const resettingPasswordId = ref(null);
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
  { title: "Tên đăng nhập", dataIndex: "username", key: "username", ellipsis: true },
  { title: "Họ tên", dataIndex: "name", key: "name", ellipsis: true },
  { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber", width: 120 },
  { title: "Chức vụ", dataIndex: "position", key: "position", ellipsis: true },
  { title: "Trạng thái", dataIndex: "active", key: "active", width: 120, align: "center" },
  { title: "Thao tác", key: "action", width: 140, align: "center", fixed: "right" },
];

const formState = reactive({
  id: null,
  username: "",
  name: "",
  phoneNumber: "",
  position: "",
  active: true,
  idRoles: [],
});

const rules = {
  username: [
    { required: true, message: "Vui lòng nhập tên đăng nhập", trigger: "blur" },
    { max: 10, message: "Tên đăng nhập tối đa 10 ký tự", trigger: "blur" },
  ],
  name: [
    { required: true, message: "Vui lòng nhập họ tên", trigger: "blur" },
    { max: 100, message: "Họ và tên tối đa 100 ký tự", trigger: "blur" },
  ],
  phoneNumber: [{ pattern: /^[0-9]+$/, message: "Số điện thoại không hợp lệ", trigger: "blur" }],
  position: [{ max: 100, message: "Chức vụ tối đa 100 ký tự", trigger: "blur" }],
  idRoles: [{ required: true, type: "array", message: "Vui lòng chọn ít nhất một vai trò", trigger: "change" }],
};

const param = ref({ PageIndex: 1, PageSize: 10, search: "" });

const {
  data: adminResponse,
  refresh: refreshAdmins,
  pending: loading,
} = await adminManage.get({
  params: param,
  key: "admin-manage-list",
});

const dataSource = computed(() => {
  if (!adminResponse.value?.success) return [];
  return adminResponse.value.data.items || [];
});
watch(
  () => adminResponse.value,
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
    name: "",
    phoneNumber: "",
    position: "",
    active: true,
    idRoles: [],
  });
  visible.value = true;
};

const editItem = async id => {
  isEdit.value = true;
  try {
    const { data } = await adminManage.getByRest("detail", {
      params: { id: id },
      key: `admin-manage-detail-${id}-${Date.now()}`,
    });
    if (data.value?.success) {
      const detail = data.value.data;
      Object.assign(formState, {
        id: detail.id,
        username: detail.username,
        name: detail.name,
        phoneNumber: detail.phoneNumber,
        position: detail.position,
        active: detail.active,
        idRoles: Array.isArray(detail.roles) ? detail.roles.map(r => r.id) : detail.idRoles || [],
      });
      visible.value = true;
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
  await formRef.value.validate();
  try {
    confirmLoading.value = true;
    let res;
    if (isEdit.value) {
      const payload = { ...formState };
      res = await adminManage.put({ body: payload });
    } else {
      const payload = { ...formState };
      delete payload.id;
      res = await adminManage.post({ body: payload });
    }

    if (res.data.value?.success) {
      message.success(res.data.value?.message || "Thành công");
      visible.value = false;
      await refreshAdmins();
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
    const { data } = await adminManage.delete({ params: { id: id } });
    if (data.value?.success) {
      message.success(data.value?.message || "Đã xóa");
      const nextTotal = Math.max(Number(pagination.total || 0) - 1, 0);
      const nextPage = Math.max(1, Math.ceil(nextTotal / pagination.pageSize));
      if (pagination.current > nextPage) {
        pagination.current = nextPage;
        param.value.PageIndex = nextPage;
      }
      await refreshAdmins();
    } else {
      message.error(data.value?.message || "Không thể xóa");
    }
  } catch (err) {
    message.error("Lỗi khi xóa");
  }
};

const resetPassword = async id => {
  resettingPasswordId.value = id;
  try {
    const { data, error } = await adminManage.postByRest("resetPassword", {
      params: { id },
    });

    if (data.value?.success) {
      message.success(data.value?.message || "Đặt lại mật khẩu thành công");
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể đặt lại mật khẩu");
    }
  } catch (err) {
    message.error(err.message || "Lỗi khi đặt lại mật khẩu");
  } finally {
    resettingPasswordId.value = null;
  }
};

const resetForm = () => {
  searchText.value = "";
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  pagination.current = 1;
};
</script>
