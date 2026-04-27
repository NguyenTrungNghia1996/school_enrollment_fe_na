export const useS3Upload = (endpoint = "/api/upload") => {
  const userRequest = new RequestUser();

  const normalizeUploadHeaders = headers => {
    if (!headers || typeof headers !== "object") {
      return {};
    }

    return Object.entries(headers).reduce((result, [key, value]) => {
      if (value === undefined || value === null || value === "") {
        return result;
      }

      result[key.toLowerCase() === "content_type" ? "Content-Type" : key] = value;
      return result;
    }, {});
  };

  const getPresignedUrl = async payload => {
    const { data, error } = await userRequest.put(endpoint, {
      body: payload,
    });

    if (error.value || data.value?.success === false || !data.value?.data?.value) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể lấy presigned URL.");
    }

    return data.value.data.value;
  };

  const upload = async (file, options = {}) => {
    if (!file) {
      throw new Error("Thiếu file để upload.");
    }

    const presigned = await getPresignedUrl({
      key: options.key || file.name,
      contentType: options.contentType || file.type || "application/octet-stream",
    });

    if (!presigned.url || !presigned.direct_url) {
      throw new Error("Response presigned URL không hợp lệ.");
    }

    await $fetch(presigned.url, {
      method: "PUT",
      headers: normalizeUploadHeaders(presigned.headers),
      body: file,
    });

    return {
      url: presigned.direct_url,
      directUrl: presigned.direct_url,
      key: presigned.key,
      presigned,
    };
  };

  return {
    getPresignedUrl,
    upload,
  };
};
