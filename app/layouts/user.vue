<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <UserHeader />

    <div class="flex min-h-screen flex-col pt-[100px]">
      <main class="flex-1">
        <div :class="contentClass">
          <slot />
        </div>
      </main>

      <UserFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const contentClass = computed(() => {
  if (route.meta.fullWidth) {
    return "w-full";
  }

  return "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8";
});
</script>
