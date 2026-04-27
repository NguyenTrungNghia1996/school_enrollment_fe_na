<template>
  <a-form-item :label="label" :name="name" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol"></a-form-item>
</template>

<script setup>
const props = defineProps({
  modelValue: [Array, Number, String],
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
</script>
