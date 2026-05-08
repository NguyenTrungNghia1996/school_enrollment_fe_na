<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center rounded-[2rem] border border-white/80 bg-white/60 p-20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <a-spin size="large" />
        <p class="mt-6 animate-pulse text-sm font-medium text-slate-500">Đang tải thông tin kỳ khảo thí...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="mx-auto max-w-2xl text-center">
        <div class="rounded-[2rem] border border-rose-100 bg-white/80 p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 shadow-inner">
            <Icon name="lucide:shield-x" class="text-4xl" />
          </div>
          <h1 class="mt-6 text-2xl font-bold tracking-tight text-slate-900">Không tải được kỳ khảo thí</h1>
          <p class="mt-3 text-base text-slate-500">{{ loadError }}</p>
          <a-button type="primary" class="mt-8 h-12 rounded-2xl px-8 font-semibold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30" @click="fetchExamDetail">Thử lại</a-button>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="examDetail" class="container mx-auto">
        <section class="flex flex-col gap-8">
          <!-- Header Card -->
          <div class="rounded-[2rem] border border-white/80 bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:bg-white/80">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div class="flex-1">
                <div class="mb-4">
                  <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors" :class="status.badgeClass">
                    {{ status.label }}
                  </span>
                </div>
                <h1 class="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-4xl font-extrabold tracking-tight text-slate-900 text-transparent">{{ examDetail.examName }}</h1>
              </div>

              <div class="flex shrink-0 gap-4">
                <div class="flex min-w-[140px] flex-col justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Thời gian còn lại</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">{{ remainingText }}</div>
                </div>
                <div class="flex min-w-[140px] flex-col justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Lệ phí</div>
                  <div class="mt-1 text-lg font-bold text-blue-600">{{ formatCurrency(examDetail.fee) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Card -->
          <div class="rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
            <a-form ref="formRef" :model="formState" layout="vertical" class="p-8">
              <!-- Thông tin thí sinh -->
              <section class="pb-10">
                <div class="mb-8 flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon name="lucide:user" class="text-xl" />
                  </div>
                  <h2 class="text-xl font-bold text-slate-900">Thông tin thí sinh</h2>
                </div>

                <div class="grid gap-x-6 gap-y-5 md:grid-cols-3">
                  <a-form-item label="Ảnh 3x4" name="avatar" class="md:col-span-3" :rules="[{ required: true, message: 'Vui lòng tải lên ảnh 3x4' }]">
                    <div class="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 transition-colors hover:bg-slate-50">
                      <div class="flex flex-col gap-6 md:flex-row md:items-start">
                        <!-- Avatar Preview -->
                        <button type="button" class="group relative flex h-[192px] w-[144px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-white transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" :class="formState.avatar ? 'cursor-pointer border-solid border-slate-200' : 'cursor-default'" :disabled="!formState.avatar" @click="openAvatarPreview">
                          <img v-if="formState.avatar" :src="formState.avatar" alt="Ảnh 3x4" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div v-else class="flex flex-col items-center gap-2 px-4 text-center text-slate-400">
                            <Icon name="lucide:image" class="text-3xl opacity-50" />
                            <span class="text-xs font-medium uppercase tracking-wider">Chưa có ảnh</span>
                          </div>
                          <div v-if="formState.avatar" class="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                            <Icon name="lucide:zoom-in" class="text-2xl text-white" />
                          </div>
                        </button>

                        <div class="flex-1 space-y-4">
                          <div>
                            <!-- Hidden input -->
                            <input id="avatar-upload" type="file" class="!hidden" :disabled="avatarUploading || isProcessing" accept=".png,.jpg,.jpeg,.webp" @change="handleAvatarUpload" />
                            <!-- Styled Label acting as button -->
                            <label for="avatar-upload" tabindex="0" class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all focus-within:ring-2 focus-within:ring-blue-500 hover:bg-slate-50 hover:text-blue-600" :class="{ 'cursor-not-allowed opacity-50': avatarUploading || isProcessing }">
                              <Icon name="lucide:upload-cloud" class="text-lg" />
                              <span>Chọn ảnh tải lên</span>
                            </label>
                          </div>

                          <div v-if="avatarUploading" class="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm font-medium text-blue-700">
                            <a-spin size="small" />
                            Đang upload ảnh 3x4...
                          </div>

                          <div v-else class="space-y-4">
                            <p class="text-sm leading-relaxed text-slate-500">Chỉ chấp nhận ảnh định dạng JPG, PNG, WEBP với tỷ lệ 3:4. Kích thước tối đa 5MB.</p>
                            <div v-if="formState.avatar" class="flex flex-wrap gap-2">
                              <a-button danger type="text" class="rounded-lg font-medium hover:bg-rose-50" :disabled="isProcessing" @click="removeAvatar">
                                <template #icon><Icon name="lucide:trash-2" class="mr-1.5" /></template>
                                Xóa ảnh
                              </a-button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <a-image
                        v-if="formState.avatar"
                        :src="formState.avatar"
                        class="hidden"
                        :preview="{
                          visible: isAvatarPreviewOpen,
                          src: formState.avatar,
                          onVisibleChange: handleAvatarPreviewVisibleChange,
                        }" />
                    </div>
                  </a-form-item>

                  <a-form-item label="Họ tên đầy đủ" name="fullName" class="md:col-span-1" :rules="[{ required: true, message: 'Vui lòng nhập họ tên đầy đủ' }]">
                    <a-input v-model:value="formState.fullName" placeholder="Nhập họ tên đầy đủ" size="large" class="rounded-xl" />
                  </a-form-item>

                  <a-form-item label="Ngày sinh" name="dateOfBirth" :rules="[{ required: true, message: 'Vui lòng chọn ngày sinh' }]">
                    <a-date-picker v-model:value="formState.dateOfBirth" format="DD/MM/YYYY" class="w-full rounded-xl" size="large" placeholder="Chọn ngày sinh" />
                  </a-form-item>

                  <div>
                    <UserSelectProvince v-model="formState.idProvince" label="Nơi sinh" name="idProvince" placeholder="Chọn tỉnh thành phố" :rules="[{ required: true, message: 'Vui lòng chọn nơi sinh' }]" size="large" class="rounded-xl" />
                  </div>

                  <a-form-item
                    label="Số CCCD"
                    name="identityNumber"
                    :rules="[
                      { required: true, message: 'Vui lòng nhập số CCCD' },
                      { pattern: /^\d{9,12}$/, message: 'Số CCCD phải gồm 9 đến 12 chữ số' },
                    ]">
                    <a-input v-model:value="formState.identityNumber" placeholder="Nhập số CCCD" size="large" class="rounded-xl" />
                  </a-form-item>

                  <a-form-item label="Ngày cấp CCCD" name="identityIssueDate" :rules="[{ required: true, message: 'Vui lòng chọn ngày cấp CCCD' }]">
                    <a-date-picker v-model:value="formState.identityIssueDate" format="DD/MM/YYYY" class="w-full rounded-xl" size="large" placeholder="Chọn ngày cấp CCCD" />
                  </a-form-item>

                  <a-form-item label="Nơi cấp CCCD" name="identityIssuePlace" :rules="[{ required: true, message: 'Vui lòng nhập nơi cấp CCCD' }]">
                    <a-input v-model:value="formState.identityIssuePlace" placeholder="Nhập nơi cấp CCCD" size="large" class="rounded-xl" />
                  </a-form-item>

                  <div>
                    <UserSelectEthnicity v-model="formState.idEthnicity" label="Dân tộc" name="idEthnicity" placeholder="Chọn dân tộc" :rules="[{ required: true, message: 'Vui lòng chọn dân tộc' }]" size="large" class="rounded-xl" />
                  </div>

                  <a-form-item label="Giới tính" name="gender" :rules="[{ required: true, message: 'Vui lòng chọn giới tính' }]">
                    <a-select v-model:value="genderValue" :options="genderOptions" placeholder="Chọn giới tính" size="large" class="rounded-xl" />
                  </a-form-item>

                  <div class="grid gap-x-6 gap-y-5 md:col-span-3 md:grid-cols-3">
                    <div>
                      <UserSelectProvince v-model="formState.permanentProvinceId" label="Tỉnh/thành phố cư trú" name="permanentProvinceId" placeholder="Chọn tỉnh thành phố" :rules="[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố cư trú' }]" size="large" class="rounded-xl" />
                    </div>

                    <div>
                      <UserSelectCommune v-model="formState.idCommune" :id-province="formState.permanentProvinceId" label="Phường/xã cư trú" name="idCommune" placeholder="Chọn phường/xã" :rules="[{ required: true, message: 'Vui lòng chọn phường/xã cư trú' }]" size="large" class="rounded-xl" />
                    </div>

                    <a-form-item label="Địa chỉ thường trú" name="permanentAddress" :rules="[{ required: true, message: 'Vui lòng nhập địa chỉ thường trú' }]">
                      <a-input v-model:value="formState.permanentAddress" placeholder="Nhập chi tiết số nhà, đường..." size="large" class="rounded-xl" />
                    </a-form-item>
                  </div>
                </div>
              </section>

              <div class="my-10 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

              <!-- Thông tin liên hệ -->
              <section class="pb-10">
                <div class="mb-8 flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <Icon name="lucide:phone" class="text-xl" />
                  </div>
                  <h2 class="text-xl font-bold text-slate-900">Thông tin liên hệ</h2>
                </div>

                <div class="grid gap-x-6 gap-y-5 md:grid-cols-3">
                  <a-form-item
                    label="Số điện thoại"
                    name="phoneNumber"
                    :rules="[
                      { required: true, message: 'Vui lòng nhập số điện thoại' },
                      { pattern: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ' },
                    ]">
                    <a-input v-model:value="formState.phoneNumber" placeholder="Nhập số điện thoại" size="large" class="rounded-xl" />
                  </a-form-item>

                  <div>
                    <UserSelectProvince v-model="formState.currentProvinceId" label="Tỉnh/thành phố nơi ở hiện tại" name="currentProvinceId" placeholder="Chọn tỉnh thành phố" :rules="[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố hiện tại' }]" size="large" class="rounded-xl" />
                  </div>

                  <div>
                    <UserSelectCommune2 v-model="formState.idCurrentCommune" :id-province="formState.currentProvinceId" label="Phường/xã nơi ở hiện tại" name="idCurrentCommune" placeholder="Chọn phường/xã" :rules="[{ required: true, message: 'Vui lòng chọn phường/xã hiện tại' }]" size="large" class="rounded-xl" />
                  </div>

                  <a-form-item label="Địa chỉ nơi ở hiện tại" name="currentAddress" class="md:col-span-3" :rules="[{ required: true, message: 'Vui lòng nhập địa chỉ nơi ở hiện tại' }]">
                    <a-input v-model:value="formState.currentAddress" placeholder="Nhập chi tiết số nhà, đường..." size="large" class="rounded-xl" />
                  </a-form-item>
                </div>
              </section>

              <div class="my-10 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

              <!-- Hồ sơ yêu cầu -->
              <section ref="documentsSectionRef" class="pb-4">
                <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Icon name="lucide:folder-open" class="text-xl" />
                    </div>
                    <div>
                      <h2 class="text-xl font-bold text-slate-900">Hồ sơ yêu cầu</h2>
                    </div>
                  </div>
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <Icon name="lucide:file-stack" class="text-sm" />
                    {{ documentUploads.length }} hồ sơ
                  </span>
                </div>

                <div v-if="documentUploads.length" class="space-y-5">
                  <div :id="`document-upload-card-${index}`" v-for="(document, index) in documentUploads" :key="document.key" tabindex="-1" class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                    <div class="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
                      <div class="flex-1">
                        <div class="flex flex-wrap items-center gap-3">
                          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{{ index + 1 }}</span>
                          <h3 class="text-base font-bold text-slate-900">{{ document.documentName }}</h3>
                          <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest" :class="document.isRequired ? 'bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100' : 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100'">
                            {{ document.isRequired ? "Bắt buộc" : "Tùy chọn" }}
                          </span>
                        </div>
                        <p class="mt-2 pl-10 text-sm text-slate-500">Chấp nhận định dạng ảnh hoặc PDF.</p>
                      </div>

                      <div class="w-full shrink-0 lg:w-auto">
                        <!-- Hidden file input -->
                        <input :id="`document-upload-${index}`" type="file" class="!hidden" :disabled="document.uploading || isProcessing" accept=".pdf,.png,.jpg,.jpeg,.webp" multiple @change="event => handleDocumentUpload(index, event)" />

                        <!-- Styled label acting as button -->
                        <label :for="`document-upload-${index}`" class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all focus-within:ring-2 focus-within:ring-blue-500 hover:bg-slate-50 hover:text-blue-600 lg:w-auto" :class="{ 'cursor-not-allowed opacity-50': document.uploading || isProcessing }">
                          <Icon name="lucide:plus" class="text-lg" />
                          <span>Thêm file</span>
                        </label>
                      </div>
                    </div>

                    <!-- Uploading state -->
                    <div v-if="document.uploading" class="border-t border-slate-100 bg-slate-50/50 p-6">
                      <div class="flex items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm font-medium text-blue-700">
                        <a-spin size="small" />
                        Đang upload {{ document.pendingLabel || "file" }}...
                      </div>
                    </div>

                    <!-- Files list -->
                    <div v-else-if="document.files.length" class="border-t border-slate-100 bg-slate-50/50 p-6">
                      <div class="grid gap-3 sm:grid-cols-1">
                        <div v-for="(link, fileIndex) in document.files" :key="link.url" class="group/file relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-300">
                          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover/file:bg-blue-50 group-hover/file:text-blue-600">
                            <Icon v-if="getFileType(link.url) === 'image'" name="lucide:image" class="text-xl" />
                            <Icon v-else-if="getFileType(link.url) === 'pdf'" name="lucide:file-text" class="text-xl" />
                            <Icon v-else name="lucide:file" class="text-xl" />
                          </div>

                          <div class="min-w-0 flex-1">
                            <BaseImagePreviewLink v-if="getFileType(link.url) === 'image'" :src="link.url" class="truncate text-sm font-medium text-slate-700 hover:text-blue-600" />
                            <BasePdfPreviewLink v-else-if="getFileType(link.url) === 'pdf'" :src="link.url" class="truncate text-sm font-medium text-slate-700 hover:text-blue-600" />
                            <span v-else class="block truncate text-sm font-medium text-slate-700">
                              {{ getDisplayName(link.url) }}
                            </span>
                          </div>

                          <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50 group-hover/file:opacity-100" :disabled="isProcessing" @click.prevent="removeDocumentFile(index, fileIndex)" title="Xóa file">
                            <Icon name="lucide:x" class="text-lg" />
                          </button>
                        </div>
                      </div>

                      <div v-if="document.files.length > 1" class="mt-4 flex justify-end">
                        <a-button danger type="text" size="small" class="rounded-lg font-medium" :disabled="isProcessing" @click="clearDocument(index)">Xóa tất cả file</a-button>
                      </div>
                    </div>

                    <div v-else class="border-t border-slate-100 p-6 text-center">
                      <div class="inline-block rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500">
                        {{ document.isRequired ? "Bạn cần phải tải lên ít nhất 1 file cho hồ sơ bắt buộc này." : "Bạn có thể bỏ qua nếu không có hồ sơ này." }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                  <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Icon name="lucide:folder-check" class="text-2xl" />
                  </div>
                  <p class="text-sm font-medium text-slate-500">Kỳ khảo thí này không yêu cầu nộp hồ sơ đính kèm.</p>
                </div>
              </section>

              <!-- Footer Actions -->
              <div class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-8">
                <a-button class="h-12 rounded-2xl px-6 font-semibold" danger type="text" :disabled="isProcessing" @click="handleCancel">Hủy</a-button>
                <div class="flex flex-wrap gap-3">
                  <a-button class="h-12 rounded-2xl px-8 font-semibold shadow-sm hover:shadow" :loading="saveLoading" :disabled="isProcessing" @click="saveDraft">Lưu nháp</a-button>
                  <a-button type="primary" class="h-12 rounded-2xl px-10 font-bold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30" :loading="submitLoading" :disabled="status.isClosed || hasUploadingDocuments || isProcessing" @click="submitApplication">Nộp hồ sơ</a-button>
                </div>
              </div>
            </a-form>
          </div>
        </section>

        <!-- Sidebar -->
        <aside v-if="false" class="space-y-6">
          <div class="relative top-6 overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl">
            <!-- Decorative background elements -->
            <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl"></div>
            <div class="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"></div>

            <div class="relative z-10">
              <div class="mb-6 flex items-center gap-3">
                <Icon name="lucide:info" class="text-2xl text-blue-400" />
                <h2 class="text-xl font-bold">Thông tin đăng ký</h2>
              </div>

              <div class="space-y-4">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
                  <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</div>
                  <div class="mt-1.5 flex items-center gap-2 font-bold text-white">
                    <span class="relative flex h-2.5 w-2.5">
                      <span v-if="!status.isClosed" class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex h-2.5 w-2.5 rounded-full" :class="status.isClosed ? 'bg-slate-400' : 'bg-emerald-500'"></span>
                    </span>
                    {{ status.label }}
                  </div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
                  <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Bắt đầu nhận hồ sơ</div>
                  <div class="mt-1.5 font-bold text-white">{{ formatDateTime(examDetail.startDate) }}</div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
                  <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Kết thúc nhận hồ sơ</div>
                  <div class="mt-1.5 font-bold text-white">{{ formatDateTime(examDetail.endDate) }}</div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10">
                  <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Yêu cầu hồ sơ đính kèm</div>
                  <div class="mt-1.5 font-bold text-white">{{ documentUploads.length }} loại giấy tờ</div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[2rem] border border-orange-100 bg-orange-50/50 p-8 shadow-sm">
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Icon name="lucide:alert-circle" class="text-lg" />
              </div>
              <h3 class="text-base font-bold text-slate-900">Lưu ý quan trọng</h3>
            </div>
            <ul class="space-y-3 text-sm leading-relaxed text-slate-600">
              <li class="flex items-start gap-2">
                <Icon name="lucide:check-circle-2" class="mt-0.5 shrink-0 text-orange-400" />
                <span>Vui lòng kiểm tra kỹ thông tin cá nhân trước khi nộp.</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check-circle-2" class="mt-0.5 shrink-0 text-orange-400" />
                <span>Hồ sơ đã nộp sẽ không thể tự ý chỉnh sửa.</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check-circle-2" class="mt-0.5 shrink-0 text-orange-400" />
                <span>Dữ liệu của bạn được lưu nháp tự động để tránh mất mát.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS } from "~/composables/useApplicationStatus";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const { $dayjs } = useNuxtApp();
