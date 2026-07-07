<template>
  <span class="hidden" aria-hidden="true"></span>
</template>

<script setup>
import { Button, notification } from "ant-design-vue";
import { h } from "vue";

const { adminSignatureImageStatus } = useApi();
const signatureImageExportStore = useSignatureImageExportStore();

const notificationKeyPrefix = "signature-image-export";
const maxAttempts = 60;
const maxNotifications = 1;
const pollIntervalMs = 10000;
let pollTimer = null;
let isPolling = false;

const getNotificationKey = trackId => `${notificationKeyPrefix}-${trackId}`;

const clearPollTimer = () => {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
};

const fetchStatus = async trackId => {
  const { data, error } = await adminSignatureImageStatus.get({
    params: {
      trackId,
    },
    key: `admin-signature-image-status-${trackId}-${Date.now()}`,
  });

  if (error.value || data.value?.success === false) {
    throw new Error(error.value?.data?.message || data.value?.message || "Không thể kiểm tra trạng thái xuất file");
  }

  return data.value;
};

const getProcessingJobs = () => signatureImageExportStore.jobs.filter(job => job.status === "processing");

const removeJob = trackId => {
  notification.destroy(getNotificationKey(trackId));
  signatureImageExportStore.remove(trackId);
};

const downloadFile = job => {
  if (!job?.fileUrl) return;

  const link = document.createElement("a");
  link.href = job.fileUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = job.fileName || "";
  document.body.appendChild(link);
  link.click();
  link.remove();

  removeJob(job.trackId);
};

const showReadyNotification = trackId => {
  const job = signatureImageExportStore.jobs.find(item => item.trackId === trackId);
  if (!job?.fileUrl || job.notificationCount >= maxNotifications) return;

  const fileName = job.fileName || "File danh sách điểm danh hình ảnh";
  signatureImageExportStore.incrementNotificationCount(trackId);
  notification.success({
    key: getNotificationKey(trackId),
    placement: "bottomRight",
    style: {
      width: "480px",
      maxWidth: "calc(100vw - 32px)",
    },
    message: "Danh sách điểm danh hình ảnh đã sẵn sàng",
    description: `File: ${fileName}`,
    duration: 0,
    btn: () =>
      h(
        "div",
        {
          class: "flex gap-2",
        },
        [
          h(
            Button,
            {
              type: "primary",
              onClick: () => downloadFile(job),
            },
            { default: () => "Tải file" },
          ),
          h(
            Button,
            {
              danger: true,
              onClick: () => removeJob(trackId),
            },
            { default: () => "Xóa" },
          ),
        ],
      ),
  });
};

const failExport = (trackId, errorMessage) => {
  const job = signatureImageExportStore.jobs.find(item => item.trackId === trackId);
  const fileName = job?.fileName;

  signatureImageExportStore.remove(trackId);
  notification.error({
    key: getNotificationKey(trackId),
    placement: "bottomRight",
    style: {
      width: "480px",
      maxWidth: "calc(100vw - 32px)",
    },
    message: "Xuất danh sách điểm danh hình ảnh thất bại",
    description: fileName ? `${fileName}: ${errorMessage || "Không thể hoàn thành file sau 60 lần kiểm tra."}` : errorMessage || "Không thể hoàn thành file sau 60 lần kiểm tra.",
  });
};

const pollJob = async job => {
  if (job.attempts >= maxAttempts) {
    failExport(job.trackId, "Không thể hoàn thành file sau 60 lần kiểm tra.");
    return;
  }

  try {
    signatureImageExportStore.incrementAttempts(job.trackId);
    const responseData = await fetchStatus(job.trackId);
    const status = String(responseData?.data?.status || "").toLowerCase();
    const fileUrl = responseData?.data?.fileUrl;
    const fileName = responseData?.data?.fileName;

    if (status === "done" && fileUrl) {
      signatureImageExportStore.complete(job.trackId, fileUrl, fileName);
      showReadyNotification(job.trackId);
      return;
    }

    if (["failed", "error"].includes(status)) {
      failExport(job.trackId, responseData?.message || "Hệ thống không thể tạo file.");
    }
  } catch (error) {
    const latestJob = signatureImageExportStore.jobs.find(item => item.trackId === job.trackId);
    if (latestJob?.attempts >= maxAttempts) {
      failExport(job.trackId, error?.message);
    }
  }
};

const poll = async () => {
  clearPollTimer();
  if (isPolling) return;

  const jobs = getProcessingJobs();
  if (!jobs.length) return;

  isPolling = true;
  await Promise.allSettled(jobs.map(job => pollJob({ ...job })));
  isPolling = false;

  if (getProcessingJobs().length) {
    pollTimer = setTimeout(poll, pollIntervalMs);
  }
};

const startPolling = () => {
  if (!pollTimer && !isPolling && getProcessingJobs().length) {
    pollTimer = setTimeout(poll, 0);
  }
};

watch(
  () => signatureImageExportStore.jobs.map(job => `${job.trackId}:${job.status}`).join("|"),
  () => {
    startPolling();
  },
);

onMounted(() => {
  signatureImageExportStore.jobs.filter(job => job.status === "done" && job.fileUrl).forEach(job => showReadyNotification(job.trackId));
  startPolling();
});

onBeforeUnmount(() => {
  clearPollTimer();
});
</script>
