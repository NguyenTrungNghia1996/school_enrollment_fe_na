<template>
  <a-form-item :label="label" :name="name" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-select
      :value="modelValue"
      @update:value="handleUpdateValue"
      v-model:searchValue="search"
      :mode="multiple ? 'multiple' : undefined"
      show-search
      :placeholder="placeholder"
      :size="size"
      :loading="loading"
      :disabled="disabled"
      allow-clear
      class="w-full"
      :options="options"
      @search="onSearch"
      @inputKeyDown="onInputKeyDown"
      @clear="onClear"
      :filter-option="false"
    />
  </a-form-item>
</template>

<script setup>
const { ethnicityUser } = useApi();
const instance = getCurrentInstance();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Dân tộc" },
  name: { type: String, default: "ethnicityId" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn dân tộc" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  labelCol: { type: Object, default: () => ({ span: 24 }) },
  wrapperCol: { type: Object, default: () => ({ span: 24 }) },
});

const emit = defineEmits(["update:modelValue", "change"]);

const search = ref("");
const params = ref({
  pageIndex: 1,
  pageSize: 100,
  search: "",
});

const asyncDataKey = `user-ethnicity-select-${instance?.uid ?? Math.random().toString(36).slice(2)}`;

const {
  data: response,
  refresh: refreshData,
  pending: loading,
} = await ethnicityUser.get({
  params: params,
  key: asyncDataKey,
});

const options = computed(() => {
  if (!response.value?.success) return [];
  const items = Array.isArray(response.value.data?.items) ? response.value.data.items : [];
  return items.map(item => ({
    label: item.ethnicityName,
    value: item.id,
  }));
});

const onSearch = val => {
  search.value = val || "";
  if (!search.value.trim()) {
    params.value.search = "";
  }
};

const onInputKeyDown = event => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.stopPropagation();
  params.value.search = search.value.trim();
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  emit("change", props.multiple ? [] : null, null);
  search.value = "";
  params.value.search = "";
};

const handleUpdateValue = (val, option) => {
  emit("update:modelValue", val);
  emit("change", val, option);

  // Clear search after selection if needed
  if (search.value) {
    search.value = "";
    params.value.search = "";
  }
};
</script>
