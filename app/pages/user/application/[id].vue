<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 px-4 py-2">
    <div class="mx-auto max-w-7xl">
      <div v-if="detailLoading" class="flex flex-col items-center justify-center rounded-[2rem] border border-white/80 bg-white/60 p-20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <a-spin size="large" />
        <p class="mt-6 animate-pulse text-sm font-medium text-slate-500">Đang tải chi tiết hồ sơ...</p>
      </div>

      <div v-else-if="loadError" class="mx-auto max-w-2xl text-center">
        <div class="rounded-[2rem] border border-rose-100 bg-white/80 p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 shadow-inner">
            <Icon name="lucide:shield-x" class="text-4xl" />
          </div>
          <h1 class="mt-6 text-2xl font-bold tracking-tight text-slate-900">Không tải được chi tiết hồ sơ</h1>
          <p class="mt-3 text-base text-slate-500">{{ loadError }}</p>
          <div class="mt-8 flex justify-center gap-3">
            <a-button class="h-12 rounded-2xl px-6 font-semibold" @click="goBack">Quay lại</a-button>
            <a-button type="primary" danger class="h-12 rounded-2xl px-8 font-semibold" @click="fetchDetailData">Thử lại</a-button>
          </div>
        </div>
      </div>

      <div v-else-if="detailData" class="container mx-auto">
        <section class="flex flex-col gap-8">
          <div class="rounded-[2rem] border border-white/80 bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:bg-white/80">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div class="flex-1">
                <div class="mb-4 flex flex-wrap items-center gap-3">
                  <a-button class="h-10 rounded-xl px-4 font-semibold" @click="goBack">
                    <template #icon><Icon name="lucide:arrow-left" /></template>
                    Quay lại danh sách
                  </a-button>
                  <a-tag :color="getStatusColor(detailData)">
                    {{ getStatusLabel(detailData) }}
                  </a-tag>
                </div>
                <h1 class="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-4xl font-extrabold tracking-tight text-slate-900 text-transparent">
                  {{ detailData.examName || `Kỳ tuyển sinh #${detailData.idExam}` }}
                </h1>
              </div>

              <div class="flex flex-wrap gap-4 lg:flex-nowrap">
                <div class="flex min-w-[140px] flex-col justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Mã hồ sơ</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">{{ detailData.applicationCode || `#${detailData.id}` }}</div>
                </div>
                <div class="flex min-w-[140px] flex-col justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Số giấy tờ</div>
                  <div class="mt-1 text-lg font-bold text-blue-600">{{ normalizedDocuments.length }} hồ sơ</div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
            <div class="p-8">
              <div class="space-y-6">
                <a-form v-if="showEditAction" ref="detailFormRef" :model="detailData" layout="vertical" class="space-y-10" @submit.prevent>
                  <a-alert v-if="detailData.note" type="warning" show-icon class="!rounded-2xl !border-amber-200 !bg-amber-50">
                    <template #message>
                      <span class="font-semibold text-amber-800">Lý do từ chối</span>
                    </template>
                    <template #description>
                      <p class="mb-0 whitespace-pre-line text-sm leading-6 text-amber-700">{{ detailData.note }}</p>
                    </template>
                  </a-alert>
                  <section class="pb-2">
                    <div class="mb-8 flex items-center gap-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Icon name="lucide:user" class="text-xl" />
                      </div>
                      <h2 class="text-xl font-bold text-slate-900">Thông tin thí sinh</h2>
                    </div>

                    <div class="grid gap-x-6 gap-y-5 md:grid-cols-3">
                      <a-form-item label="Ảnh 3x4" name="avatar" class="md:col-span-3" :rules="detailFormRules.avatar">
                        <div class="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 transition-colors hover:bg-slate-50">
                          <div class="flex flex-col gap-6 md:flex-row md:items-start">
                            <button type="button" class="group relative flex h-[192px] w-[144px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-white transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" :class="detailData.avatar ? 'cursor-pointer border-solid border-slate-200' : 'cursor-default'" :disabled="!detailData.avatar" @click="openAvatarPreview">
                              <img v-if="detailData.avatar" :src="detailData.avatar" alt="Ảnh 3x4" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div v-else class="flex flex-col items-center gap-2 px-4 text-center text-slate-400">
                                <Icon name="lucide:image" class="text-3xl opacity-50" />
                                <span class="text-xs font-medium uppercase tracking-wider">Chưa có ảnh</span>
                              </div>
                              <div v-if="detailData.avatar" class="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                <Icon name="lucide:zoom-in" class="text-2xl text-white" />
                              </div>
                            </button>

                            <div class="flex-1 space-y-4">
                              <div>
                                <input id="edit-avatar-upload" type="file" class="!hidden" :disabled="avatarUploading || isEditingProcessing" accept=".png,.jpg,.jpeg,.webp" @change="handleAvatarUpload" />
                                <label for="edit-avatar-upload" tabindex="0" class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all focus-within:ring-2 focus-within:ring-blue-500 hover:bg-slate-50 hover:text-blue-600" :class="{ 'cursor-not-allowed opacity-50': avatarUploading || isEditingProcessing }">
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
                                <div v-if="detailData.avatar" class="flex flex-wrap gap-2">
                                  <a-button danger type="text" class="rounded-lg font-medium hover:bg-rose-50" :disabled="isEditingProcessing" @click="removeAvatar">
                                    <template #icon><Icon name="lucide:trash-2" class="mr-1.5" /></template>
                                    Xóa ảnh
                                  </a-button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <a-image
                            v-if="detailData.avatar"
                            :src="detailData.avatar"
                            class="hidden"
                            :preview="{
                              visible: isAvatarPreviewOpen,
                              src: detailData.avatar,
                              onVisibleChange: handleAvatarPreviewVisibleChange,
                            }" />
                        </div>
                      </a-form-item>

                      <a-form-item label="Họ tên" name="fullName" :rules="detailFormRules.fullName">
                        <a-input v-model:value="detailData.fullName" placeholder="Nhập họ tên đầy đủ" size="large" class="rounded-xl" />
                      </a-form-item>

                      <a-form-item label="Ngày sinh" name="dateOfBirth" :rules="detailFormRules.dateOfBirth">
                        <a-date-picker v-model:value="detailData.dateOfBirth" format="DD/MM/YYYY" class="w-full rounded-xl" size="large" placeholder="Chọn ngày sinh" />
                      </a-form-item>

                      <div>
                        <UserSelectProvince v-model="detailData.idProvince" label="Nơi sinh" name="idProvince" placeholder="Chọn tỉnh thành phố" :rules="detailFormRules.idProvince" size="large" class="rounded-xl" />
                      </div>

                      <a-form-item label="Số CCCD" name="identityNumber" :rules="detailFormRules.identityNumber">
                        <a-input v-model:value="detailData.identityNumber" placeholder="Nhập số CCCD" size="large" class="rounded-xl" />
                      </a-form-item>

                      <a-form-item label="Ngày cấp CCCD" name="identityIssueDate" :rules="detailFormRules.identityIssueDate">
                        <a-date-picker v-model:value="detailData.identityIssueDate" format="DD/MM/YYYY" class="w-full rounded-xl" size="large" placeholder="Chọn ngày cấp CCCD" />
                      </a-form-item>

                      <a-form-item label="Nơi cấp CCCD" name="identityIssuePlace" :rules="detailFormRules.identityIssuePlace">
                        <a-input v-model:value="detailData.identityIssuePlace" placeholder="Nhập nơi cấp CCCD" size="large" class="rounded-xl" />
                      </a-form-item>

                      <div>
                        <UserSelectEthnicity v-model="detailData.idEthnicity" label="Dân tộc" name="idEthnicity" placeholder="Chọn dân tộc" :rules="detailFormRules.idEthnicity" size="large" class="rounded-xl" />
                      </div>

                      <a-form-item label="Giới tính" name="gender" :rules="detailFormRules.gender">
                        <a-select v-model:value="genderValue" :options="genderOptions" placeholder="Chọn giới tính" size="large" class="rounded-xl" />
                      </a-form-item>

                      <div>
                        <UserSelectProvince v-model="detailData.idPermanentProvince" label="Tỉnh thường trú" name="idPermanentProvince" placeholder="Chọn tỉnh thành phố" :rules="detailFormRules.idPermanentProvince" size="large" disabled class="rounded-xl" />
                      </div>

                      <div>
                        <UserSelectCommune v-model="detailData.idCommune" :id-province="detailData.idPermanentProvince" label="Phường/xã thường trú" name="idCommune" placeholder="Chọn phường/xã" :rules="detailFormRules.idCommune" size="large" class="rounded-xl" />
                      </div>

                      <a-form-item label="Địa chỉ thường trú" name="permanentAddress" class="md:col-span-3" :rules="detailFormRules.permanentAddress">
                        <a-input v-model:value="detailData.permanentAddress" placeholder="Nhập địa chỉ thường trú" size="large" class="rounded-xl" />
                      </a-form-item>

                      <a-form-item label="Số điện thoại" name="phoneNumber" :rules="detailFormRules.phoneNumber">
                        <a-input v-model:value="detailData.phoneNumber" placeholder="Nhập số điện thoại" size="large" class="rounded-xl" />
                      </a-form-item>

                      <div>
                        <UserSelectProvince v-model="detailData.idCurrentProvince" label="Tỉnh hiện tại" name="idCurrentProvince" placeholder="Chọn tỉnh thành phố" :rules="detailFormRules.idCurrentProvince" size="large" disabled class="rounded-xl" />
                      </div>

                      <div>
                        <UserSelectCommune2 v-model="detailData.idCurrentCommune" :id-province="detailData.idCurrentProvince" label="Phường/xã hiện tại" name="idCurrentCommune" placeholder="Chọn phường/xã" :rules="detailFormRules.idCurrentCommune" size="large" class="rounded-xl" />
                      </div>

                      <a-form-item label="Địa chỉ hiện tại" name="currentAddress" class="md:col-span-3" :rules="detailFormRules.currentAddress">
                        <a-input v-model:value="detailData.currentAddress" placeholder="Nhập địa chỉ hiện tại" size="large" class="rounded-xl" />
                      </a-form-item>
                    </div>
                  </section>
                </a-form>

                <section v-else>
                  <div class="mb-8 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon name="lucide:user" class="text-xl" />
                    </div>
                    <h2 class="text-xl font-bold text-slate-900">Thông tin thí sinh</h2>
                  </div>

                  <div class="grid gap-4 md:grid-cols-3">
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:row-span-2">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Ảnh 3x4</div>
                      <button type="button" class="group relative mx-auto mt-3 flex h-[192px] w-[144px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" :class="detailData.avatar ? 'cursor-pointer border-solid border-slate-200' : 'cursor-default'" :disabled="!detailData.avatar" @click="openAvatarPreview">
                        <img v-if="detailData.avatar" :src="detailData.avatar" alt="Ảnh 3x4" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div v-else class="flex flex-col items-center gap-2 px-4 text-center text-slate-400">
                          <Icon name="lucide:image" class="text-3xl opacity-50" />
                          <span class="text-xs font-medium uppercase tracking-wider">Chưa có ảnh</span>
                        </div>
                        <div v-if="detailData.avatar" class="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <Icon name="lucide:zoom-in" class="text-2xl text-white" />
                        </div>
                      </button>

                      <a-image
                        v-if="detailData.avatar"
                        :src="detailData.avatar"
                        class="hidden"
                        :preview="{
                          visible: isAvatarPreviewOpen,
                          src: detailData.avatar,
                          onVisibleChange: handleAvatarPreviewVisibleChange,
                        }" />
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Họ tên</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.fullName || detailData.fullname || "-" }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Ngày sinh</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ formatDate(detailData.dateOfBirth) }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Số CCCD</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.identityNumber || "-" }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Ngày cấp CCCD</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ formatDate(detailData.identityIssueDate) }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Nơi cấp CCCD</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.identityIssuePlace || "-" }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Giới tính</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ formatGender(detailData.gender) }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Dân tộc</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.ethnicityName || `#${detailData.idEthnicity || "-"}` }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Nơi sinh</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.provinceName || `#${detailData.idProvince || "-"}` }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tỉnh thường trú</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.permanentProvinceName || `#${detailData.idPermanentProvince || "-"}` }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Phường/xã thường trú</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.permanentCommuneName || `#${detailData.idCommune || "-"}` }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:col-span-3">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Địa chỉ thường trú</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.permanentAddress || "-" }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Số điện thoại</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.phoneNumber || "-" }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tỉnh hiện tại</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.currentProvinceName || `#${detailData.idCurrentProvince || "-"}` }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Phường/xã hiện tại</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.currentCommuneName || `#${detailData.idCurrentCommune || "-"}` }}</div>
                    </div>
                    <div class="rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:col-span-3">
                      <div class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Địa chỉ hiện tại</div>
                      <div class="mt-1.5 font-medium text-slate-900">{{ detailData.currentAddress || "-" }}</div>
                    </div>
                    <a-alert v-if="detailData.note" type="warning" show-icon class="!rounded-2xl !border-amber-200 !bg-amber-50 md:col-span-3">
                      <template #message>
                        <span class="font-semibold text-amber-800">Ghi chú hồ sơ</span>
                      </template>
                      <template #description>
                        <p class="mb-0 whitespace-pre-line text-sm leading-6 text-amber-700">{{ detailData.note }}</p>
                      </template>
                    </a-alert>
                  </div>
                </section>

                <div class="my-10 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                <section ref="documentsSectionRef" class="pb-4">
                  <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <Icon name="lucide:folder-open" class="text-xl" />
                      </div>
                      <h2 class="text-xl font-bold text-slate-900">Hồ sơ yêu cầu</h2>
                    </div>
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <Icon name="lucide:file-stack" class="text-sm" />
                      {{ normalizedDocuments.length }} hồ sơ
                    </span>
                  </div>

                  <div v-if="normalizedDocuments.length" class="space-y-5">
                    <div :id="`edit-document-card-${index}`" v-for="(document, index) in normalizedDocuments" :key="document.key" tabindex="-1" class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                      <div class="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
                        <div class="flex-1">
                          <div class="flex flex-wrap items-center gap-3">
                            <h4 class="text-base font-bold text-slate-900">{{ document.displayName }}</h4>
                            <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest" :class="document.isRequired ? 'bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100' : 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100'">
                              {{ document.isRequired ? "Bắt buộc" : "Tùy chọn" }}
                            </span>
                          </div>
                          <p class="mt-2 text-sm text-slate-500">
                            {{ document.links.length ? `${document.links.length} file đính kèm.` : document.isRequired ? "Bạn cần phải tải lên ít nhất 1 file cho hồ sơ bắt buộc này." : "Bạn có thể bỏ qua nếu không có hồ sơ này." }}
                          </p>
                        </div>

                        <div v-if="showEditAction" class="w-full shrink-0 lg:w-auto">
                          <input :id="`edit-document-${document.idExamDocument}`" type="file" class="!hidden" :disabled="isDocumentUploading(document.idExamDocument) || isEditingProcessing" accept=".pdf,.png,.jpg,.jpeg,.webp" multiple @change="event => handleEditDocumentUpload(document.idExamDocument, event)" />

                          <label :for="`edit-document-${document.idExamDocument}`" class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all focus-within:ring-2 focus-within:ring-blue-500 hover:bg-slate-50 hover:text-blue-600 lg:w-auto" :class="{ 'cursor-not-allowed opacity-50': isDocumentUploading(document.idExamDocument) || isEditingProcessing }">
                            <Icon name="lucide:plus" class="text-lg" />
                            <span>Thêm file</span>
                          </label>
                        </div>
                      </div>

                      <div v-if="isDocumentUploading(document.idExamDocument)" class="border-t border-slate-100 bg-slate-50/50 p-6">
                        <div class="flex items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm font-medium text-blue-700">
                          <a-spin size="small" />
                          Đang upload hồ sơ...
                        </div>
                      </div>

                      <div v-else-if="document.links.length" class="border-t border-slate-100 bg-slate-50/50 p-6">
                        <div class="grid gap-3 sm:grid-cols-1">
                          <div v-for="(link, index) in document.links" :key="`${document.key}-${index}`" class="group/file relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-300">
                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover/file:bg-blue-50 group-hover/file:text-blue-600">
                              <Icon v-if="getFileType(link) === 'image'" name="lucide:image" class="text-xl" />
                              <Icon v-else-if="getFileType(link) === 'pdf'" name="lucide:file-text" class="text-xl" />
                              <Icon v-else name="lucide:file" class="text-xl" />
                            </div>

                            <div class="min-w-0 flex-1">
                              <BaseImagePreviewLink v-if="getFileType(link) === 'image'" :src="link" class="truncate text-sm font-medium text-slate-700 hover:text-blue-600" />
                              <BasePdfPreviewLink v-else-if="getFileType(link) === 'pdf'" :src="link" class="truncate text-sm font-medium text-slate-700 hover:text-blue-600" />
                              <a v-else :href="link" target="_blank" rel="noopener noreferrer" class="block truncate text-sm font-medium text-slate-700 hover:text-blue-600">{{ getDisplayName(link) }}</a>
                            </div>

                            <button v-if="showEditAction" type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50 group-hover/file:opacity-100" :disabled="isEditingProcessing" @click.prevent="removeEditDocumentFile(document.idExamDocument, index)" title="Xóa file">
                              <Icon name="lucide:x" class="text-lg" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="!showEditAction" class="border-t border-slate-100 p-6 text-center">
                        <div class="inline-block rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500">Hồ sơ này không có tài liệu đính kèm.</div>
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
                    <p class="text-sm font-medium text-slate-500">Hồ sơ này chưa có tài liệu đính kèm.</p>
                  </div>
                </section>

                <div class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-8">
                  <a-button class="h-12 rounded-2xl px-6 font-semibold" @click="goBack">Quay lại</a-button>
                  <div class="flex flex-wrap gap-3">
                    <a-button v-if="showEditAction" class="h-12 rounded-2xl px-8 font-semibold shadow-sm hover:shadow" :loading="saveLoading" :disabled="isEditingProcessing" @click="saveApplication">Lưu</a-button>
                    <a-button v-if="showPaymentAction" type="primary" class="h-12 rounded-2xl px-10 font-bold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30" :loading="qrLoading" @click="openPaymentModal">Thanh toán ngay</a-button>
                    <a-button v-else-if="showSubmitAction" type="primary" class="h-12 rounded-2xl px-10 font-bold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30" :loading="submitLoading" :disabled="hasUploadingEditDocuments || isEditingProcessing" @click="submitApplication">Nộp hồ sơ</a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <a-modal v-model:open="paymentVisible" title="Thanh toán hồ sơ" :width="960" :footer="null" @cancel="closePaymentModal">
      <div v-if="qrLoading" class="py-12 text-center">
        <a-spin size="large" />
      </div>

      <div v-else-if="qrData" class="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 class="text-lg font-bold text-slate-900">Thông tin chuyển khoản</h3>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
            <img :src="qrData.url" :alt="`QR thanh toán ${qrData.applicationCode}`" class="mx-auto h-auto w-full max-w-[280px]" />
          </div>

          <p class="mt-4 text-sm leading-6 text-slate-500">Quét mã QR bằng ứng dụng ngân hàng để thanh toán. Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống đối soát chính xác.</p>

          <div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div class="text-xs uppercase tracking-[0.15em] text-amber-600">Nội dung chuyển khoản</div>
            <div class="mt-2 text-center text-xl font-bold tracking-[0.35em] text-amber-700">{{ qrData.code || "-" }}</div>
          </div>

          <div class="mt-4 space-y-3">
            <div class="rounded-2xl bg-white px-4 py-3">
              <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Ngân hàng</div>
              <div class="mt-2 font-semibold text-slate-800">{{ qrData.bank || "-" }}</div>
            </div>
            <div class="rounded-2xl bg-white px-4 py-3">
              <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Số tài khoản</div>
              <div class="mt-2 font-semibold text-slate-800">{{ qrData.accountNo || "-" }}</div>
            </div>
            <div class="rounded-2xl bg-white px-4 py-3">
              <div class="text-xs uppercase tracking-[0.15em] text-slate-400">Chủ tài khoản</div>
              <div class="mt-2 font-semibold uppercase text-slate-800">{{ qrData.accountName || "-" }}</div>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 class="text-lg font-bold text-slate-900">Thông tin đợt tuyển sinh / kỳ thi</h3>

          <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div class="grid grid-cols-[160px_1fr] border-b border-slate-200">
              <div class="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">Tên đợt</div>
              <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.examName || "-" }}</div>
            </div>
            <div class="grid grid-cols-[160px_1fr] border-b border-slate-200">
              <div class="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">Mã hồ sơ</div>
              <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.applicationCode || "-" }}</div>
            </div>
            <div class="grid grid-cols-[160px_1fr] border-b border-slate-200">
              <div class="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">Tên thí sinh</div>
              <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ qrData.fullName || "-" }}</div>
            </div>
            <div class="grid grid-cols-[160px_1fr] border-b border-slate-200">
              <div class="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">Lệ phí</div>
              <div class="px-4 py-3 text-sm font-semibold text-slate-900">{{ formatCurrency(qrData.fee) }}</div>
            </div>
            <div class="grid grid-cols-[160px_1fr]">
              <div class="bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Tổng thanh toán</div>
              <div class="px-4 py-3 text-base font-bold text-emerald-700">{{ formatCurrency(qrData.fee) }}</div>
            </div>
          </div>

          <div class="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">Sau khi chuyển khoản thành công, hồ sơ sẽ được nhà trường xác nhận theo quy trình đối soát.</div>

          <div class="mt-6 flex justify-end gap-3">
            <a-button class="min-w-32" @click="closePaymentModal">Quay lại</a-button>
            <a-button type="primary" class="min-w-40" :loading="confirmPaymentLoading" @click="confirmPayment">Xác nhận thanh toán</a-button>
          </div>
        </section>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { getApplicationStatusColor, getApplicationStatusLabel, isApprovedPendingPaymentApplicationStatus, isDraftApplicationStatus } from "~/composables/useApplicationStatus";

