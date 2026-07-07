<template>
  <span class="hidden" aria-hidden="true"></span>
</template>

<script setup>
import { Button, notification } from "ant-design-vue";
import { h } from "vue";

const { adminSignatureImageStatus } = useApi();
const signatureImageExportStore = useSignatureImageExportStore();

const notificationKey = "signature-image-export";
const maxAttempts = 60;
const maxNotifications = 1;
let pollTimer = null;

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

const downloadFile = fileUrl => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = "";
  document.body.appendChild(link);
  link.click();
  link.remove();

  notification.destroy(notificationKey);
  signatureImageExportStore.clear();
};

const showReadyNotification = () => {
  const fileUrl = signatureImageExportStore.fileUrl;
  if (!fileUrl || signatureImageExportStore.notificationCount >= maxNotifications) return;

  signatureImageExportStore.incrementNotificationCount();
  notification.success({
    key: notificationKey,
    placement: "bottomRight",
    style: {
      width: "480px",
      maxWidth: "calc(100vw - 32px)",
    },
    message: "Danh sách điểm danh hình ảnh đã sẵn sàng",
    description: "Nhấn nút bên dưới để tải file.",
    duration: 0,
    btn: () =>
      h(
        Button,
        {
          type: "primary",
          onClick: () => downloadFile(fileUrl),
        },
        { default: () => "Tải file" },
      ),
  });

  // if (signatureImageExportStore.notificationCount >= maxNotifications) {
  //   signatureImageExportStore.clear();
  // }
};

const failExport = errorMessage => {
  clearPollTimer();
  signatureImageExportStore.clear();
  notification.error({
    key: notificationKey,
    placement: "bottomRight",
    style: {
      width: "480px",
      maxWidth: "calc(100vw - 32px)",
    },
    message: "Xuất danh sách điểm danh hình ảnh thất bại",
    description: errorMessage || "Không thể hoàn thành file sau 60 lần kiểm tra.",
  });
};

const poll = async () => {
  clearPollTimer();

  if (!signatureImageExportStore.trackId || signatureImageExportStore.status === "done") return;
  if (signatureImageExportStore.attempts >= maxAttempts) {
    failExport("Không thể hoàn thành file sau 60 lần kiểm tra.");
    return;
  }

  try {
    signatureImageExportStore.incrementAttempts();
    const responseData = await fetchStatus(signatureImageExportStore.trackId);
    const status = String(responseData?.data?.status || "").toLowerCase();
    const fileUrl = responseData?.data?.fileUrl;

    if (status === "done" && fileUrl) {
      signatureImageExportStore.complete(fileUrl);
      showReadyNotification();
      return;
    }

    if (["failed", "error"].includes(status)) {
      failExport(responseData?.message || "Hệ thống không thể tạo file.");
      return;
    }
  } catch (error) {
    if (signatureImageExportStore.attempts >= maxAttempts) {
      failExport(error?.message);
      return;
    }
  }

  pollTimer = setTimeout(poll, 10000);
};

watch(
  () => signatureImageExportStore.trackId,
  trackId => {
    clearPollTimer();
    if (trackId && signatureImageExportStore.status !== "done") {
      notification.destroy(notificationKey);
      pollTimer = setTimeout(poll, 10000);
    }
  },
);

onMounted(() => {
  if (signatureImageExportStore.status === "done" && signatureImageExportStore.fileUrl) {
    showReadyNotification();
  } else if (signatureImageExportStore.trackId) {
    poll();
  }
});

onBeforeUnmount(() => {
  clearPollTimer();
  notification.destroy(notificationKey);
});
</script>
