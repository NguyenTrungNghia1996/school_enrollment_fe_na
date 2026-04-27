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
      @clear="onClear"
      :filter-option="false"
    />
  </a-form-item>
</template>

<script setup>
import debounce from "lodash/debounce";

const { provinceUser } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Tỉnh / Thành phố" },
  name: { type: String, default: "provinceId" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn tỉnh / thành phố" },
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

const {
  data: response,
  refresh: refreshData,
  pending: loading,
} = await provinceUser.get({
  params: params,
  key: "user-province-select",
});

const options = computed(() => {
  if (!response.value?.success) return [];
  const items = Array.isArray(response.value.data?.items) ? response.value.data.items : [];
  return items.map(item => ({
    label: item.provinceName,
    value: item.id,
  }));
});

const onSearch = debounce(val => {
  params.value.search = (val || "").trim();
}, 300);

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  emit("change", props.multiple ? [] : null, null);
  search.value = "";
  params.value.search = "";
};

const handleUpdateValue = (val, option) => {
  emit("update:modelValue", val);
  emit("change", val, option);

  if (search.value) {
    search.value = "";
    params.value.search = "";
  }
};
</script>
