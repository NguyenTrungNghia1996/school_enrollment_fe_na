<template>
  <span class="inline-flex items-center">
    <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-left text-blue-600 underline-offset-2 transition hover:text-blue-500 hover:underline" @click="openPreview">
      {{ displayName }}
    </button>

    <a-drawer v-model:open="isPreviewOpen" :title="displayName" :footer="null" height="100vh" placement="bottom" :body-style="{ padding: '0px' }" destroy-on-close>
      <iframe :src="src" class="h-full w-full rounded-lg border border-slate-200" title="PDF Preview" />
    </a-drawer>
  </span>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    default: "",
  },
});

const isPreviewOpen = ref(false);

const fileName = computed(() => {
  if (!props.src) {
    return "";
  }

  try {
    const { pathname } = new URL(props.src);
    const segments = pathname.split("/").filter(Boolean);

    return decodeURIComponent(segments.at(-1) || props.src);
  } catch {
    const cleanUrl = props.src.split("?")[0].split("#")[0];
    const segments = cleanUrl.split("/").filter(Boolean);

    return decodeURIComponent(segments.at(-1) || props.src);
  }
});

const displayName = computed(() => {
  return getDisplayFileName(fileName.value);
});

const openPreview = () => {
  if (!props.src) {
    return;
  }

  isPreviewOpen.value = true;
};
</script>