const { examUser, applicationUser, s3 } = useApi();

const formRef = ref();
const documentsSectionRef = ref();
const examDetail = ref(null);
const loading = ref(true);
const saveLoading = ref(false);
const submitLoading = ref(false);
const avatarUploading = ref(false);
const isAvatarPreviewOpen = ref(false);
const loadError = ref("");
const documentUploads = ref([]);

const genderOptions = [
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
];

const formState = reactive({
  avatar: "",
  fullName: "",
  dateOfBirth: null,
  idProvince: undefined,
  identityNumber: "",
  identityIssueDate: null,
  identityIssuePlace: "",
  idEthnicity: undefined,
  gender: undefined,
  permanentProvinceId: undefined,
  idCommune: undefined,
  permanentAddress: "",
  phoneNumber: "",
  currentProvinceId: undefined,
  idCurrentCommune: undefined,
  currentAddress: "",
});

const genderValue = computed({
  get() {
    if (formState.gender === true) return "male";
    if (formState.gender === false) return "female";
    return undefined;
  },
  set(value) {
    if (value === "male") {
      formState.gender = true;
      return;
    }

    if (value === "female") {
      formState.gender = false;
      return;
    }

    formState.gender = undefined;
  },
});

const examId = computed(() => {
  const rawId = route.params.id;
  const value = Array.isArray(rawId) ? rawId[0] : rawId;
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
});

