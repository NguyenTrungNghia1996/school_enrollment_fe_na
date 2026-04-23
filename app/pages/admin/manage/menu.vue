<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <!-- 🧭 Thanh công cụ tìm kiếm & thêm mới -->
    <div class="mb-6 flex flex-col items-end justify-end gap-2 md:flex-row md:items-center">
      <a-button type="primary" @click="showModal(null)" class="w-full md:w-auto" :disabled="!adminStore.currentPermission">Thêm mới</a-button>
    </div>

    <!-- 📋 Bảng danh sách menu -->
    <a-table :columns="columns" :data-source="nestedMenuData" :pagination="false" :loading="loading" :scroll="{ x: 1000 }" :row-class-name="rowClassName" :expand-icon-column-index="0" bordered size="small">
      <template #bodyCell="{ column, record }">
        <!-- Cột Icon -->
        <template v-if="column.key === 'icon'">
          <Icon :name="record.icon" />
        </template>
        <!-- Cột Hành động -->
        <template v-if="column.key === 'action'">
          <div class="flex justify-center gap-2">
            <a-tooltip title="Thêm menu con" v-if="getDepth(record) < 2">
              <a-button type="link" size="small" @click="showModal(record.id)" :disabled="!adminStore.currentPermission">
                <FolderAddOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="Sửa">
              <a-button type="link" size="small" @click="editItem(record)" :disabled="!adminStore.currentPermission">
                <EditOutlined />
              </a-button>
            </a-tooltip>
            <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
              <a-tooltip title="Xóa">
                <a-button type="link" danger size="small" :disabled="!adminStore.currentPermission">
                  <DeleteOutlined />
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 📝 Modal tạo / sửa menu -->
    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa menu' : currentParentId ? 'Thêm menu con' : 'Thêm menu mới'" @cancel="handleCancel" :width="700" :footer="null">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tiêu đề menu" name="title">
          <a-input v-model:value="formState.title" placeholder="Nhập tiêu đề menu" @input="onTitleInput" />
        </a-form-item>
        <a-form-item label="Key menu" name="key">
          <a-input v-model:value="formState.key" :disabled="true" placeholder="Tự động sinh từ tiêu đề" />
        </a-form-item>
        <a-form-item label="Đường dẫn" name="url">
          <a-input v-model:value="formState.url" />
        </a-form-item>
        <IconPicker v-model="formState.icon" />
        <!-- <a-form-item label="Menu cha" v-if="!currentParentId">
          <a-tree-select
            v-model:value="formState.parent_Id"
            :tree-data="menuOptions"
            placeholder="Chọn menu cha"
            :field-names="{ label: 'title', value: 'id', children: 'children' }"
            allow-clear
          />
        </a-form-item> -->
        <div class="mt-6 flex justify-end gap-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
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
const { adminMenus } = useApi();
const { buildTree } = useMenu();
// --- Trạng thái hiển thị ---
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const currentId = ref(null);
const currentParentId = ref(null);

// --- Dữ liệu & biểu mẫu ---
const formRef = ref();
const param = ref({ search: "" });

const {
  data: menuResponse,
  refresh: refreshMenus,
  pending: loading,
} = await adminMenus.get({
  params: param,
  key: "admin-menus",
});

const dataSource = computed(() => {
  if (!menuResponse.value?.success) return [];
  const nested = buildTree(menuResponse.value.data.items);
  adminStore.setMenu(nested);
  return menuResponse.value.data.items.map(item => ({
    ...item,
    key: item.keyCode || item.key,
    parentId: item.parentId === 0 || item.parentId === null || item.parent_Id === null ? 0 : (item.parentId ?? item.parent_Id),
  }));
});

const nestedMenuData = computed(() => buildNestedMenu(dataSource.value));
const menuOptions = computed(() => buildMenuOptions(dataSource.value));

const formState = reactive({
  id: null,
  title: "",
  key: "",
  url: "",
  icon: "",
  parentId: 0,
  permissionBit: 0,
});

const rules = {
  title: [{ required: true, message: "Vui lòng nhập tiêu đề", trigger: "blur" }],
  key: [{ required: true, message: "Vui lòng nhập key", trigger: "blur" }],
};

// --- Cấu hình bảng ---
const columns = [
  { title: "Tiêu đề", dataIndex: "title", key: "title", width: 200 },
  { title: "Key", dataIndex: "key", key: "key", width: 150 },
  { title: "Đường dẫn", dataIndex: "url", key: "url", width: 200, ellipsis: true },
  { title: "BitIndex", dataIndex: "permissionBit", key: "permissionBit", width: 100, ellipsis: true },
  { title: "Icon", dataIndex: "icon", key: "icon", width: 100, ellipsis: true },
  { title: "Thao tác", key: "action", align: "center", fixed: "right", width: 160 },
];

