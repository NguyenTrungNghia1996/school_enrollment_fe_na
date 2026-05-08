export const APPLICATION_REVIEW_STATUS = Object.freeze({
  DRAFT: 1,
  PENDING_CONFIRMATION: 2,
  PAID: 3,
  COMPLETED: 4,
});

export const APPLICATION_REVIEW_STATUS_LABELS = Object.freeze({
  [APPLICATION_REVIEW_STATUS.DRAFT]: "Nháp",
  [APPLICATION_REVIEW_STATUS.PENDING_CONFIRMATION]: "Chờ xác nhận",
  [APPLICATION_REVIEW_STATUS.PAID]: "Đã thanh toán",
  [APPLICATION_REVIEW_STATUS.COMPLETED]: "Hoàn thành",
});

export const getApplicationReviewStatus = value => Number(value?.idApplicationReviewStatus ?? value);
export const getApplicationReviewStatusLabel = value => APPLICATION_REVIEW_STATUS_LABELS[getApplicationReviewStatus(value)] || value?.statusName || "Không xác định";

export const isDraftApplicationReviewStatus = value => getApplicationReviewStatus(value) === APPLICATION_REVIEW_STATUS.DRAFT;
export const isPendingConfirmationApplicationReviewStatus = value => getApplicationReviewStatus(value) === APPLICATION_REVIEW_STATUS.PENDING_CONFIRMATION;
export const isPaidApplicationReviewStatus = value => getApplicationReviewStatus(value) === APPLICATION_REVIEW_STATUS.PAID;
export const isCompletedApplicationReviewStatus = value => getApplicationReviewStatus(value) === APPLICATION_REVIEW_STATUS.COMPLETED;

export const canPayApplicationReview = value => {
  const status = getApplicationReviewStatus(value);
  return status === APPLICATION_REVIEW_STATUS.DRAFT || status === APPLICATION_REVIEW_STATUS.PENDING_CONFIRMATION;
};

export const getApplicationReviewStatusColor = value => {
  const status = getApplicationReviewStatus(value);

  if (status === APPLICATION_REVIEW_STATUS.DRAFT) {
    return "default";
  }

  if (status === APPLICATION_REVIEW_STATUS.PENDING_CONFIRMATION) {
    return "processing";
  }

  if (status === APPLICATION_REVIEW_STATUS.PAID) {
    return "warning";
  }

  if (status === APPLICATION_REVIEW_STATUS.COMPLETED) {
    return "success";
  }

  return "default";
};
