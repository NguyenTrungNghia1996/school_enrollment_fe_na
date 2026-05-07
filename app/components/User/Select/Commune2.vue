<template>
  <a-form-item :label="label" :name="name" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-select :value="normalizedModelValue" @update:value="handleUpdateValue" :search-value="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="resolvedPlaceholder" :size="size" :loading="loading" :disabled="isSelectDisabled" allow-clear class="w-full" :options="options" @search="onSearch" @inputKeyDown="onInputKeyDown" @clear="onClear" :filter-option="false" />
  </a-form-item>
</template>

<script setup>
const { communeUser } = useApi();
const instance = getCurrentInstance();

const props = defineProps({
  modelValue: [Array, Number, String],
  idProvince: {
    type: [Number, String],
    default: null,
  },
  label: { type: String, default: "Phường / Xã" },
  name: { type: String, default: "communeId" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn phường / xã" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  labelCol: { type: Object, default: () => ({ span: 24 }) },
  wrapperCol: { type: Object, default: () => ({ span: 24 }) },
});

const emit = defineEmits(["update:modelValue", "change"]);

const search = ref("");
const hasInitializedProvince = ref(false);
let retryTimer = null;

const normalizedProvinceId = computed(() => {
  if (props.idProvince === null || props.idProvince === undefined || props.idProvince === "") {
    return null;
  }

  return props.idProvince;
});

const hasProvince = computed(() => normalizedProvinceId.value !== null);
const selectPlaceholder = computed(() => "Vui lòng chọn tỉnh / thành phố trước");
const isSelectDisabled = computed(() => props.disabled || !hasProvince.value);
const resolvedPlaceholder = computed(() => (hasProvince.value ? props.placeholder : selectPlaceholder.value));
const normalizeOptionValue = value => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  return String(value);
};

const params = ref({
  pageIndex: 1,
  pageSize: 1000,
  idProvince: undefined,
  search: "",
});

const asyncDataKey = `user-commune-select2-${instance?.uid ?? Math.random().toString(36).slice(2)}`;

const {
  data: response,
  refresh: refreshData,
  pending: loading,
} = await communeUser.get({
  params,
  key: asyncDataKey,
  immediate: false,
});

const options = computed(() => {
  if (!hasProvince.value) return [];
  if (!response.value?.success) return [];

  const items = Array.isArray(response.value.data?.items) ? response.value.data.items : [];
  return items.map(item => ({
    label: item.communeName,
    value: normalizeOptionValue(item.id),
  }));
});

const normalizedModelValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue.map(item => normalizeOptionValue(item)).filter(item => item !== undefined) : [];
  }

  return normalizeOptionValue(props.modelValue);
});

const fetchCommunes = async () => {
  if (!hasProvince.value) {
    params.value.idProvince = undefined;
    return;
  }

  params.value.idProvince = normalizedProvinceId.value;
  await refreshData();
};

const resetSearch = () => {
  search.value = "";
  const hadSearch = params.value.search !== "";
  params.value.search = "";
  return hadSearch;
};

const onSearch = val => {
  search.value = val || "";
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
  resetSearch();
};

const handleUpdateValue = (val, option) => {
  const nextValue = props.multiple ? (Array.isArray(val) ? val.map(item => (item === undefined ? item : Number(item))) : []) : val === undefined || val === null ? null : Number(val);

  emit("update:modelValue", nextValue);
  emit("change", nextValue, option);

  if (search.value) {
    resetSearch();
  }
};

const clearRetryTimer = () => {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
};

const scheduleRetry = () => {
  clearRetryTimer();

  if (!hasProvince.value || loading.value || options.value.length > 0) {
    return;
  }

  retryTimer = setTimeout(async () => {
    retryTimer = null;

    if (!hasProvince.value || loading.value || options.value.length > 0) {
      return;
    }

    await fetchCommunes();
  }, 1000);
};

watch(
  normalizedProvinceId,
  (newValue, oldValue) => {
    const hadSearch = resetSearch();
    clearRetryTimer();

    if (!newValue) {
      params.value.idProvince = undefined;
      if (hasInitializedProvince.value) {
        emit("update:modelValue", props.multiple ? [] : null);
        emit("change", props.multiple ? [] : null, null);
      }
      hasInitializedProvince.value = true;
      return;
    }

    if (hasInitializedProvince.value && oldValue !== newValue) {
      emit("update:modelValue", props.multiple ? [] : null);
      emit("change", props.multiple ? [] : null, null);
    }

    hasInitializedProvince.value = true;
    if (hadSearch) return;
    fetchCommunes();
  },
  { immediate: true },
);

watch(
  () => params.value.search,
  () => {
    if (!hasProvince.value) return;
    fetchCommunes();
  },
);

watch(
  [hasProvince, options, loading],
  () => {
    scheduleRetry();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearRetryTimer();
});
</script>
