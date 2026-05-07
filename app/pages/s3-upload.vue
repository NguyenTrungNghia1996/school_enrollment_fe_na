<template>
  <div class="min-h-screen bg-slate-100 px-4 py-10">
    <div class="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Demo S3 Upload</p>
          <h1 class="mt-2 text-2xl font-semibold text-slate-900">Test upload file lên S3</h1>
          <p class="mt-2 text-sm text-slate-600">Chọn file, gọi `PUT /api/upload` để lấy presigned URL, sau đó upload trực tiếp lên S3 và nhận `direct_url` để lưu.</p>
        </div>

        <a-button @click="goBack">Quay lại</a-button>
      </div>

      <div class="space-y-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <div>
          <p class="text-xs font-medium text-slate-500">Chọn file</p>
          <input type="file" class="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white" @change="handleFileChange" />
        </div>

        <div v-if="selectedFile" class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <p>
            <span class="font-medium text-slate-900">Tên file:</span>
            {{ selectedFile.name }}
          </p>
          <p class="mt-1">
            <span class="font-medium text-slate-900">Content type:</span>
            {{ selectedFile.type || "application/octet-stream" }}
          </p>
          <p class="mt-1">
            <span class="font-medium text-slate-900">Dung lượng:</span>
            {{ formatFileSize(selectedFile.size) }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <a-button type="primary" :loading="uploading" :disabled="!selectedFile" @click="handleUpload">Upload lên S3</a-button>
          <a-button :disabled="uploading" @click="resetState">Đặt lại</a-button>
        </div>

        <div v-if="errorMessage" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ errorMessage }}
        </div>

        <div v-if="uploadResult" class="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p class="text-sm font-medium text-emerald-800">Upload thành công</p>

          <div class="space-y-2 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700">
            <p class="break-all">
              <span class="font-medium text-slate-900">Key:</span>
              {{ uploadResult.key }}
            </p>
            <p class="break-all">
              <span class="font-medium text-slate-900">Direct URL:</span>
              {{ uploadResult.directUrl }}
            </p>
            <p class="break-all">
              <span class="font-medium text-slate-900">Presigned URL:</span>
              {{ uploadResult.presigned.url }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-slate-500">Preview</p>
            <div class="mt-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <BaseImagePreviewLink v-if="getFileType(uploadResult.directUrl) === 'image'" :src="uploadResult.directUrl" />
              <BasePdfPreviewLink v-else-if="getFileType(uploadResult.directUrl) === 'pdf'" :src="uploadResult.directUrl" />
              <span v-else>
                {{ getDisplayName(uploadResult.directUrl) }}
              </span>
            </div>
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

const { upload } = useS3Upload();

const selectedFile = ref(null);
const uploading = ref(false);
const errorMessage = ref("");
const uploadResult = ref(null);

useHead(() => ({
  title: "Test Upload S3",
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
  return getFileName(link).replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
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

const formatFileSize = size => {
  if (!Number.isFinite(size)) {
    return "-";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const handleFileChange = event => {
  const [file] = event.target.files || [];
  selectedFile.value = file || null;
  errorMessage.value = "";
  uploadResult.value = null;
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    errorMessage.value = "Vui lòng chọn file trước khi upload.";
    return;
  }

  uploading.value = true;
  errorMessage.value = "";
  uploadResult.value = null;

  try {
    uploadResult.value = await upload(selectedFile.value, {
      key: sanitizeOriginalFileName(selectedFile.value.name),
      contentType: selectedFile.value.type || "application/octet-stream",
    });
  } catch (error) {
    errorMessage.value = error?.message || "Upload thất bại.";
  } finally {
    uploading.value = false;
  }
};

const resetState = () => {
  selectedFile.value = null;
  uploading.value = false;
  errorMessage.value = "";
  uploadResult.value = null;
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/");
};
</script>
