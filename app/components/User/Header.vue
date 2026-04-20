<template>
  <header class="fixed inset-x-0 top-0 z-50 border-t-[6px] border-[#173b84] bg-white/90 backdrop-blur-md shadow-[0_4px_30px_rgba(23,59,132,0.08)]">
    <div class="flex min-h-[100px] w-full items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8 2xl:px-12">
      <div class="flex flex-col md:flex-row min-w-0 items-center md:items-end gap-4">
        <img :src="unitStore.logoFull || unitStore.logo" :alt="unitStore.name" class="h-[60px] w-auto max-w-full hover:opacity-95 transition-opacity" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const unitStore = useUnitStore();
const headerLogo = computed(() => unitStore.logoFull || unitStore.logo);
</script>