const draftStorageKey = computed(() => `application-draft-${examId.value || "unknown"}`);

const status = computed(() => {
  const exam = examDetail.value;
  if (!exam) {
    return {
      label: "Không xác định",
      badgeClass: "bg-slate-100 text-slate-500",
      isClosed: true,
    };
  }

  const now = $dayjs();
  const startDate = getValidDayjs(exam.startDate);
  const endDate = getValidDayjs(exam.endDate);

  if (!startDate || !endDate) {
    return {
      label: "Không xác định",
      badgeClass: "bg-slate-100 text-slate-500",
      isClosed: true,
    };
  }

  if (now.isBefore(startDate)) {
    return {
      label: "Sắp mở",
      badgeClass: "bg-sky-50 text-sky-700",
      isClosed: true,
    };
  }

  if (now.isAfter(endDate)) {
    return {
      label: "Đã đóng",
      badgeClass: "bg-slate-100 text-slate-600",
      isClosed: true,
    };
  }

  return {
    label: "Đang mở",
    badgeClass: "bg-emerald-50 text-emerald-700",
    isClosed: false,
  };
});

const remainingText = computed(() => {
  const exam = examDetail.value;
  if (!exam) return "-";

  const now = $dayjs();
  const startDate = getValidDayjs(exam.startDate);
  const endDate = getValidDayjs(exam.endDate);

  if (!startDate || !endDate) {
    return "-";
  }

  if (now.isBefore(startDate)) {
    return `Mở sau ${startDate.from(now, true)}`;
  }

  if (now.isAfter(endDate)) {
    return "Kỳ khảo thí đã kết thúc";
  }

  return `Còn ${endDate.from(now, true)}`;
});

