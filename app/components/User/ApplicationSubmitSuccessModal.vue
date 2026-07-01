<template>
  <a-modal :open="open" :width="480" :footer="null" :closable="false" :mask-closable="false" centered destroy-on-close>
    <div class="overflow-hidden rounded-3xl bg-white text-center">
      <div class="relative bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pb-16 pt-10 text-white">
        <div class="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-white/10"></div>
        <div class="absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div class="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white shadow-xl shadow-emerald-900/20">
          <Icon name="lucide:check" class="text-4xl text-emerald-600" />
        </div>
      </div>

      <div class="relative -mt-8 rounded-t-[2rem] bg-white px-6 pb-7 pt-8 sm:px-9">
        <h2 class="text-2xl font-black tracking-tight text-slate-900">Nộp hồ sơ thành công!</h2>
        <p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">{{ message }}</p>

        <div class="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-left">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Icon name="lucide:mail-check" class="text-xl" />
          </div>
          <p class="text-sm leading-6 text-slate-600">Nhà trường sẽ kiểm tra hồ sơ và gửi thông báo đến email đã đăng ký. Vui lòng theo dõi email thường xuyên.</p>
        </div>

        <a-button type="primary" size="large" class="mt-7 h-12 w-full rounded-xl font-bold shadow-lg shadow-blue-500/20" @click="$emit('confirm')">
          {{ actionText }}
          <Icon name="lucide:arrow-right" class="ml-1" />
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "Hồ sơ của bạn đã được gửi thành công và đang chờ nhà trường xác nhận.",
  },
  actionText: {
    type: String,
    default: "Hoàn tất",
  },
});

defineEmits(["confirm"]);
</script>

<style scoped>
:deep(.ant-modal-content) {
  overflow: hidden;
  border-radius: 1.5rem;
  padding: 0;
}
</style>
