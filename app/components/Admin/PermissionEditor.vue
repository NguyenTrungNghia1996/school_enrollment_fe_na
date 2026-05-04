<template>
  <a-table :columns="menuColumns" :data-source="flatMenuData" size="small" bordered :pagination="false" :scroll="{ y: '60vh' }" :loading="loading">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'permission' && record.permissionBit !== undefined">
        <a-radio-group size="small" option-type="button" button-style="solid" :value="getPermission(record.key, record.permissionBit)" @change="e => setPermission(record.key, record.permissionBit, e.target.value)">
          <a-radio :value="0">Ẩn</a-radio>
          <a-radio :value="1">Xem</a-radio>
          <a-radio :value="2">Duyệt</a-radio>
          <a-radio :value="3">Sửa</a-radio>
        </a-radio-group>
      </template>
      <template v-else-if="column.dataIndex === 'title'">
        <div :style="{ paddingLeft: (record.level * 16) + 'px' }" class="flex items-center">
          <span v-if="record.children" class="mr-1">📁</span>
          <span v-else class="mr-1">📄</span>
          {{ record.title }}
        </div>
      </template>
    </template>
  </a-table>
</template>

<script setup>
const { adminMenus } = useApi()

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const {
  data: menuResponse,
  refresh: refreshMenus,
  pending: loading,
} = await adminMenus.get();

// Dữ liệu phẳng từ API
const flatData = computed(() => {
  if (menuResponse.value?.success) {
    return menuResponse.value.data.items || [];
  }
  return [];
});

const flatMenuData = computed(() => buildMenuWithLevel(flatData.value));
const menuPermissions = reactive({});

// Khởi tạo menuPermissions khi dữ liệu menu hoặc modelValue thay đổi
watch(
  [flatData, () => props.modelValue],
  ([newFlatData, newModelValue]) => {
    if (newFlatData && newFlatData.length > 0) {
      initMenuPermissions(newFlatData, newModelValue);
    }
  },
  { immediate: true, deep: true },
);

// Chuyển flat list thành nested structure với level
function buildMenuWithLevel(data, parentId = 0, level = 0) {
  const result = []
  data
    .filter(item => {
      const pId = item.parentId ?? item.parent_Id;
      return pId === parentId || (parentId === 0 && pId === null);
    })
    .forEach(item => {
      const key = item.keyCode || item.key;
      const children = buildMenuWithLevel(data, item.id, level + 1)
      result.push({
        ...item,
        key,
        level,
        children: children.length > 0 ? children : undefined
      })
    })
  return result
}

function getParentKeys(menuData) {
  return menuData
    .filter(d => (d.parentId ?? d.parent_Id) === 0 || (d.parentId ?? d.parent_Id) === null)
    .map(d => d.keyCode || d.key)
}

function normalizeInputPermissions(menuData, inputPermissions = []) {
  const parentKeys = getParentKeys(menuData)
  const orderedKeys = ['menu', ...parentKeys]
  const validKeys = new Set(orderedKeys)

  return inputPermissions
    .map((item, index) => {
      const resolvedKey = item.key || item.keyCode || orderedKeys[index]
      return {
        key: resolvedKey,
        permissionValue: item.permissionValue
      }
    })
    .filter(item => validKeys.has(item.key) && typeof item.permissionValue === 'number')
}
// Khởi tạo menuPermissions từ dữ liệu server
function initMenuPermissions(menuData, serverPerms) {
  const normalizedPermissions = normalizeInputPermissions(menuData, serverPerms)
  Object.keys(menuPermissions).forEach(key => {
    delete menuPermissions[key]
  })
  const serverPermsMap = {}
  normalizedPermissions.forEach(item => {
    serverPermsMap[item.key] = item.permissionValue
  })
  menuPermissions.menu = serverPermsMap.menu || 0
  const parentKeys = getParentKeys(menuData)
  parentKeys.forEach(key => {
    menuPermissions[key] = serverPermsMap[key] || 0
  })
}

// Theo dõi thay đổi của modelValue (2 chiều)
watch(() => props.modelValue, (newVal) => {
  if (flatData.value.length > 0) {
    initMenuPermissions(flatData.value, newVal)
  }
}, { deep: true })

const menuColumns = [
  { title: 'Tên Menu', dataIndex: 'title' },
  // { title: 'Key', dataIndex: 'key' },
  { title: 'Quyền', dataIndex: 'permission' },
]

const isTopLevel = (key) => flatMenuData.value.some(m => m.key === key)
const findParentKey = (childKey) => {
  const child = flatData.value.find(item => (item.keyCode || item.key) === childKey)
  if (!child) return null
  const parent = flatData.value.find(item => item.id === (child.parentId ?? child.parent_Id))
  return parent?.keyCode || parent?.key
}

const getPermission = (key, permissionBit) => {
  const isParent = isTopLevel(key)
  const parentKey = isParent ? 'menu' : findParentKey(key)
  return ((menuPermissions[parentKey] ?? 0) >> permissionBit) & 0b11
}

const setPermission = (key, permissionBit, val) => {
  const isParent = isTopLevel(key)
  const parentKey = isParent ? 'menu' : findParentKey(key)
  const current = menuPermissions[parentKey] ?? 0
  const cleared = current & ~(0b11 << permissionBit)
  const updated = cleared | (val << permissionBit)
  menuPermissions[parentKey] = updated

  // Emit dữ liệu 2 chiều
  emit('update:modelValue', permissionList.value)
}

const columns = [
  { title: 'Tên', dataIndex: 'title' },
  { title: 'Key', dataIndex: 'key' },
  { title: 'Quyền', dataIndex: 'permission' },
]

const serverColumns = [
  { title: 'Key', dataIndex: 'key' },
  { title: 'Permission Value', dataIndex: 'permissionValue' },
]

const formatPermission = (val) => val === 0 ? 'Ẩn' : val === 1 ? 'Xem' : val === 2 ? 'Duyệt' : 'Sửa'

const flattenPermissions = (nodes) =>
  nodes.flatMap(n => {
    const row = []
    if (n.permissionBit !== undefined)
      row.push({ title: n.title, key: n.key, permission: getPermission(n.key, n.permissionBit) })
    if (n.children) row.push(...flattenPermissions(n.children))
    return row
  })
const flatPermissions = computed(() => flattenPermissions(flatMenuData.value))

const permissionList = computed(() => {
  // Luôn trả về đầy đủ các menu cha kể cả không có trong modelValue
  const allParentKeys = flatData.value
    .filter(item => (item.parentId ?? item.parent_Id) === 0 || (item.parentId ?? item.parent_Id) === null)
    .map(item => item.keyCode || item.key)

  const result = []

  // Thêm tất cả các menu cha vào kết quả
  allParentKeys.forEach(key => {
    result.push({
      key,
      permissionValue: menuPermissions[key] || 0
    })
  })

  // Thêm menu gốc
  result.unshift({
    key: 'menu',
    permissionValue: menuPermissions.menu || 0
  })

  return result
})

// Khởi tạo component
</script>

<style scoped>
.table-container {
  height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container :deep(.ant-table) {
  flex: 1;
  overflow: auto;
}

.table-container :deep(.ant-table-container) {
  height: 100%;
}
</style>
