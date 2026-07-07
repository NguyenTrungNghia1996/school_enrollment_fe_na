import { defineStore } from "pinia";

export const useSignatureImageExportStore = defineStore("signature-image-export", {
  state: () => ({
    jobs: [],
  }),

  actions: {
    start(trackId, fileName = null) {
      const existingJob = this.jobs.find(job => job.trackId === trackId);
      const nextJob = {
        trackId,
        status: "processing",
        fileUrl: null,
        fileName,
        attempts: 0,
        notificationCount: 0,
      };

      if (existingJob) {
        Object.assign(existingJob, nextJob);
        return;
      }

      this.jobs.unshift(nextJob);
    },
    incrementAttempts(trackId) {
      const job = this.jobs.find(item => item.trackId === trackId);
      if (job) {
        job.attempts += 1;
      }
    },
    complete(trackId, fileUrl, fileName = null) {
      const job = this.jobs.find(item => item.trackId === trackId);
      if (!job) return;

      job.status = "done";
      job.fileUrl = fileUrl;
      if (fileName) {
        job.fileName = fileName;
      }
    },
    incrementNotificationCount(trackId) {
      const job = this.jobs.find(item => item.trackId === trackId);
      if (job) {
        job.notificationCount += 1;
      }
    },
    remove(trackId) {
      this.jobs = this.jobs.filter(job => job.trackId !== trackId);
    },
    clear() {
      this.$reset();
    },
  },

  persist: true,
});