definePageMeta({
  layout: "default",
});

const userStore = useUserStore();
const route = useRoute();
const { applicationUser, s3 } = useApi();

if (!userStore.token) {
  userStore.openLogin();
  await navigateTo("/");
}

const applicationId = computed(() => {
  const parsedValue = Number(route.params.id);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : undefined;
});

const loadError = ref("");
const detailData = ref(null);
const detailLoading = ref(false);
const detailFormRef = ref();
const documentsSectionRef = ref();
const saveLoading = ref(false);
const submitLoading = ref(false);
const avatarUploading = ref(false);
const isAvatarPreviewOpen = ref(false);
const documentUploadingMap = ref({});
const paymentVisible = ref(false);
const qrData = ref(null);
const qrLoading = ref(false);
const confirmPaymentLoading = ref(false);
const pendingDeletedFileNames = ref([]);
const detailRequestParams = computed(() => ({
  id: applicationId.value,
}));
const qrRequestParams = computed(() => ({
  id: Number(detailData.value?.id),
}));
const genderOptions = [
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
];

const DEFAULT_PROVINCE_ID = 3;

const genderValue = computed({
  get() {
    if (detailData.value?.gender === true) return "male";
    if (detailData.value?.gender === false) return "female";
    return undefined;
  },
  set(value) {
    if (!detailData.value) return;
    if (value === "male") {
      detailData.value.gender = true;
      return;
    }
    if (value === "female") {
      detailData.value.gender = false;
      return;
    }
    detailData.value.gender = undefined;
  },
});
const detailFormRules = {
  avatar: [{ required: true, message: "Vui lòng tải lên ảnh 3x4" }],
  fullName: [{ required: true, message: "Vui lòng nhập họ tên đầy đủ" }],
  dateOfBirth: [{ required: true, message: "Vui lòng chọn ngày sinh" }],
  idProvince: [{ required: true, message: "Vui lòng chọn nơi sinh" }],
  identityNumber: [
    { required: true, message: "Vui lòng nhập số CCCD" },
    { pattern: /^\d{9,12}$/, message: "Số CCCD phải gồm 9 đến 12 chữ số" },
  ],
  identityIssueDate: [{ required: true, message: "Vui lòng chọn ngày cấp CCCD" }],
  identityIssuePlace: [{ required: true, message: "Vui lòng nhập nơi cấp CCCD" }],
  idEthnicity: [{ required: true, message: "Vui lòng chọn dân tộc" }],
  gender: [{ required: true, message: "Vui lòng chọn giới tính" }],
  idPermanentProvince: [{ required: true, message: "Vui lòng chọn tỉnh/thành phố cư trú" }],
  idCommune: [{ required: true, message: "Vui lòng chọn phường/xã cư trú" }],
  permanentAddress: [{ required: true, message: "Vui lòng nhập địa chỉ thường trú" }],
  phoneNumber: [
    { required: true, message: "Vui lòng nhập số điện thoại" },
    { pattern: /^(0|\+84)\d{9,10}$/, message: "Số điện thoại không hợp lệ" },
  ],
  idCurrentProvince: [{ required: true, message: "Vui lòng chọn tỉnh/thành phố hiện tại" }],
  idCurrentCommune: [{ required: true, message: "Vui lòng chọn phường/xã hiện tại" }],
  currentAddress: [{ required: true, message: "Vui lòng nhập địa chỉ nơi ở hiện tại" }],
};
const {
  data: detailResponse,
  error: detailResponseError,
  execute: executeDetailRequest,
} = await applicationUser.getByRest("detail", {
  params: detailRequestParams,
  immediate: false,
});
const {
  data: qrResponse,
  error: qrResponseError,
  execute: executeQrRequest,
} = await applicationUser.getByRest("qr", {
  params: qrRequestParams,
  immediate: false,
});

