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

export const getDisplayFileName = fileName => {
  const rawFileName = String(fileName || "").trim();
  if (!rawFileName) return "";

  const normalizedFileName = rawFileName
    .replace(/^[0-9]{10,}-/i, "")
    .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "")
    .replace(/^[0-9a-f-]+-/i, "");

  const maxLength = 48;
  if (normalizedFileName.length <= maxLength) {
    return normalizedFileName;
  }

  const lastDotIndex = normalizedFileName.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0;
  const extension = hasExtension ? normalizedFileName.slice(lastDotIndex) : "";
  const baseName = hasExtension ? normalizedFileName.slice(0, lastDotIndex) : normalizedFileName;

  const suffixLength = Math.min(12, Math.max(8, extension.length + 6), baseName.length);
  const prefixLength = Math.max(16, maxLength - suffixLength - extension.length - 3);

  if (baseName.length <= prefixLength + suffixLength) {
    return normalizedFileName;
  }

  return `${baseName.slice(0, prefixLength)}...${baseName.slice(-suffixLength)}${extension}`;
};