const hasUploadingDocuments = computed(() => documentUploads.value.some(item => item.uploading));
const isProcessing = computed(() => saveLoading.value || submitLoading.value || avatarUploading.value);

const getValidDayjs = value => {
  if (!value) return null;

  const parsed = $dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const toIsoStringOrNull = value => {
  const parsed = getValidDayjs(value);
  return parsed ? parsed.format("YYYY-MM-DD") : null;
};

const formatDateTime = value => {
  const parsed = getValidDayjs(value);
  return parsed ? parsed.format("DD/MM/YYYY HH:mm") : "-";
};

const formatCurrency = value => {
  if (value === undefined || value === null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getFileName = link => {
  if (!link) return "";

  try {
    const { pathname } = new URL(link);
    const segments = pathname.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) || link);
  } catch {
    const cleanUrl = link.split("?")[0].split("#")[0];
    const segments = cleanUrl.split("/").filter(Boolean);
    return decodeURIComponent(segments.at(-1) || link);
  }
};

const deleteUploadedFile = async fileName => {
  const normalizedFileName = String(fileName || "").trim();
  if (!normalizedFileName) return;

  const { data, error } = await applicationUser.deleteByRest("file", {
    params: {
      fileName: normalizedFileName,
    },
  });

  if (error.value || data.value?.success === false) {
    throw new Error(error.value?.data?.message || data.value?.message || "Xóa file thất bại");
  }
};


const getDisplayName = link => {
  return getDisplayFileName(getFileName(link));
};

const getFileType = link => {
  const fileName = getFileName(link).toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(fileName)) {
    return "image";
  }

  if (fileName.endsWith(".pdf")) {
    return "pdf";
  }

  return "unsupported";
};

