<template>
  <a-form-item :label="label" :name="name" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-select
      :value="modelValue"
      @update:value="handleUpdateValue"
      v-model:searchValue="search"
      :mode="multiple ? 'multiple' : undefined"
      show-search
      :placeholder="selectPlaceholder"
      :size="size"
      :loading="loading"
      :disabled="isDisabled"
      allow-clear
      class="w-full"
      :options="options"
      @search="onSearch"
      @clear="onClear"
      :filter-option="false" />
  </a-form-item>
</template>

<script setup>
import debounce from "lodash/debounce";

const { communeUser } = useApi();

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
const searchKeyword = ref("");
const response = ref(null);
const loading = ref(false);

const normalizedProvinceId = computed(() => {
  if (props.idProvince === null || props.idProvince === undefined || props.idProvince === "") {
    return null;
  }

  return props.idProvince;
});

const hasProvince = computed(() => normalizedProvinceId.value !== null);
const isDisabled = computed(() => props.disabled || !hasProvince.value);
const selectPlaceholder = computed(() => (hasProvince.value ? props.placeholder : "Vui lòng chọn tỉnh / thành phố trước"));

const options = computed(() => {
  if (!response.value?.success) return [];

  const items = Array.isArray(response.value.data?.items) ? response.value.data.items : [];
  return items.map(item => ({
    label: item.communeName,
    value: item.id,
  }));
});

const fetchCommunes = async () => {
  if (!hasProvince.value) {
    response.value = null;
    return;
  }

  loading.value = true;

  try {
    const { data, error } = await communeUser.get({
      query: {
        idProvince: normalizedProvinceId.value,
        search: searchKeyword.value || undefined,
      },
    });

    if (error.value) {
      throw new Error(error.value?.data?.message || "Không tải được danh sách phường / xã");
    }

    response.value = data.value;
  } catch (_error) {
    response.value = {
      success: false,
      data: {
        items: [],
      },
    };
  } finally {
    loading.value = false;
  }
};

const onSearch = debounce(val => {
  searchKeyword.value = (val || "").trim();
}, 300);

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  emit("change", props.multiple ? [] : null, null);
  search.value = "";
  searchKeyword.value = "";
};

const handleUpdateValue = (val, option) => {
  emit("update:modelValue", val);
  emit("change", val, option);

  if (search.value) {
    search.value = "";
    searchKeyword.value = "";
  }
};

watch(
  normalizedProvinceId,
  (newValue, oldValue) => {
    search.value = "";
    searchKeyword.value = "";

    if (!newValue) {
      response.value = null;
      emit("update:modelValue", props.multiple ? [] : null);
      emit("change", props.multiple ? [] : null, null);
      return;
    }

    if (oldValue !== newValue) {
      emit("update:modelValue", props.multiple ? [] : null);
      emit("change", props.multiple ? [] : null, null);
    }

    fetchCommunes();
  },
  { immediate: true }
);

watch(searchKeyword, () => {
  if (!hasProvince.value) return;
  fetchCommunes();
});
</script>
