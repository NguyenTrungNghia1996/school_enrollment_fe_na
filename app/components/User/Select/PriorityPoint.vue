<template>
  <a-form-item :label="label" :name="name" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <a-select :value="modelValue" :mode="multiple ? 'multiple' : undefined" :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" :options="options" show-search allow-clear class="min-w-0 flex-1" option-filter-prop="label" @update:value="handleUpdateValue" @clear="onClear">
        <template #option="{ label, pointLabel }">
          <div class="flex items-center justify-between gap-3">
            <span>{{ label }}</span>
            <span v-if="pointLabel" class="shrink-0 font-semibold text-emerald-600">+{{ pointLabel }} điểm</span>
          </div>
        </template>
      </a-select>
      <div class="flex h-10 min-w-28 shrink-0 items-center justify-center rounded-xl border px-4 text-sm font-bold transition-colors" :class="selectedPointLabel ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'">
        {{ selectedPointLabel ? `+${selectedPointLabel} điểm` : "Chưa chọn" }}
      </div>
    </div>
  </a-form-item>
</template>

<script setup>
const { applicationUser } = useApi();
const instance = getCurrentInstance();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Điểm ưu tiên" },
  name: { type: String, default: "priorityPointId" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn điểm ưu tiên" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  labelCol: { type: Object, default: () => ({ span: 24 }) },
  wrapperCol: { type: Object, default: () => ({ span: 24 }) },
});

const emit = defineEmits(["update:modelValue", "change"]);
const asyncDataKey = `user-priority-point-select-${instance?.uid ?? Math.random().toString(36).slice(2)}`;

const { data: response, pending: loading } = await applicationUser.getByRest("priority_point", {
  key: asyncDataKey,
});

const formatPoint = point => {
  const numericPoint = Number(point);
  if (!Number.isFinite(numericPoint)) return null;

  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(numericPoint);
};

const options = computed(() => {
  if (!response.value?.success) return [];

  const items = Array.isArray(response.value.data?.items) ? response.value.data.items : [];
  return items.map(item => ({
    label: item.priority_point_name,
    value: item.id,
    point: item.priority_point,
    pointLabel: formatPoint(item.priority_point),
  }));
});

const selectedPointLabel = computed(() => {
  const selectedValues = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
  const selectedOptions = options.value.filter(option => selectedValues.some(value => value == option.value));
  if (!selectedOptions.length) return null;

  const total = selectedOptions.reduce((sum, option) => sum + (Number(option.point) || 0), 0);
  return formatPoint(total);
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
