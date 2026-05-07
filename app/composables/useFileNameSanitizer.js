export const sanitizeOriginalFileName = fileName => {
  const normalized = String(fileName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const lastDotIndex = normalized.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0;
  const baseName = hasExtension ? normalized.slice(0, lastDotIndex) : normalized;
  const extension = hasExtension ? normalized.slice(lastDotIndex + 1) : "";

  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  const sanitizedExtension = extension.replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
  const safeBaseName = sanitizedBaseName || "file";

  return sanitizedExtension ? `${safeBaseName}.${sanitizedExtension}` : safeBaseName;
};

export const sanitizeUploadKey = key => {
  const rawKey = String(key || "").trim();
  if (!rawKey) return "file";

  const segments = rawKey.split("/");
  const lastSegment = segments.pop() || "";
  const sanitizedLastSegment = sanitizeOriginalFileName(lastSegment);

  return [...segments, sanitizedLastSegment].filter(Boolean).join("/");
};
