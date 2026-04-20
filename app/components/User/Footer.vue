<template>
  <footer class="relative w-full bg-[#0f2b57] text-white">
    <!-- Overlapping Logo -->
    <div class="absolute left-1/2 top-0 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[6px] border-[#22395e] bg-[#22395e] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      <img :src="unitStore.logo" :alt="unitStore.name" class="h-16 w-16 object-contain" />
    </div>

    <div class="w-full px-4 pb-6 pt-16 sm:px-6 lg:px-8 2xl:px-12">
      <div class="grid gap-8 border-b border-white/10 pb-8 text-center text-sm sm:grid-cols-2 sm:text-left lg:grid-cols-3 lg:items-start">
        <div class="space-y-4">
          <div class="space-y-2 leading-7 text-white/90">
            <p class="text-lg font-bold uppercase text-white">{{ unitStore.name }}</p>
            <p>
              <Icon name="ant-design:environment-outlined" class="mr-2" />
              {{ unitStore.address }}
            </p>
            <p>
              <Icon name="ant-design:mail-outlined" class="mr-2" />
              {{ unitStore.email }}
            </p>
            <p>
              <Icon name="ant-design:phone-outlined" class="mr-2" />
              {{ unitStore.phone }}
            </p>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center space-y-3 text-sm text-white/80">
          <div class="flex gap-6 text-sm font-medium uppercase tracking-wide text-white/90">
            <a href="/" class="transition hover:text-[#ffd36b]">Trang chủ</a>
            <a href="#" class="transition hover:text-[#ffd36b]">Cổng khảo thí</a>
          </div>
          <p>Bản quyền © {{ currentYear }} {{ unitStore.name }}</p>
        </div>

        <div class="space-y-4 text-center sm:text-right">
          <div class="space-y-2 text-white/90">
            <p class="text-base font-semibold uppercase text-white">Thống kê truy cập</p>
            <p>
              Đang trực tuyến:
              <span class="font-bold text-[#ffd36b]">1</span>
            </p>
            <p>
              Tổng truy cập:
              <span class="font-bold text-[#ffd36b]">1,204</span>
            </p>
          </div>
        </div>
      </div>
      <div class="pt-5 text-center text-xs text-white/60">Copyright &copy; 2025 Produced by Nguyen Anh EST</div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const unitStore = useUnitStore();
const currentYear = new Date().getFullYear();
</script>
