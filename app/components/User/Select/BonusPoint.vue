<template>
  <a-form-item :label="label" :name="name" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-select :value="modelValue" :mode="multiple ? 'multiple' : undefined" :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" :options="options" show-search allow-clear class="w-full" option-filter-prop="label" @update:value="handleUpdateValue" @clear="onClear" />
  </a-form-item>
</template>

<script setup>
const { applicationUser } = useApi();
const instance = getCurrentInstance();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Điểm khuyến khích" },
  name: { type: String, default: "bonusPointId" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn điểm khuyến khích" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  labelCol: { type: Object, default: () => ({ span: 24 }) },
  wrapperCol: { type: Object, default: () => ({ span: 24 }) },
});

const emit = defineEmits(["update:modelValue", "change"]);
const asyncDataKey = `user-bonus-point-select-${instance?.uid ?? Math.random().toString(36).slice(2)}`;

const { data: response, pending: loading } = await applicationUser.getByRest("bonus_points", {
  key: asyncDataKey,
});

const options = computed(() => {
  if (!response.value?.success) return [];

  const items = Array.isArray(response.value.data?.items) ? response.value.data.items : [];
  return items.map(item => ({
    label: item.bonus_point_name,
    value: item.id,
  }));
});

const onClear = () => {
  const value = props.multiple ? [] : null;
  emit("update:modelValue", value);
  emit("change", value, null);
};

const handleUpdateValue = (value, option) => {
  emit("update:modelValue", value);
  emit("change", value, option);
};
</script>