const createDocumentUploads = (documents = [], existingDocuments = []) => {
  return documents.map((document, index) => {
    const documentId = document.id ?? document.idExamDocument ?? index;
    const existing = existingDocuments.find(item => Number(item.idExamDocument) === Number(documentId));

    return {
      key: `${documentId}-${document.documentName}`,
      idExamDocument: documentId,
      documentName: document.documentName,
      isRequired: !!document.isRequired,
      files: existingDocuments
        .filter(item => Number(item.idExamDocument) === Number(documentId) && item.url)
        .map(item => ({
          url: item.url,
          fileName: item.fileName || getDisplayName(item.url),
        })),
      uploading: false,
      pendingLabel: "",
    };
  });
};

const resetFormState = () => {
  Object.assign(formState, {
    avatar: "",
    fullName: "",
    dateOfBirth: null,
    idProvince: undefined,
    identityNumber: "",
    identityIssueDate: null,
    identityIssuePlace: "",
    idEthnicity: undefined,
    gender: undefined,
    permanentProvinceId: undefined,
    idCommune: undefined,
    permanentAddress: "",
    phoneNumber: "",
    currentProvinceId: undefined,
    idCurrentCommune: undefined,
    currentAddress: "",
  });
};

const saveDraftSnapshot = () => {
  if (!import.meta.client) return;

  const snapshot = {
    formState: {
      ...formState,
      dateOfBirth: toIsoStringOrNull(formState.dateOfBirth),
      identityIssueDate: toIsoStringOrNull(formState.identityIssueDate),
    },
    documents: documentUploads.value
      .map(item => ({
        idExamDocument: item.idExamDocument,
        files: item.files,
      }))
      .flatMap(item =>
        item.files.map(file => ({
          idExamDocument: item.idExamDocument,
          url: file.url,
          fileName: file.fileName,
        })),
      ),
  };

  localStorage.setItem(draftStorageKey.value, JSON.stringify(snapshot));
};