const normalizedDocuments = computed(() => {
  const documents = Array.isArray(detailData.value?.documents) ? detailData.value.documents : [];

  return documents.map((document, index) => {
    if (typeof document === "string") {
      return {
        key: `document-${index}`,
        idExamDocument: index + 1,
        displayName: `Hồ sơ #${index + 1}`,
        links: splitDocumentLinks(document),
        isRequired: false,
      };
    }

    const idExamDocument = document?.idExamDocument || document?.id || index + 1;

    return {
      key: `${idExamDocument || "document"}-${index}`,
      idExamDocument,
      displayName: document?.documentName || `Hồ sơ #${idExamDocument}`,
      links: splitDocumentLinks(document?.url || document?.fileUrl || document?.link || document?.path),
      isRequired: !!document?.isRequired,
    };
  });
});

const showSubmitAction = computed(() => isDraftApplicationStatus(detailData.value));
const showEditAction = computed(() => isDraftApplicationStatus(detailData.value));
const showPaymentAction = computed(() => isApprovedPendingPaymentApplicationStatus(detailData.value));
const hasUploadingEditDocuments = computed(() => Object.values(documentUploadingMap.value).some(Boolean));
const isEditingProcessing = computed(() => saveLoading.value || submitLoading.value || avatarUploading.value || hasUploadingEditDocuments.value);

