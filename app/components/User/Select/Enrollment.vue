<template>
  <template v-if="!noFormItem">
    <a-form-item :label="label" :name="name" :rules="rules" :label-col="inlineLabel ? { span: 8 } : { span: 24 }" :wrapper-col="inlineLabel ? { span: 16 } : { span: 24 }">
      <div class="flex w-full items-center gap-2">
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
          class="flex-1"
          :options="options"
          @search="onSearch"
          @clear="onClear"
          :filter-option="false" />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </a-form-item>
  </template>
  <template v-else>
    <div v-if="inlineLabel" class="flex items-center gap-2 py-1">
      <label v-if="label" class="min-w-[100px] text-sm font-medium">{{ label }}</label>
      <div class="flex flex-1 items-center gap-2">
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
          class="flex-1"
          :options="options"
          @search="onSearch"
          @clear="onClear"
          :filter-option="false" />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </div>
    <template v-else>
      <label v-if="label" class="mb-1 block text-sm font-medium">{{ label }}</label>
      <div class="flex items-center gap-2">
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
          :filter-option="false" />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </template>
  </template>
</template>

<script setup>
import debounce from "lodash/debounce";

const { examUser } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Kì tuyển sinh:" },
  name: { type: String, default: "enrollmentId" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn kì tuyển sinh" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  autoSelectFirst: { type: Boolean, default: false },
  noFormItem: { type: Boolean, default: false },
  inlineLabel: { type: Boolean, default: false },
  showNavigationButtons: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "change"]);

const search = ref("");
const params = ref({
  pageIndex: 1,
  pageSize: 100,
  search: "",
});

const {
  data: enrollmentResponse,
  pending: loading,
} = await examUser.get({
  query: params,
  key: "user-enrollment-select",
});

const options = computed(() => {
  if (!enrollmentResponse.value?.success) return [];
  const items = Array.isArray(enrollmentResponse.value.data?.items) ? enrollmentResponse.value.data.items : [];
  return items.map(item => ({
    label: item.examName,
    value: item.id,
    isDefault: item.isDefault,
  }));
});

const hasNavigation = computed(() => props.showNavigationButtons && !props.multiple);
const currentIndex = computed(() => options.value.findIndex(option => option.value == props.modelValue));
const canSelectPrev = computed(() => hasNavigation.value && options.value.length > 0 && (currentIndex.value > 0 || currentIndex.value === -1));
const canSelectNext = computed(() => hasNavigation.value && options.value.length > 0 && (currentIndex.value === -1 || currentIndex.value < options.value.length - 1));

watch(
  () => enrollmentResponse.value,
  newVal => {
    if (
      newVal?.success &&
      props.autoSelectFirst &&
      !params.value.search &&
      (props.modelValue === undefined || props.modelValue === null || props.modelValue === "" || (Array.isArray(props.modelValue) && props.modelValue.length === 0))
    ) {
      const firstOption = options.value[0];
      if (firstOption) {
        const defaultValue = props.multiple ? [firstOption.value] : firstOption.value;
        emit("update:modelValue", defaultValue);
        emit("change", defaultValue, firstOption);
      }
    }
  },
  { immediate: true },
);

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

  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared || search.value) {
    search.value = "";
    params.value.search = "";
  }
};

const selectPrevious = () => {
  if (!canSelectPrev.value || options.value.length === 0) return;
  const idx = currentIndex.value === -1 ? options.value.length - 1 : Math.max(currentIndex.value - 1, 0);
  const target = options.value[idx];
  if (target) {
    handleUpdateValue(target.value, target);
  }
};

const selectNext = () => {
  if (!canSelectNext.value || options.value.length === 0) return;
  const idx = currentIndex.value === -1 ? 0 : Math.min(currentIndex.value + 1, options.value.length - 1);
  const target = options.value[idx];
  if (target) {
    handleUpdateValue(target.value, target);
  }
};
</script>