const restoreDraft = () => {
  if (!import.meta.client) return false;

  const raw = localStorage.getItem(draftStorageKey.value);
  if (!raw) return false;

  try {
    const draft = JSON.parse(raw);
    const draftFormState = draft?.formState || {};

    Object.assign(formState, {
      ...formState,
      ...draftFormState,
      avatar: draftFormState.avatar || "",
      dateOfBirth: getValidDayjs(draftFormState.dateOfBirth),
      identityIssueDate: getValidDayjs(draftFormState.identityIssueDate),
      gender: draftFormState.gender === "male" ? true : draftFormState.gender === "female" ? false : draftFormState.gender,
    });

    documentUploads.value = createDocumentUploads(examDetail.value?.documents || [], draft?.documents || []);
    return true;
  } catch {
    localStorage.removeItem(draftStorageKey.value);
    return false;
  }
};

const clearDraftStorage = () => {
  if (!import.meta.client) return;
  localStorage.removeItem(draftStorageKey.value);
};

const scrollToElement = element => {
  if (!element || typeof element.scrollIntoView !== "function") return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

const focusFirstInvalidField = async () => {
  await nextTick();

  const formElement = formRef.value?.$el;
  if (!formElement) return;

  const firstErrorItem = formElement.querySelector(".ant-form-item-has-error");
  if (!firstErrorItem) return;

  scrollToElement(firstErrorItem);

  const focusTarget = firstErrorItem.querySelector('label[for="avatar-upload"]') || firstErrorItem.querySelector(".ant-select-selection-search-input") || firstErrorItem.querySelector(".ant-picker-input input") || firstErrorItem.querySelector("input:not([disabled])") || firstErrorItem.querySelector("textarea:not([disabled])") || firstErrorItem.querySelector("button:not([disabled])");

  if (focusTarget && typeof focusTarget.focus === "function") {
    focusTarget.focus({
      preventScroll: true,
    });
  }
};

const validateFormAndFocusError = async () => {
  try {
    await formRef.value?.validate();
    return true;
  } catch {
    await focusFirstInvalidField();
    message.warning("Vui lòng kiểm tra lại thông tin hồ sơ");
    return false;
  }
};

const focusMissingDocument = async documentIndex => {
  await nextTick();

  const target = document.getElementById(`document-upload-card-${documentIndex}`) || documentsSectionRef.value;

  scrollToElement(target);

  const button = target?.querySelector?.(`label[for="document-upload-${documentIndex}"]`) || target?.querySelector?.("label[for^='document-upload-']");

  if (button && typeof button.focus === "function") {
    button.focus({
      preventScroll: true,
    });
    return;
  }

  if (target && typeof target.focus === "function") {
    target.focus({
      preventScroll: true,
    });
  }
};

const saveDraft = async () => {
  if (avatarUploading.value) {
    message.warning("Vui lòng chờ upload ảnh 3x4 hoàn tất");
    return;
  }

  if (hasUploadingDocuments.value) {
    message.warning("Vui lòng chờ upload hồ sơ hoàn tất");
    return;
  }

  saveDraftSnapshot();

  const isValid = await validateFormAndFocusError();
  if (!isValid) {
    return;
  }

  saveLoading.value = true;

  try {
    const { data, error } = await applicationUser.post({
      body: buildPayload(),
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Lưu hồ sơ thất bại");
    }

    message.success(data.value?.message || `Lưu ${APPLICATION_STATUS_LABELS[APPLICATION_STATUS.DRAFT].toLowerCase()} thành công`);
  } catch (error) {
    message.error(error?.message || "Lưu hồ sơ thất bại");
  } finally {
    saveLoading.value = false;
  }
};

const clearDocument = async index => {
  const document = documentUploads.value[index];
  if (!document) return;

  try {
    const currentFiles = [...document.files];
    const deleteResults = await Promise.allSettled(currentFiles.map(file => deleteUploadedFile(getFileName(file.url))));
    const failedFiles = currentFiles.filter((_, fileIndex) => deleteResults[fileIndex]?.status === "rejected");

    document.files = failedFiles;

    if (failedFiles.length) {
      message.error(`Không thể xóa ${failedFiles.length} file trong ${document.documentName}`);
      return;
    }

    message.success(`Đã xóa toàn bộ file của ${document.documentName}`);
  } catch (error) {
    message.error(error?.message || `Xóa file thất bại: ${document.documentName}`);
  }
};

const ensureRequiredDocumentsUploaded = () => {
  const missingDocumentIndex = documentUploads.value.findIndex(item => item.isRequired && item.files.length === 0);

  if (missingDocumentIndex !== -1) {
    const missingDocument = documentUploads.value[missingDocumentIndex];
    focusMissingDocument(missingDocumentIndex);
    throw new Error(`Vui lòng tải lên hồ sơ bắt buộc: ${missingDocument.documentName}`);
  }
};

const removeDocumentFile = async (documentIndex, fileIndex) => {
  const document = documentUploads.value[documentIndex];
  if (!document) return;

  const targetFile = document.files[fileIndex];
  if (!targetFile) return;

  try {
    await deleteUploadedFile(getFileName(targetFile.url));
    document.files.splice(fileIndex, 1);
    message.success("Đã xóa file");
  } catch (error) {
    message.error(error?.message || "Xóa file thất bại");
  }
};

const loadImageMeta = file =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không thể đọc kích thước ảnh"));
    };

    image.src = objectUrl;
  });

