<script setup lang="ts">
import { ref, reactive, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore, useUserStore } from '@/stores';
import { useToast } from '@/composables/useToast';
import {
  uploadProfileImage,
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
} from '@/utils';
import type { UpdateUserDTO } from '@/types/dto/user.dto';

import BaseButton from '@/components/common/BaseButton.vue';
import BaseFormGroup from '@/components/common/BaseFormGroup.vue';
import CommonInput from '@/components/common/CommonInput.vue';
import CommonDropdown from '@/components/common/CommonDropdown.vue';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const { isLoading } = storeToRefs(authStore);
const { selectedUser } = storeToRefs(userStore);
const { showSuccess, showError } = useToast();

const isEditMode = ref(false);
const isSaving = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

const formData = reactive({
  title: '' as string,
  firstName: '',
  lastName: '',
  address: '',
});

const initializeFormData = () => {
  if (selectedUser.value) {
    formData.title = selectedUser.value.title || '';
    formData.firstName = selectedUser.value.firstName || '';
    formData.lastName = selectedUser.value.lastName || '';
    formData.address = selectedUser.value.address || '';
  }
};

const enableEditMode = () => {
  isEditMode.value = true;
};

const handleCancel = () => {
  isEditMode.value = false;
  initializeFormData();
  clearImagePreview();
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const validation = validateImageFile(file, 5);
  if (!validation.valid) {
    showError(validation.error || 'ไฟล์ไม่ถูกต้อง');
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    return;
  }

  clearImagePreview();

  previewUrl.value = createImagePreview(file);
  selectedFile.value = file;
};

const clearImagePreview = () => {
  if (previewUrl.value) {
    revokeImagePreview(previewUrl.value);
    previewUrl.value = null;
  }
  selectedFile.value = null;
};

const handleSave = async () => {
  if (!selectedUser.value) return;

  isSaving.value = true;
  try {
    if (selectedFile.value) {
      const response = await uploadProfileImage(selectedFile.value);

      if (selectedUser.value) {
        selectedUser.value.imageUrl = response.data.imageUrl;
        selectedUser.value.firstName = response.data.firstName;
        selectedUser.value.lastName = response.data.lastName;
      }

      clearImagePreview();
    }

    const updateData: UpdateUserDTO = {
      title: formData.title || undefined,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      constituencyId: selectedUser.value.constituencyId,
    };

    await userStore.updateUser(selectedUser.value.id, updateData);

    showSuccess('บันทึกข้อมูลสำเร็จ');
    isEditMode.value = false;
  } catch (err: any) {
    showError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  } finally {
    isSaving.value = false;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    showSuccess('ออกจากระบบสำเร็จ');
    router.push('/login');
  } catch (err: any) {
    showError(err.message || 'เกิดข้อผิดพลาดในการออกจากระบบ');
  }
};

watch(
  () => authStore?.currentUser,
  async () => {
    if (authStore?.currentUser) {
      await userStore.fetchUserById(authStore.currentUser.id);
      initializeFormData();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  clearImagePreview();
});
</script>

<template>
  <div class="profile-container">
    <div class="card">
      <h2 class="title">บันทึกข้อมูลผู้ใช้งาน</h2>

      <div v-if="!selectedUser" class="loading-state">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <template v-else>
        <div class="profile-header">
          <div class="avatar-circle">
            <img
              :src="
                previewUrl ||
                selectedUser.imageUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.firstName}`
              "
              :alt="`${selectedUser.firstName} avatar`"
            />
          </div>
          <div class="upload-actions">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              style="display: none"
              @change="handleFileSelect"
            />
            <BaseButton
              size="small"
              :disabled="!isEditMode"
              @click="triggerFileInput"
            >
              เลือกรูป
            </BaseButton>
            <p class="help-text">ใช้รูปโปรไฟล์ JPG or PNG.</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="full-width name-row">
            <BaseFormGroup label="คำนำหน้า" for="title">
              <CommonDropdown
                id="title"
                v-model="formData.title"
                placeholder="เลือกคำนำหน้า"
                :options="[
                  { label: 'นาย', value: 'นาย' },
                  { label: 'นาง', value: 'นาง' },
                  { label: 'นางสาว', value: 'นางสาว' },
                ]"
                :disabled="!isEditMode"
              />
            </BaseFormGroup>

            <BaseFormGroup label="ชื่อ" for="firstName">
              <CommonInput
                id="firstName"
                v-model="formData.firstName"
                type="text"
                placeholder="ชื่อ"
                :disabled="!isEditMode"
              />
            </BaseFormGroup>

            <BaseFormGroup label="นามสกุล" for="lastName">
              <CommonInput
                id="lastName"
                v-model="formData.lastName"
                type="text"
                placeholder="นามสกุล"
                :disabled="!isEditMode"
              />
            </BaseFormGroup>
          </div>

          <BaseFormGroup label="หมายเลขประจำตัว 13 หลัก" for="nationalId">
            <CommonInput
              id="nationalId"
              :modelValue="selectedUser.nationalId"
              type="text"
              disabled
            />
          </BaseFormGroup>

          <BaseFormGroup label="เลขหลังบัตร" for="laserCode">
            <CommonInput
              id="laserCode"
              :modelValue="selectedUser.laserCode || '-'"
              type="text"
              disabled
            />
          </BaseFormGroup>

          <div class="full-width">
            <BaseFormGroup label="ที่อยู่" for="address">
              <CommonInput
                id="address"
                v-model="formData.address"
                type="text"
                placeholder="ที่อยู่"
                :disabled="!isEditMode"
              />
            </BaseFormGroup>
          </div>

          <BaseFormGroup label="จังหวัด" for="province">
            <CommonInput
              id="province"
              :modelValue="selectedUser.constituency?.province || '-'"
              type="text"
              disabled
            />
          </BaseFormGroup>

          <BaseFormGroup label="เขตการเลือกตั้ง" for="district">
            <CommonInput
              id="district"
              :modelValue="
                selectedUser.constituency?.districtNumber?.toString() || '-'
              "
              type="text"
              disabled
            />
          </BaseFormGroup>
        </div>

        <div class="actions">
          <template v-if="isEditMode">
            <BaseButton
              variant="secondary"
              @click="handleCancel"
              :disabled="isSaving"
            >
              ยกเลิก
            </BaseButton>
            <BaseButton
              variant="primary"
              @click="handleSave"
              :loading="isSaving"
              loadingText="กำลังบันทึก..."
            >
              บันทึก
            </BaseButton>
          </template>
          <BaseButton
            v-else
            variant="primary"
            @click="enableEditMode"
            class="ml-auto"
          >
            แก้ไข
          </BaseButton>
        </div>

        <!-- Logout Section -->
        <div class="logout-section">
          <BaseButton
            variant="primary"
            @click="handleLogout"
            :loading="isLoading"
            loadingText="กำลังออกจากระบบ..."
            class="btn-logout"
          >
            ออกจากระบบ
          </BaseButton>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 3rem;
  width: 100%;
  max-width: 600px;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f1f2f6;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.help-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1.5rem;
  margin-bottom: 2rem;
}

.full-width {
  grid-column: 1 / -1;
}

.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .name-row {
    grid-template-columns: 1fr;
  }
}

.ml-auto {
  margin-left: auto;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.logout-section {
  margin-top: 2rem;
  padding-top: 2rem;
  display: flex;
  justify-content: center;
}

.btn-logout {
  min-width: 150px;
  background-color: #ef4444 !important;
}

.btn-logout:hover:not(:disabled) {
  background-color: #dc2626 !important;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
