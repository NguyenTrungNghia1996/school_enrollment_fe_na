export const useS3Upload = endpoint => {
  // const request = new Request();
  const userRequest = new RequestUser();
  const getPresignedUrl = async payload => {
    const { data, error } = await userRequest.put(endpoint, {
      body: payload,
    });

    if (error.value) throw error.value;
    if (!data.value || data.value.status !== "success") {
      throw new Error(data.value?.message);
    }

    return data.value.data;
  };

  const upload = async file => {
    const presigned = await getPresignedUrl({
      filename: file.name,
      filetype: file.type,
    });

    await $fetch(presigned.url, {
      method: "PUT",
      // headers: presigned.headers,
      body: file,
    });

    return presigned.public_url;
  };

  return { upload };
};