const validateAvatarRatio = async file => {
  const { width, height } = await loadImageMeta(file);
  const ratio = width / height;
  const expectedRatio = 3 / 4;

  if (Math.abs(ratio - expectedRatio) > 0.08) {
    throw new Error("Ảnh avatar phải có tỷ lệ 3:4");
  }
};

const removeAvatar = async () => {
  const currentAvatar = formState.avatar;
  if (!currentAvatar) return;

  try {
    await deleteUploadedFile(getFileName(currentAvatar));
    formState.avatar = "";
    isAvatarPreviewOpen.value = false;
    message.success("Đã xóa ảnh 3x4");
  } catch (error) {
    message.error(error?.message || "Xóa ảnh 3x4 thất bại");
  }
};

const openAvatarPreview = () => {
  if (!formState.avatar) return;
  isAvatarPreviewOpen.value = true;
};

const handleAvatarPreviewVisibleChange = visible => {
  isAvatarPreviewOpen.value = visible;
};

const handleAvatarUpload = async event => {
  const file = event?.target?.files?.[0];
  if (!file) return;

  avatarUploading.value = true;

  try {
    await validateAvatarRatio(file);
    const sanitizedFileName = sanitizeOriginalFileName(file.name);
    const previousAvatar = formState.avatar;

    const result = await s3.upload(file, {
      key: `${Date.now()}-${sanitizedFileName}`,
      contentType: file.type || "application/octet-stream",
    });

    formState.avatar = result.directUrl;

    if (previousAvatar && previousAvatar !== result.directUrl) {
      try {
        await deleteUploadedFile(getFileName(previousAvatar));
      } catch (error) {
        message.warning(error?.message || "Không thể xóa ảnh cũ");
      }
    }

    message.success("Đã tải lên ảnh 3x4");
  } catch (error) {
    message.error(error?.message || "Upload ảnh 3x4 thất bại");
  } finally {
    avatarUploading.value = false;
    if (event?.target) {
      event.target.value = "";
    }
  }
};