const canEditCurrentApplication = () => isDraftApplicationStatus(detailData.value);

const ensureEditableApplication = () => {
  if (!canEditCurrentApplication()) {
    throw new Error("Chỉ hồ sơ ở trạng thái nháp mới có thể chỉnh sửa");
  }
};

const formatDate = value => {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "-";
};

const formatCurrency = value => {
  if (value === undefined || value === null) return "0 VND";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatGender = value => {
  if (value === true) return "Nam";
  if (value === false) return "Nữ";
  return "-";
};

const getStatusColor = value => getApplicationStatusColor(value);
const getStatusLabel = value => getApplicationStatusLabel(value);

const normalizeApplicationDetail = detail => {
  if (!detail || typeof detail !== "object") {
    return null;
  }

  const dateOfBirth = detail.dateOfBirth ? dayjs(detail.dateOfBirth) : null;
  const identityIssueDate = detail.identityIssueDate ? dayjs(detail.identityIssueDate) : null;

  return {
    ...detail,
    avatar: detail.avatar || userStore.image_url || "",
    applicationCode: detail.applicationCode || null,
    statusName: detail.statusName || null,
    fullName: detail.fullName || detail.fullname || null,
    examName: detail.examName || null,
    idPermanentProvince: DEFAULT_PROVINCE_ID,
    idCurrentProvince: DEFAULT_PROVINCE_ID,
    dateOfBirth: dateOfBirth?.isValid() ? dateOfBirth : null,
    identityIssueDate: identityIssueDate?.isValid() ? identityIssueDate : null,
    documents: Array.isArray(detail.documents) ? detail.documents : [],
  };
};

const splitDocumentLinks = value => {
  if (!value) return [];
  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
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

const queueFileDeletion = fileName => {
  const normalizedFileName = String(fileName || "").trim();
  if (!normalizedFileName || pendingDeletedFileNames.value.includes(normalizedFileName)) return;
  pendingDeletedFileNames.value.push(normalizedFileName);
};

const flushPendingDeletedFiles = async () => {
  if (!pendingDeletedFileNames.value.length) return;

  const queuedFileNames = [...pendingDeletedFileNames.value];
  const deleteResults = await Promise.allSettled(queuedFileNames.map(deleteUploadedFile));
  const failedFileNames = queuedFileNames.filter((_, index) => deleteResults[index]?.status === "rejected");

  pendingDeletedFileNames.value = failedFileNames;

  if (failedFileNames.length) {
    message.warning(`Có ${failedFileNames.length} file chưa xóa được khỏi hệ thống`);
  }
};

const focusFirstInvalidField = async () => {
  await nextTick();

  const formElement = detailFormRef.value?.$el || detailFormRef.value?.nativeElement;
  if (!formElement) return;

  const firstErrorItem = formElement.querySelector(".ant-form-item-has-error");
  if (!firstErrorItem) return;

  firstErrorItem.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  const focusTarget = firstErrorItem.querySelector('label[for="edit-avatar-upload"]') || firstErrorItem.querySelector(".ant-select-selection-search-input") || firstErrorItem.querySelector(".ant-picker-input input") || firstErrorItem.querySelector("input:not([disabled])") || firstErrorItem.querySelector("textarea:not([disabled])") || firstErrorItem.querySelector("button:not([disabled])");

  if (focusTarget && typeof focusTarget.focus === "function") {
    focusTarget.focus({
      preventScroll: true,
    });
  }
};

const validateFormAndFocusError = async () => {
  try {
    await detailFormRef.value?.validate();
    return true;
  } catch {
    await focusFirstInvalidField();
    message.warning("Vui lòng kiểm tra lại thông tin hồ sơ");
    return false;
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

const openAvatarPreview = () => {
  if (!detailData.value?.avatar) return;
  isAvatarPreviewOpen.value = true;
};

const handleAvatarPreviewVisibleChange = visible => {
  isAvatarPreviewOpen.value = visible;
};

const removeAvatar = () => {
  if (!detailData.value) return;

  if (!canEditCurrentApplication()) {
    message.warning("Hồ sơ này không thể chỉnh sửa");
    return;
  }

  const currentAvatar = detailData.value.avatar;
  if (currentAvatar && currentAvatar !== userStore.image_url) {
    queueFileDeletion(getFileName(currentAvatar));
  }

  detailData.value.avatar = "";
  isAvatarPreviewOpen.value = false;
  // message.info("Ảnh 3x4 sẽ được xóa khi lưu hoặc nộp");
};

const handleAvatarUpload = async event => {
  const file = event?.target?.files?.[0];
  if (!file || !detailData.value) return;

  if (!canEditCurrentApplication()) {
    message.warning("Hồ sơ này không thể chỉnh sửa");
    if (event?.target) {
      event.target.value = "";
    }
    return;
  }

  avatarUploading.value = true;

  try {
    await validateAvatarRatio(file);
    const sanitizedFileName = sanitizeOriginalFileName(file.name);
    const previousAvatar = detailData.value.avatar;

    const result = await s3.upload(file, {
      key: `${Date.now()}-${sanitizedFileName}`,
      contentType: file.type || "application/octet-stream",
    });

    detailData.value.avatar = result.directUrl;

    if (previousAvatar && previousAvatar !== userStore.image_url && previousAvatar !== result.directUrl) {
      queueFileDeletion(getFileName(previousAvatar));
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

const updateDocumentLinks = (idExamDocument, links) => {
  if (!detailData.value) return;
  ensureEditableApplication();

  const nextLinks = Array.from(new Set((links || []).filter(Boolean)));
  const documents = Array.isArray(detailData.value.documents) ? [...detailData.value.documents] : [];
  const documentIndex = documents.findIndex(item => Number(item?.idExamDocument || item?.id) === Number(idExamDocument));

  if (!nextLinks.length) {
    if (documentIndex >= 0) {
      documents.splice(documentIndex, 1);
    }
    detailData.value.documents = documents;
    return;
  }

  const documentPayload = {
    ...(documentIndex >= 0 ? documents[documentIndex] : {}),
    idExamDocument: Number(idExamDocument),
    url: nextLinks.join(","),
  };

  if (documentIndex >= 0) {
    documents.splice(documentIndex, 1, documentPayload);
  } else {
    documents.push(documentPayload);
  }

  detailData.value.documents = documents;
};

const isDocumentUploading = idExamDocument => {
  return !!documentUploadingMap.value[String(idExamDocument)];
};

const focusMissingDocument = async documentIndex => {
  await nextTick();

  const target = document.getElementById(`edit-document-card-${documentIndex}`) || documentsSectionRef.value;
  if (!target) return;

  target.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  const button = target.querySelector?.(`label[for="edit-document-${normalizedDocuments.value[documentIndex]?.idExamDocument}"]`) || target.querySelector?.("label[for^='edit-document-']");

  if (button && typeof button.focus === "function") {
    button.focus({
      preventScroll: true,
    });
    return;
  }

  if (typeof target.focus === "function") {
    target.focus({
      preventScroll: true,
    });
  }
};

const ensureRequiredDocumentsUploaded = async () => {
  const missingDocumentIndex = normalizedDocuments.value.findIndex(item => item.isRequired && item.links.length === 0);

  if (missingDocumentIndex !== -1) {
    const missingDocument = normalizedDocuments.value[missingDocumentIndex];
    await focusMissingDocument(missingDocumentIndex);
    throw new Error(`Vui lòng tải lên hồ sơ bắt buộc: ${missingDocument.displayName}`);
  }
};

const removeEditDocumentFile = (idExamDocument, fileIndex) => {
  if (!canEditCurrentApplication()) {
    message.warning("Hồ sơ này không thể chỉnh sửa");
    return;
  }

  const document = normalizedDocuments.value.find(item => Number(item.idExamDocument) === Number(idExamDocument));
  if (!document) return;

  const nextLinks = [...document.links];
  const targetLink = nextLinks[fileIndex];
  if (!targetLink) return;

  queueFileDeletion(getFileName(targetLink));
  nextLinks.splice(fileIndex, 1);
  updateDocumentLinks(idExamDocument, nextLinks);
  message.info("File sẽ được xóa khi lưu hoặc nộp");
};

const handleEditDocumentUpload = async (idExamDocument, event) => {
  const files = Array.from(event?.target?.files || []);
  if (!files.length) return;

  if (!canEditCurrentApplication()) {
    message.warning("Hồ sơ này không thể chỉnh sửa");
    if (event?.target) {
      event.target.value = "";
    }
    return;
  }

  const key = String(idExamDocument);
  documentUploadingMap.value = {
    ...documentUploadingMap.value,
    [key]: true,
  };

  try {
    const uploadedFiles = await Promise.all(
      files.map(async file => {
        const sanitizedFileName = sanitizeOriginalFileName(file.name);
        const result = await s3.upload(file, {
          key: `${Date.now()}-${sanitizedFileName}`,
          contentType: file.type || "application/octet-stream",
        });

        return result.directUrl;
      }),
    );

    const existingDocument = normalizedDocuments.value.find(item => Number(item.idExamDocument) === Number(idExamDocument));
    const nextLinks = [...(existingDocument?.links || []), ...uploadedFiles];
    updateDocumentLinks(idExamDocument, nextLinks);
    message.success(`Đã tải lên hồ sơ #${idExamDocument}`);
  } catch (error) {
    message.error(error?.message || `Upload thất bại: hồ sơ #${idExamDocument}`);
  } finally {
    documentUploadingMap.value = {
      ...documentUploadingMap.value,
      [key]: false,
    };
    if (event?.target) {
      event.target.value = "";
    }
  }
};

const buildApplicationPayload = ({ includeAvatar = true } = {}) => {
  if (!detailData.value) {
    return null;
  }

  const dateOfBirth = detailData.value.dateOfBirth ? dayjs(detailData.value.dateOfBirth) : null;
  const identityIssueDate = detailData.value.identityIssueDate ? dayjs(detailData.value.identityIssueDate) : null;
  const serializeLocalDate = value => (value?.isValid() ? value.format("YYYY-MM-DD") : null);

  const payload = {
    id: detailData.value.id ?? null,
    idExam: Number(detailData.value.idExam),
    fullName: (detailData.value.fullName || detailData.value.fullname || "").trim(),
    dateOfBirth: serializeLocalDate(dateOfBirth),
    idProvince: Number(detailData.value.idProvince),
    identityNumber: (detailData.value.identityNumber || "").trim(),
    identityIssueDate: serializeLocalDate(identityIssueDate),
    identityIssuePlace: (detailData.value.identityIssuePlace || "").trim(),
    idEthnicity: Number(detailData.value.idEthnicity),
    gender: detailData.value.gender,
    idCommune: Number(detailData.value.idCommune),
    permanentAddress: (detailData.value.permanentAddress || "").trim(),
    phoneNumber: (detailData.value.phoneNumber || "").trim(),
    idCurrentCommune: Number(detailData.value.idCurrentCommune),
    currentAddress: (detailData.value.currentAddress || "").trim(),
    documents: normalizedDocuments.value.map(document => ({
      idExamDocument: Number(document.idExamDocument),
      url: document.links.join(","),
    })),
  };

  if (includeAvatar) {
    payload.avatar = String(detailData.value.avatar || userStore.image_url || "").trim();
  }

  return payload;
};

const fetchDetailData = async () => {
  if (!applicationId.value) {
    loadError.value = "Id hồ sơ không hợp lệ";
    detailData.value = null;
    return;
  }

  loadError.value = "";
  detailLoading.value = true;

  try {
    await executeDetailRequest();

    if (detailResponseError.value || detailResponse.value?.success === false || !detailResponse.value?.data) {
      throw new Error(detailResponseError.value?.data?.message || detailResponse.value?.message || "Không thể tải thông tin chi tiết");
    }

    detailData.value = normalizeApplicationDetail(detailResponse.value.data);
  } catch (error) {
    detailData.value = null;
    loadError.value = error?.message || "Không thể tải thông tin chi tiết";
  } finally {
    detailLoading.value = false;
  }
};

const goBack = () => navigateTo("/user/application");

const saveApplication = async () => {
  if (!canEditCurrentApplication()) {
    message.warning("Hồ sơ này không thể chỉnh sửa");
    return;
  }

  if (avatarUploading.value || hasUploadingEditDocuments.value) {
    message.warning("Vui lòng chờ upload hồ sơ hoàn tất");
    return;
  }

  const isValid = await validateFormAndFocusError();
  if (!isValid) {
    return;
  }

  const payload = buildApplicationPayload();
  if (!payload) {
    message.error("Không có dữ liệu hồ sơ để lưu");
    return;
  }

  saveLoading.value = true;

  try {
    const { data, error } = await applicationUser.put({
      body: payload,
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Lưu hồ sơ thất bại");
    }

    message.success(data.value?.message || "Lưu hồ sơ thành công");
    await fetchDetailData();
  } catch (error) {
    message.error(error?.message || "Lưu hồ sơ thất bại");
  } finally {
    saveLoading.value = false;
  }
};

const submitApplication = async () => {
  if (avatarUploading.value || hasUploadingEditDocuments.value) {
    message.warning("Vui lòng chờ upload hồ sơ hoàn tất");
    return;
  }

  const isValid = await validateFormAndFocusError();
  if (!isValid) {
    return;
  }

  const payload = buildApplicationPayload();
  if (!payload) {
    message.error("Không có dữ liệu hồ sơ để nộp");
    return;
  }

  submitLoading.value = true;

  try {
    await ensureRequiredDocumentsUploaded();

    const { data, error } = await applicationUser.putByRest("submit", {
      body: payload,
    });

    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Nộp hồ sơ thất bại");
    }

    message.success(data.value?.message || "Nộp hồ sơ thành công");
    await fetchDetailData();
  } catch (error) {
    message.error(error?.message || "Nộp hồ sơ thất bại");
  } finally {
    submitLoading.value = false;
  }
};

const openPaymentModal = async () => {
  if (!detailData.value?.id) {
    message.error("Không xác định được hồ sơ thanh toán");
    return;
  }

  const currentApplicationId = Number(detailData.value.id);
  if (!Number.isFinite(currentApplicationId) || currentApplicationId <= 0) {
    message.error("Id hồ sơ không hợp lệ, vui lòng kiểm tra lại");
    return;
  }

  qrData.value = null;
  paymentVisible.value = true;
  qrLoading.value = true;

  try {
    await executeQrRequest();

    if (qrResponseError.value || qrResponse.value?.success === false || !qrResponse.value?.data) {
      throw new Error(qrResponseError.value?.data?.message || qrResponse.value?.message || "Không tải được thông tin thanh toán");
    }

    qrData.value = qrResponse.value.data;
  } catch (error) {
    paymentVisible.value = false;
    message.error(error?.message || "Không tải được thông tin thanh toán");
  } finally {
    qrLoading.value = false;
  }
};

const closePaymentModal = () => {
  paymentVisible.value = false;
  qrData.value = null;
  qrLoading.value = false;
  confirmPaymentLoading.value = false;
};

const confirmPayment = async () => {
  if (!detailData.value?.id) {
    message.error("Không xác định được hồ sơ thanh toán");
    return;
  }

  if (!qrData.value) {
    message.error("Không có thông tin thanh toán để xác nhận");
    return;
  }

  if (!qrData.value.code) {
    message.error("Không có nội dung chuyển khoản để xác nhận");
    return;
  }

  confirmPaymentLoading.value = true;

  try {
    const { data, error } = await applicationUser.putByRest("confirmPayment", {
      params: { idApplication: Number(detailData.value.id) },
    });
    if (error.value || data.value?.success === false) {
      throw new Error(error.value?.data?.message || data.value?.message || "Xác nhận thanh toán thất bại");
    }

    message.success(data.value?.message || "Xác nhận thanh toán thành công");
    closePaymentModal();
    await fetchDetailData();
  } catch (error) {
    message.error(error?.message || "Xác nhận thanh toán thất bại");
  } finally {
    confirmPaymentLoading.value = false;
  }
};

// await fetchDetailData();
onMounted(async () => {
  await fetchDetailData();
});
useHead({
  title: "Chi tiết hồ sơ",
});
</script>
