<template>
  <footer class="bg-[#071f41] text-gray-300">
    <!-- Main Footer -->
    <div class="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-4">
        <!-- Brand Section -->
        <div class="space-y-6 lg:col-span-2">
          <img :src="unitStore.logoFull || unitStore.logo" alt="Logo" class="h-16 w-auto" />
          <p class="max-w-md text-sm leading-relaxed">Hệ thống tuyển sinh trực tuyến của {{ unitStore.name }}. Chúng tôi cam kết mang lại quy trình đăng ký minh bạch, nhanh chóng và chính xác cho mọi thí sinh.</p>
          <div class="flex gap-4">
            <a v-for="social in socials" :key="social.icon" href="#" class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-primary hover:text-white">
              <Icon :name="social.icon" class="text-xl" />
            </a>
          </div>
        </div>

        <!-- Links Section -->
        <div>
          <h3 class="mb-6 text-sm font-bold uppercase tracking-widest text-white">Liên kết nhanh</h3>
          <ul class="space-y-4 text-sm font-medium">
            <li v-for="link in quickLinks" :key="link.label">
              <a href="#" class="underline-offset-4 transition-colors hover:text-white hover:underline">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Contact Section -->
        <div>
          <h3 class="mb-6 text-sm font-bold uppercase tracking-widest text-white">Liên hệ</h3>
          <ul class="space-y-4 text-sm">
            <li class="flex items-start gap-3">
              <Icon name="lucide:map-pin" class="mt-1 shrink-0 text-primary" />
              <span>{{ unitStore.address }}</span>
            </li>
            <li class="flex items-center gap-3">
              <Icon name="lucide:phone" class="shrink-0 text-blue-400" />
              <span>{{ unitStore.phone }}</span>
            </li>
            <li class="flex items-center gap-3">
              <Icon name="lucide:mail" class="shrink-0 text-blue-400" />
              <span class="truncate">{{ unitStore.email }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="mx-auto border-t border-white/5 bg-black/20 py-8">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 text-xs font-medium sm:flex-row sm:px-6 lg:px-8">
        <p>Bản quyền &copy; {{ currentYear }} {{ unitStore.name }}. Bảo lưu mọi quyền.</p>
        <div class="mt-4 flex gap-6 sm:mt-0">
          <a href="#" class="hover:text-white">Điều khoản sử dụng</a>
          <a href="#" class="hover:text-white">Chính sách bảo mật</a>
          <a href="#" class="hover:text-white">Produced by Nguyen Anh EST</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const unitStore = useUnitStore();
const currentYear = new Date().getFullYear();

// const quickLinks = [{ label: "Trang chủ" }, { label: "Quy chế tuyển sinh" }, { label: "Hướng dẫn đăng ký" }, { label: "Tra cứu kết quả" }, { label: "Tin tức - Sự kiện" }];
const quickLinks = [
  { label: "Trang chủ", url: "/" },
  { label: "Hướng dẫn đăng ký", url: "/instructions" },
  // { label: "Quy chế tuyển sinh", url: "/quy-che-tuyen-sinh" },
  // { label: "Tra cứu kết quả", url: "/tra-cuu-ket-qua" },
  // { label: "Tin tức - Sự kiện", url: "/tin-tuc-su-kien" },
];
const socials = [{ icon: "lucide:facebook" }, { icon: "lucide:globe" }, { icon: "lucide:youtube" }];
</script>
