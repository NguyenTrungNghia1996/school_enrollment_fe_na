<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <UserHeader />

    <div class="flex min-h-screen flex-col pt-[100px]">
      <main class="flex-1">
        <div class="w-full">
          <slot />
        </div>
      </main>

      <UserFooter />
    </div>
  </div>
</template>

<script setup></script>
