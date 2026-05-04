import { message } from "ant-design-vue";

const canShowMessage = () => import.meta.client && typeof document !== "undefined";

const callMessage = (type, content) => {
  if (!canShowMessage()) return;
  return message[type](content);
};

export const useSafeMessage = () => ({
  success: content => callMessage("success", content),
  error: content => callMessage("error", content),
  info: content => callMessage("info", content),
  warning: content => callMessage("warning", content),
});