const handleDocumentUpload = async (index, event) => {
  const files = Array.from(event?.target?.files || []);
  if (!files.length) return;

  const document = documentUploads.value[index];
  if (!document) return;

  document.uploading = true;
  document.pendingLabel = files.length === 1 ? sanitizeOriginalFileName(files[0].name) : `${files.length} file`;

  try {
    const uploadedFiles = await Promise.all(
      files.map(async file => {
        const sanitizedFileName = sanitizeOriginalFileName(file.name);
        const result = await s3.upload(file, {
          key: `${Date.now()}-${sanitizedFileName}`,
          contentType: file.type || "application/octet-stream",
        });

        return {
          url: result.directUrl,
          fileName: sanitizedFileName,
        };
      }),
    );

    document.files.push(...uploadedFiles);
    message.success(`Đã tải lên ${document.documentName}`);
  } catch (error) {
    message.error(error?.message || `Upload thất bại: ${document.documentName}`);
  } finally {
    document.uploading = false;
    document.pendingLabel = "";
    if (event?.target) {
      event.target.value = "";
    }
  }
};

const buildPayload = () => {
  return {
    idExam: examId.value,
    avatar: String(formState.avatar || "").trim(),
    fullName: formState.fullName.trim(),
    dateOfBirth: toIsoStringOrNull(formState.dateOfBirth),
    idProvince: Number(formState.idProvince),
    identityNumber: formState.identityNumber.trim(),
    identityIssueDate: toIsoStringOrNull(formState.identityIssueDate),
    identityIssuePlace: formState.identityIssuePlace.trim(),
    idEthnicity: Number(formState.idEthnicity),
    gender: formState.gender,
    idCommune: Number(formState.idCommune),
    permanentAddress: formState.permanentAddress.trim(),
    phoneNumber: formState.phoneNumber.trim(),
    idCurrentCommune: Number(formState.idCurrentCommune),
    currentAddress: formState.currentAddress.trim(),
    documents: documentUploads.value
      .filter(item => item.files.length)
      .map(item => ({
        idExamDocument: Number(item.idExamDocument),
        url: item.files.map(file => file.url).join(","),
      })),
  };
};

const submitApplication = async () => {
  if (status.value.isClosed) {
    message.warning("Kỳ khảo thí này hiện chưa mở hoặc đã kết thúc");
    return;
  }

  if (avatarUploading.value) {
    message.warning("Vui lòng chờ upload ảnh 3x4 hoàn tất");
    return;
  }

  if (hasUploadingDocuments.value) {
    message.warning("Vui lòng chờ upload hồ sơ hoàn tất");
    return;
  }

  const isValid = await validateFormAndFocusError();
  if (!isValid) {
    return;
  }

  submitLoading.value = true;

  try {
    ensureRequiredDocumentsUploaded();

    const { data, error } = await applicationUser.putByRest("submit", {
      body: buildPayload(),
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Nộp hồ sơ thất bại");
    }

    clearDraftStorage();
    message.success(data.value?.message || `Nộp hồ sơ thành công, trạng thái: ${APPLICATION_STATUS_LABELS[APPLICATION_STATUS.PENDING_REVIEW]}`);
    navigateTo("/");
  } catch (error) {
    message.error(error?.message || "Nộp hồ sơ thất bại");
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  clearDraftStorage();
  resetFormState();
  documentUploads.value = createDocumentUploads(examDetail.value?.documents || []);
  message.info("Đã hủy thông tin đang nhập");
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  navigateTo("/");
};

const fetchExamDetail = async () => {
  loading.value = true;
  loadError.value = "";

  try {
    if (!examId.value) {
      throw new Error("Mã kỳ khảo thí không hợp lệ.");
    }
    const { data, error } = await examUser.getByRest("detail", {
      params: {
        id: examId.value,
      },
    });
    if (error.value || data.value?.success === false || !data.value?.data) {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể tải thông tin kỳ khảo thí.");
    }

    examDetail.value = data.value.data;

    if (!restoreDraft()) {
      documentUploads.value = createDocumentUploads(examDetail.value.documents || []);
    }
  } catch (error) {
    examDetail.value = null;
    loadError.value = error?.message || "Không thể tải thông tin kỳ khảo thí.";
  } finally {
    loading.value = false;
  }
};

watch(
  examId,
  () => {
    resetFormState();
    documentUploads.value = [];
    fetchExamDetail();
  },
  { immediate: true },
);

useHead(() => ({
  title: examDetail.value ? `Đăng ký ${examDetail.value.examName}` : "Đăng ký kỳ khảo thí",
}));
</script>
