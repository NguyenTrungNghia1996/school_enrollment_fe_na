<template>
  <div class="w-full pb-20 bg-slate-50">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-[#071f41] via-[#0b2b5c] to-[#051630] py-20 text-white shadow-lg">
      <div class="absolute inset-0 opacity-15">
        <div class="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary blur-[150px]"></div>
        <div class="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary blur-[150px]"></div>
      </div>

      <div class="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 border border-primary/30 backdrop-blur-sm">
          <Icon name="lucide:info" />
          HỖ TRỢ THÍ SINH
        </span>
        <h1 class="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl flex items-center justify-center gap-3">
          <Icon name="lucide:book-open" class="text-primary text-4xl lg:text-5xl" />
          Hướng Dẫn Sử Dụng
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-base lg:text-lg text-blue-100/80 leading-relaxed">
          <!-- Tài liệu hướng dẫn chi tiết quy trình đăng ký, nộp hồ sơ và phúc khảo trực tuyến dành cho thí sinh tham gia kỳ tuyển sinh. -->
          Tài liệu hướng dẫn chi tiết quy trình đăng ký và nộp hồ sơ trực tuyến dành cho thí sinh tham gia kỳ tuyển sinh.
        </p>
      </div>
    </section>

    <!-- Main Container -->
    <div class="container mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        
        <!-- Left Column: Content Area -->
        <div class="space-y-12">
          <article 
            v-for="section in sections" 
            :key="section.id" 
            :id="section.id" 
            class="section-element scroll-mt-32 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-slate-200/80 md:p-8"
          >
            <!-- Section Header -->
            <div class="mb-8 flex items-center gap-4 border-b border-slate-100 pb-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon :name="section.icon" class="text-2xl" />
              </div>
              <h2 class="text-xl font-extrabold text-slate-800 md:text-2xl">{{ section.title }}</h2>
            </div>

            <!-- Section Content Blocks -->
            <div class="space-y-6">
              <template v-for="(block, index) in section.blocks" :key="index">
                
                <!-- Paragraph block -->
                <p v-if="block.type === 'p'" class="text-base leading-relaxed text-slate-600 text-justify">
                  {{ block.content }}
                </p>

                <!-- Step block -->
                <div v-else-if="block.type === 'step'" class="flex gap-4 rounded-2xl bg-slate-50/70 p-5 border border-slate-100 transition-all hover:bg-slate-50 duration-200">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-blue-600 font-bold text-white text-sm shadow-md shadow-primary/20">
                    {{ block.number }}
                  </div>
                  <div class="pt-0.5">
                    <span class="font-extrabold text-slate-800 text-base">Bước {{ block.number }}:</span>
                    <p class="mt-1.5 text-base leading-relaxed text-slate-600">{{ block.content }}</p>
                  </div>
                </div>

                <!-- Note block -->
                <div v-else-if="block.type === 'note'" class="flex gap-4 rounded-r-2xl border-l-4 border-amber-500 bg-amber-50/40 p-5 text-amber-900 shadow-sm">
                  <Icon name="lucide:alert-circle" class="mt-0.5 shrink-0 text-amber-600 text-2xl" />
                  <div class="text-sm leading-relaxed">
                    <strong class="text-amber-800 font-bold block mb-1">Lưu ý quan trọng:</strong>
                    {{ block.content }}
                  </div>
                </div>

                <!-- Image block -->
                <div v-else-if="block.type === 'image'" class="flex flex-col items-center justify-center py-6 px-4 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200/80">
                  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md max-w-full hover:shadow-xl transition-all duration-300">
                    <a-image 
                      :src="block.src" 
                      :alt="block.caption" 
                      class="max-h-[460px] w-auto max-w-full object-contain cursor-zoom-in"
                    />
                  </div>
                  <span v-if="block.caption" class="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Icon name="lucide:image" class="text-sm" />
                    {{ block.caption }}
                  </span>
                </div>

              </template>
            </div>
          </article>
        </div>

        <!-- Right Column: Sticky Sidebar / Index (Table of Contents) -->
        <aside class="hidden lg:block">
          <div class="sticky top-[120px] space-y-6">
            <div class="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md">
              <h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Icon name="lucide:list" class="text-primary" />
                Chỉ mục
              </h3>
              <nav class="space-y-1.5">
                <button
                  v-for="item in sections"
                  :key="item.id"
                  @click="scrollToSection(item.id)"
                  class="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-all duration-300"
                  :class="activeSectionId === item.id 
                    ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20 translate-x-1' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5'"
                >
                  <Icon :name="item.icon" class="text-lg shrink-0" />
                  <span class="line-clamp-2">{{ item.title }}</span>
                </button>
              </nav>
            </div>

            <!-- Sticky Support Box -->
            <div class="rounded-2xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden group">
              <div class="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-500 blur-xl"></div>
              <h3 class="mb-2 text-base font-bold flex items-center gap-2">
                <Icon name="lucide:headphones" class="text-primary text-lg" />
                Cần hỗ trợ?
              </h3>
              <p class="mb-4 text-xs text-slate-400 leading-relaxed">Nếu bạn gặp khó khăn trong quá trình đăng ký, hãy liên hệ với chúng tôi qua các kênh bên dưới.</p>
              <div class="space-y-3.5 relative z-10">
                <div class="flex items-center gap-3 hover:translate-x-0.5 transition-transform duration-200">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-primary">
                    <Icon name="lucide:phone" class="text-base" />
                  </div>
                  <div>
                    <p class="text-[9px] uppercase tracking-wider text-slate-400">Hotline</p>
                    <p class="text-sm font-bold text-slate-100">{{ unitStore.phone || 'Chưa cập nhật' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 hover:translate-x-0.5 transition-transform duration-200">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-primary">
                    <Icon name="lucide:mail" class="text-base" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-[9px] uppercase tracking-wider text-slate-400">Email</p>
                    <p class="text-xs font-bold text-slate-100 truncate">{{ unitStore.email || 'Chưa cập nhật' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>

    <!-- Floating Table of Contents for Mobile and Tablets (Perfect Circle) -->
    <div class="lg:hidden fixed bottom-6 right-6 z-50">
      <a-popover trigger="click" placement="topRight" overlayClassName="mobile-toc-popover">
        <template #content>
          <div class="w-64 max-h-[360px] overflow-y-auto p-2">
            <h4 class="mb-3 font-bold text-slate-800 text-sm px-2 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Icon name="lucide:list" /> Chỉ mục nhanh
            </h4>
            <nav class="space-y-1">
              <button
                v-for="item in sections"
                :key="item.id"
                @click="scrollToSection(item.id)"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all"
                :class="activeSectionId === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-500 hover:bg-slate-50'"
              >
                <Icon :name="item.icon" class="text-base shrink-0" />
                <span class="truncate">{{ item.title }}</span>
              </button>
            </nav>
          </div>
        </template>
        <button class="h-14 w-14 shrink-0 rounded-full shadow-2xl bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center text-white cursor-pointer hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 duration-200 border-none focus:outline-none p-0">
          <Icon name="lucide:list" class="text-2xl text-white" />
        </button>
      </a-popover>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const unitStore = useUnitStore();
const SHOW_PAYMENT_GUIDANCE = false;

// Setup page meta to set title for SEO
useHead({
  title: 'Hướng dẫn sử dụng cổng tuyển sinh',
  meta: [
    // { name: 'description', content: 'Hướng dẫn đăng ký tài khoản, nộp hồ sơ và phúc khảo kết quả tuyển sinh trực tuyến.' }
    { name: 'description', content: 'Hướng dẫn đăng ký tài khoản và nộp hồ sơ tuyển sinh trực tuyến.' }
  ]
});

const activeSectionId = ref('account-reg');

const allSections = [
  {
    id: "account-reg",
    title: "Đăng ký tài khoản trên cổng thông tin",
    icon: "lucide:user-plus",
    blocks: [
      { type: "p", content: "Để thực hiện đăng ký hồ sơ dự thi, các thí sinh cần thực hiện tạo tài khoản trên cổng thông tin tuyển sinh trực tuyến bằng email cá nhân." },
      { type: "image", src: "/images/guide/img_1.jpg", caption: "Giao diện đăng ký tài khoản" },
      { type: "p", content: "Sau khi đăng ký thành công, hệ thống sẽ gửi email kích hoạt tài khoản. Thí sinh truy cập email và nhấn vào “Link kích hoạt” để thực hiện kích hoạt và sử dụng hệ thống." },
      { type: "image", src: "/images/guide/img_2.png", caption: "Email kích hoạt tài khoản" }
    ]
  },
  {
    id: "submit-app",
    title: "Nộp hồ sơ dự thi",
    icon: "lucide:file-text",
    blocks: [
      { type: "p", content: "Sau khi kích hoạt tài khoản thành công, thí sinh thực hiện các bước sau để tiến hành nộp hồ sơ dự thi:" },
      { type: "step", number: 1, content: "Đăng nhập và cổng tuyển sinh trực tuyến, tại trang chủ, chọn kỳ tuyển sinh muốn đăng ký nộp hồ sơ, nhấn “Đăng ký ngay” để bắt đầu nộp hồ sơ." },
      { type: "image", src: "/images/guide/img_3.png", caption: "Chọn kỳ tuyển sinh và nhấn Đăng ký ngay" },
      { type: "step", number: 2, content: "Nhập đầy đủ thông tin hồ sơ, bao gồm: Thông tin thí sinh, Thông tin liên hệ và tải lên các hồ sơ theo yêu cầu." },
      { type: "image", src: "/images/guide/img_4.jpg", caption: "Điền thông tin và tải lên tài liệu đính kèm" },
      { type: "step", number: 3, content: "Lưu lại thông tin hồ sơ, nhấn “Lưu nháp” nếu muốn chỉnh sửa sau, nhấn “Nộp hồ sơ” để gửi hồ sơ đến nhà trường." },
      { type: "image", src: "/images/guide/img_5.png", caption: "Giao diện lưu nháp hoặc nộp hồ sơ" },
      { type: "p", content: "Sau khi nộp thành công, hồ sơ sẽ ở trạng thái “Chờ xác nhận”, nhà trường sẽ kiểm tra hồ sơ và gửi thông báo qua email đã đăng ký." },
      { type: "note", content: "Mỗi tài khoản chỉ được phép đăng ký một hồ sơ dự thi trong một kỳ tuyển sinh. Nếu muốn đăng ký nhiều hồ sơ, thí sinh cần sử dụng các tài khoản khác nhau." }
    ]
  },
  {
    id: "payment",
    title: "Thanh toán hồ sơ dự thi",
    icon: "lucide:credit-card",
    paymentRelated: true,
    blocks: [
      { type: "p", content: "Sau khi hồ sơ được xác nhận hợp lệ, thí sinh thực hiện thanh toán lệ phí dự thi theo các bước sau:" },
      { type: "step", number: 1, content: "Chọn mục “Hồ sơ của tôi” để xem danh sách hồ sơ đã đăng ký." },
      { type: "image", src: "/images/guide/img_6.png", caption: "Mục Hồ sơ của tôi" },
      { type: "step", number: 2, content: "Chọn hồ sơ cần thanh toán, nhấn “Chi tiết”, chọn “Thanh toán ngay”" },
      { type: "image", src: "/images/guide/img_7.png", caption: "Nhấn nút Chi tiết trên hồ sơ" },
      { type: "image", src: "/images/guide/img_8.png", caption: "Nhấn nút Thanh toán ngay" },
      { type: "p", content: "Thực hiện thanh toán bằng cách quét mã QR trên màn hình, sau đó nhấn “Xác nhận thanh toán” để hoàn tất." },
      { type: "image", src: "/images/guide/img_9.png", caption: "Mã QR thanh toán chuyển khoản" }
    ]
  },
  {
    id: "view-results",
    title: "Xem thông tin kết quả tuyển sinh",
    icon: "lucide:award",
    blocks: [
      { type: "p", content: "Khi muốn xem kết quả thi, thí sinh truy cập vào danh sách hồ sơ, chọn hồ sơ cần xem, nhấn “Kết quả” để xem thông tin và kết quả tuyển sinh." },
      { type: "image", src: "/images/guide/img_10.png", caption: "Xem kết quả tuyển sinh" }
    ]
  }
  /*
  ,{
    id: "review-request",
    title: "Nộp đơn đề nghị phúc khảo",
    icon: "lucide:clipboard-signature",
    blocks: [
      { type: "p", content: "Sau khi có kết quả thi, nếu cần phúc khảo bài thi, thí sinh thực hiện theo các bước sau:" },
      { type: "step", number: 1, content: "Tại danh sách hồ sơ, chọn “Phúc khảo”" },
      { type: "image", src: "/images/guide/img_11.png", caption: "Chọn Phúc khảo" },
      { type: "step", number: 2, content: "Chọn “Tạo yêu cầu phúc khảo”, chọn môn cần phúc khảo và nhập lý do, nhấn “Gửi yêu cầu”" },
      { type: "image", src: "/images/guide/img_12.png", caption: "Tạo yêu cầu phúc khảo và gửi" },
      { type: "step", number: 3, content: "Sau khi tạo thành công, thí sinh tiến hành thanh toán lệ phí phúc khảo. Tại danh sách phúc khảo, chọn đơn phúc khảo cần thanh toán, nhấn “Thanh toán”", paymentRelated: true },
      { type: "image", src: "/images/guide/img_13.png", caption: "Nhấn Thanh toán đơn phúc khảo", paymentRelated: true },
      { type: "p", content: "Thực hiện thanh toán bằng cách quét mã QR trên màn hình, sau đó nhấn “Xác nhận thanh toán” để hoàn tất.", paymentRelated: true },
      { type: "image", src: "/images/guide/img_14.png", caption: "Mã QR thanh toán lệ phí phúc khảo", paymentRelated: true },
      { type: "p", content: "Thí sinh theo dõi thông tin điểm phúc khảo qua email thông báo và hệ thống sẽ cập nhật trong mục “Kết quả” của danh sách hồ sơ." },
      { type: "image", src: "/images/guide/img_15.png", caption: "Thông tin cập nhật điểm phúc khảo" },
      { type: "note", content: "Nhà trường sẽ xử lý hồ sơ và gửi thông báo qua email đã đăng ký, vui lòng theo dõi email thường xuyên để nhận thông báo." },
      { type: "p", content: "Nếu gặp sự cố, vui lòng liên hệ bộ phận hỗ trợ của nhà trường." }
    ]
  }
  */
];

const sections = computed(() =>
  allSections
    .filter(section => SHOW_PAYMENT_GUIDANCE || !section.paymentRelated)
    .map(section => ({
      ...section,
      blocks: section.blocks.filter(block => SHOW_PAYMENT_GUIDANCE || !block.paymentRelated),
    })),
);

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    activeSectionId.value = id;
  }
};

let observer = null;

onMounted(() => {
  // Intersection Observer for scroll-spy functionality
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Center region of the screen triggers active state
    threshold: 0
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSectionId.value = entry.target.id;
      }
    });
  }, observerOptions);

  // Observe all article elements
  document.querySelectorAll('.section-element').forEach((el) => {
    observer.observe(el);
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>