// --- Phân trang (dự phòng nếu thêm sau) ---
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 📌 Tạo key ngẫu nhiên
const generateRandomKey = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "menu-";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 📌 Gán key tự động từ tiêu đề
const onTitleInput = e => {
  formState.title = e.target.value;
  if (!isEdit.value) {
    formState.key = generateRandomKey();
  }
};

// 📌 Lấy permissionBit chưa dùng
const getNextAvailablePermissionBit = parentId => {
  const pId = parentId === null ? 0 : parentId;
  const siblings = dataSource.value.filter(i => i.parentId === pId);
  const usedBits = siblings.map(i => i.permissionBit).filter(bit => typeof bit === "number");
  for (let i = 0; i < 64; i += 2) {
    if (!usedBits.includes(i)) return i;
  }
  return usedBits.length * 2;
};

// 📌 Lấy độ sâu menu (cấp cha – con)
const getDepth = record => {
  let depth = 1;
  let parent = record.parentId === 0 ? null : dataSource.value.find(i => i.id === record.parentId);
  while (parent) {
    depth++;
    parent = parent.parentId === 0 ? null : dataSource.value.find(i => i.id === parent.parentId);
  }
  return depth;
};

// 📌 Đặt màu nền theo cấp độ
const rowClassName = record => {
  const level = getDepth(record);
  if (level === 1) return "level-1-row";
  if (level === 2) return "level-2-row";
  return "";
};

// 📌 Xây cây lồng nhau cho a-table
const buildNestedMenu = (items, parentId = 0) => {
  return items.filter(i => i.parentId === parentId).map(i => ({ ...i, children: buildNestedMenu(items, i.id) }));
};

// 📌 Tạo danh sách chọn menu cha
const buildMenuOptions = items => {
  return items.filter(i => i.parentId === 0).map(i => ({ id: i.id, title: i.title, children: [] }));
};

// 📌 Mở modal thêm mới / thêm con
const showModal = parentId => {
  const normalizedParentId = parentId === null ? 0 : parentId;
  if (normalizedParentId !== 0) {
    const parent = dataSource.value.find(i => i.id === normalizedParentId);
    if (getDepth(parent) >= 2) return message.warning("Chỉ cho phép tối đa 2 cấp menu");
  }

  isEdit.value = false;
  currentId.value = null;
  currentParentId.value = normalizedParentId;
  Object.assign(formState, {
    id: null,
    title: "",
    key: generateRandomKey(),
    url: "",
    icon: "",
    parentId: normalizedParentId,
    permissionBit: getNextAvailablePermissionBit(normalizedParentId),
  });
  visible.value = true;
};

// 📌 Mở modal sửa
const editItem = record => {
  isEdit.value = true;
  currentId.value = record.id;
  Object.assign(formState, { ...record });
  visible.value = true;
};

// 📌 Lưu dữ liệu
const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    const payload = {
      ...formState,
      keyCode: formState.key,
    };
    console.log(payload);
    let res;
    if (isEdit.value) {
      res = await adminMenus.put({ body: payload });
    } else {
      delete payload.id;
      res = await adminMenus.post({ body: payload });
    }
    const { data, error } = res;
    if (error.value) {
      message.error(error.value.data?.message || "Lỗi hệ thống");
      return;
    }

    if (data.value?.success) {
      message.success(isEdit.value ? "Cập nhật thành công" : "Thêm mới thành công");
      visible.value = false;
      await refreshMenus();
    } else {
      message.error(data.value?.message || (isEdit.value ? "Cập nhật thất bại" : "Thêm mới thất bại"));
    }
  } catch (err) {
    message.error(err.message || "Lỗi khi lưu menu");
  } finally {
    confirmLoading.value = false;
  }
};

// 📌 Đóng modal
const handleCancel = () => {
  formRef.value?.resetFields();
  visible.value = false;
};

// 📌 Xóa menu
const deleteItem = async id => {
  try {
    const { data, error } = await adminMenus.delete({ params: { id: id } });

    if (error.value) {
      message.error(error.value.data?.message || "Lỗi hệ thống khi xóa");
      return;
    }

    if (data.value?.success) {
      message.success("Xóa thành công");
      await refreshMenus();
    } else {
      message.error(data.value?.message || "Xóa thất bại");
    }
  } catch {
    message.error("Lỗi khi xóa");
  }
};

// // 📌 Tìm kiếm menu
// const handleSearch = async () => {
//   param.value.search = searchText.value
//   await fetchData({ ...param.value })
// }

// 🚀 Khởi tạo dữ liệu khi vào trang
// (Tự động thực hiện bởi useFetch top-level)
</script>

<style scoped>
:deep(.level-1-row) {
  background-color: #fafafa;
}
:deep(.level-2-row) {
  background-color: #f5f5f5;
}
</style>
