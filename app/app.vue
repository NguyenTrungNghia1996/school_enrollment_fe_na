<template>
  <a-extract-style>
    <a-config-provider :locale="locale" :theme="theme">
      <BaseLoading :loading="loading" title="Đang tải dữ liệu" description="Dữ liệu đang được xử lý..." :transparent="false" :show-logo="true" logo-class="w-24 h-24" />
      <BaseLoading :loading="settingStore.isLoading" :title="settingStore.loading.title" :description="settingStore.loading.description" :transparent="settingStore.loading.transparent" :show-logo="settingStore.loading.showLogo" logo-class="w-24 h-24" />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-config-provider>
  </a-extract-style>
</template>
<script setup>
import vi_VN from "ant-design-vue/es/locale/vi_VN";
const locale = computed(() => {
  return vi_VN;
});
const settingStore = useSettingStore();
const loading = ref(true);
const nuxtApp = useNuxtApp();
nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:finish", () => {
  loading.value = false;
});
const theme = ref({
  token: {
    colorPrimary: "#0057A0", // Màu xanh dương đậm – màu chủ đạo
    colorSuccess: "#7AC943", // Màu xanh lá – dùng cho thành công
    colorWarning: "#F59E0B", // Màu vàng cam – cảnh báo
    colorError: "#DC2626", // Màu đỏ – trạng thái lỗi
    colorInfo: "#0057A0",
    borderRadius: 8, // Bo góc đồng nhất cho các component (nút, input, card)
    fontFamily: "Roboto, sans-serif",
  },
});
</script>
