export const APPLICATION_STATUS = Object.freeze({
  DRAFT: 1,
  PENDING_REVIEW: 2,
  APPROVED_PENDING_PAYMENT: 3,
  PAID_PENDING_VERIFICATION: 4,
  COMPLETED: 5,
});

export const APPLICATION_STATUS_LABELS = Object.freeze({
  [APPLICATION_STATUS.DRAFT]: "Nháp",
  [APPLICATION_STATUS.PENDING_REVIEW]: "Chờ duyệt",
  [APPLICATION_STATUS.APPROVED_PENDING_PAYMENT]: "Duyệt, chờ thanh toán",
  [APPLICATION_STATUS.PAID_PENDING_VERIFICATION]: "Đã thanh toán, chờ xác minh",
  [APPLICATION_STATUS.COMPLETED]: "Hoàn thành",
});

export const getApplicationStatus = value => Number(value?.idStatus ?? value);
export const getApplicationStatusLabel = value => APPLICATION_STATUS_LABELS[getApplicationStatus(value)] || "Không xác định";

export const isDraftApplicationStatus = value => getApplicationStatus(value) === APPLICATION_STATUS.DRAFT;
export const isPendingReviewApplicationStatus = value => getApplicationStatus(value) === APPLICATION_STATUS.PENDING_REVIEW;
export const isApprovedPendingPaymentApplicationStatus = value => getApplicationStatus(value) === APPLICATION_STATUS.APPROVED_PENDING_PAYMENT;
export const isPaidPendingVerificationApplicationStatus = value => getApplicationStatus(value) === APPLICATION_STATUS.PAID_PENDING_VERIFICATION;
export const isCompletedApplicationStatus = value => getApplicationStatus(value) === APPLICATION_STATUS.COMPLETED;

export const getApplicationStatusColor = value => {
  const status = getApplicationStatus(value);

  if (status === APPLICATION_STATUS.DRAFT) {
    return "default";
  }

  if (status === APPLICATION_STATUS.PENDING_REVIEW) {
    return "processing";
  }

  if (status === APPLICATION_STATUS.APPROVED_PENDING_PAYMENT) {
    return "warning";
  }

  if (status === APPLICATION_STATUS.PAID_PENDING_VERIFICATION) {
    return "cyan";
  }

  if (status === APPLICATION_STATUS.COMPLETED) {
    return "success";
  }

  return "default";
};
