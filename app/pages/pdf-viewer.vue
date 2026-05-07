<template>
  <div class="min-h-screen bg-slate-100 px-4 py-10">
    <div class="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Demo Ant Design Vue</p>
          <h1 class="mt-2 text-2xl font-semibold text-slate-900">Preview file từ URL</h1>
          <p class="mt-2 text-sm text-slate-600">Render danh sách URL bằng `v-for`, tự nhận diện ảnh hoặc PDF theo đuôi file.</p>
        </div>

        <a-button @click="goBack">Quay lại</a-button>
      </div>

      <div class="space-y-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <div>
          <p class="text-xs font-medium text-slate-500">Mảng dữ liệu mẫu</p>
          <div class="mt-1 space-y-1">
            <p v-for="link in documentLinks" :key="link" class="break-all text-sm text-slate-700">
              {{ link }}
            </p>
          </div>
        </div>

        <div>
          <p class="text-xs font-medium text-slate-500">Component output</p>
          <div class="mt-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <template v-for="(link, index) in documentLinks" :key="link">
              <BaseImagePreviewLink v-if="getFileType(link) === 'image'" :src="link" />
              <BasePdfPreviewLink v-else-if="getFileType(link) === 'pdf'" :src="link" />
              <span v-else class="text-sm text-slate-700">
                {{ getDisplayName(link) }}
              </span>
              <span v-if="index < documentLinks.length - 1" class="text-slate-400">,</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "empty",
});

const documentLinks = ["https://cdn.nghia196.io.vn/admin/053a54fa-dc84-493c-9ae1-8d3695ea2b29-example.jpg", "https://cdn.nghia196.io.vn/admin/13c32059-550e-4197-b3c0-be58ff17a08f-example.pdf"];

useHead(() => ({
  title: "Demo Xem Tài Liệu",
}));

const getFileName = link => {
  if (!link) {
    return "";
  }

  try {
    const { pathname } = new URL(link);
    const segments = pathname.split("/").filter(Boolean);

    return decodeURIComponent(segments.at(-1) || link);
  } catch {
    const cleanUrl = link.split("?")[0].split("#")[0];
    const segments = cleanUrl.split("/").filter(Boolean);

    return decodeURIComponent(segments.at(-1) || link);
  }
};

const getDisplayName = link => {
  return getDisplayFileName(getFileName(link));
};

const getFileType = link => {
  const fileName = getFileName(link).toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(fileName)) {
    return "image";
  }

  if (fileName.endsWith(".pdf")) {
    return "pdf";
  }

  return "unsupported";
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/");
};
</script>
