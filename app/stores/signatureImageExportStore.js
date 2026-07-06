import { defineStore } from "pinia";

export const useSignatureImageExportStore = defineStore("signature-image-export", {
  state: () => ({
    trackId: null,
    status: null,
    fileUrl: null,
    attempts: 0,
    notificationCount: 0,
  }),

  actions: {
    start(trackId) {
      this.trackId = trackId;
      this.status = "processing";
      this.fileUrl = null;
      this.attempts = 0;
      this.notificationCount = 0;
    },
    incrementAttempts() {
      this.attempts += 1;
    },
    complete(fileUrl) {
      this.status = "done";
      this.fileUrl = fileUrl;
    },
    incrementNotificationCount() {
      this.notificationCount += 1;
    },
    clear() {
      this.$reset();
    },
  },

  persist: true,
});
