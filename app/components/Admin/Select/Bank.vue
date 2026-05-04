<template>
  <template v-if="!noFormItem">
    <a-form-item :label="label" :name="name" :rules="rules" :label-col="inlineLabel ? { span: 8 } : { span: 24 }" :wrapper-col="inlineLabel ? { span: 16 } : { span: 24 }">
      <div class="flex w-full items-center gap-2">
        <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="flex-1" :options="options" @search="onSearch" @clear="onClear" :filter-option="false">
          <template #option="{ label, shortName, bin, logo }">
            <div class="flex items-center gap-3">
              <img v-if="logo" :src="logo" :alt="shortName || label" class="h-5 w-5 shrink-0 rounded object-contain" />
              <div class="min-w-0">
                <div class="truncate font-medium">{{ shortName || label }}</div>
                <!-- <div class="truncate text-xs text-slate-500">{{ label }}<span v-if="bin"> • {{ bin }}</span></div> -->
              </div>
            </div>
          </template>
        </a-select>
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
        <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="flex-1" :options="options" @search="onSearch" @clear="onClear" :filter-option="false">
          <template #option="{ label, shortName, bin, logo }">
            <div class="flex items-center gap-3">
              <img v-if="logo" :src="logo" :alt="shortName || label" class="h-5 w-5 shrink-0 rounded object-contain" />
              <div class="min-w-0">
                <div class="truncate font-medium">{{ shortName || label }}</div>
                <div class="truncate text-xs text-slate-500">
                  {{ label }}
                  <!-- <span v-if="bin">• {{ bin }}</span> -->
                </div>
              </div>
            </div>
          </template>
        </a-select>
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
        <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" @clear="onClear" :filter-option="false">
          <template #option="{ label, shortName, bin, logo }">
            <div class="flex items-center gap-3">
              <img v-if="logo" :src="logo" :alt="shortName || label" class="h-5 w-5 shrink-0 rounded object-contain" />
              <div class="min-w-0">
                <div class="truncate font-medium">{{ shortName || label }}</div>
                <div class="truncate text-xs text-slate-500">
                  {{ label }}
                  <!-- <span v-if="bin">• {{ bin }}</span> -->
                </div>
              </div>
            </div>
          </template>
        </a-select>
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
import { computed, ref, watch } from "vue";
import debounce from "lodash/debounce";

const { adminBank } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Ngân hàng:" },
  name: { type: String, default: "bank" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn ngân hàng" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  autoSelectFirst: { type: Boolean, default: false },
  noFormItem: { type: Boolean, default: false },
  inlineLabel: { type: Boolean, default: false },
  showNavigationButtons: { type: Boolean, default: false },
  valueField: { type: String, default: "id" },
});

const emit = defineEmits(["update:modelValue", "change"]);

const search = ref("");
const params = ref({
  pageIndex: 1,
  pageSize: 100,
  search: "",
});

const { data: bankResponse, pending: loading } = await adminBank.get({
  params: params,
  key: "admin-bank-select",
});

const rawItems = computed(() => {
  if (!bankResponse.value?.success) return [];
  return Array.isArray(bankResponse.value.data?.items) ? bankResponse.value.data.items : [];
});

const options = computed(() =>
  rawItems.value.map(item => ({
    label: item.name,
    value: item[props.valueField] ?? item.name,
    key: item.id,
    id: item.id,
    name: item.name,
    shortName: item.shortName,
    bin: item.bin,
    logo: item.logo,
    raw: item,
  })),
);

const hasNavigation = computed(() => props.showNavigationButtons && !props.multiple);
const currentIndex = computed(() => options.value.findIndex(option => option.value == props.modelValue));
const canSelectPrev = computed(() => hasNavigation.value && options.value.length > 0 && (currentIndex.value > 0 || currentIndex.value === -1));
const canSelectNext = computed(() => hasNavigation.value && options.value.length > 0 && (currentIndex.value === -1 || currentIndex.value < options.value.length - 1));

watch(
  () => bankResponse.value,
  newVal => {
    if (newVal?.success && props.autoSelectFirst && !params.value.search && (props.modelValue === undefined || props.modelValue === null || props.modelValue === "" || (Array.isArray(props.modelValue) && props.modelValue.length === 0))) {
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
