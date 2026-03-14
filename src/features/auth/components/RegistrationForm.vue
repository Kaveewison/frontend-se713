<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores';
import { useToast } from '@/composables/useToast';
import { useForm, type ValidationRule } from '@/composables/useForm';
import { validateRequired, validateCitizenId } from '@/utils/validators';
import type { RegistrationDTO } from '@/types/dto';
import provinces from '@/datas/provinces.json';
import { httpClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';

import CommonInput from '@/components/common/CommonInput.vue';
import CommonDropdown from '@/components/common/CommonDropdown.vue';
import type { DropdownOption } from '@/components/common/CommonDropdown.vue';
import { User, CreditCard, Home, MapPin, Shield } from 'lucide-vue-next';

interface ConstituencyItem {
  id: number;
  province: string;
  districtNumber: number;
}

interface FormFields extends RegistrationDTO {
  electoralDistrict: string;
}

const authStore = useAuthStore();
const { isLoading } = storeToRefs(authStore);
const { showSuccess: showSuccessToast, showError } = useToast();
const showSuccessState = ref(false);

// Dropdown options
const provinceOptions: DropdownOption[] = provinces.map((p) => ({
  label: p.name_th,
  value: p.name_th,
}));

const districtOptions = ref<DropdownOption[]>([]);
const isLoadingDistricts = ref(false);

const fetchDistricts = async (province: string): Promise<void> => {
  if (!province) {
    districtOptions.value = [];
    return;
  }

  isLoadingDistricts.value = true;
  try {
    const res = await httpClient.get<{
      success: boolean;
      data: ConstituencyItem[];
    }>(API_ENDPOINTS.CONSTITUENCIES.BY_PROVINCE(province));
    if (res.data.length === 0) {
      districtOptions.value = [
        {
          label: 'ยังไม่มีเขตเลือกตั้ง',
          value: '__no_district__',
          disabled: true,
        },
      ];
    } else {
      districtOptions.value = res.data.map((c) => ({
        label: `เขต ${c.districtNumber}`,
        value: String(c.districtNumber),
      }));
    }
  } catch {
    districtOptions.value = [];
  } finally {
    isLoadingDistricts.value = false;
  }
};

// Define validation rules separately to avoid circular reference
const validationRules: Partial<Record<keyof FormFields, ValidationRule[]>> = {
  firstName: [(v: string) => validateRequired(v, 'ชื่อ').error],
  lastName: [(v: string) => validateRequired(v, 'นามสกุล').error],
  nationalId: [
    (v: string) => validateRequired(v, 'หมายเลขประจำตัว').error,
    (v: string) => validateCitizenId(v).error,
  ],
  laserCode: [(v: string) => validateRequired(v, 'เลขหลังบัตร').error],
  address: [(v: string) => validateRequired(v, 'ที่อยู่').error],
  province: [(v: string) => validateRequired(v, 'จังหวัด').error],
  electoralDistrict: [(v: string) => validateRequired(v, 'เขตเลือกตั้ง').error],
};

// Initialize form with useForm composable
const formState = useForm<FormFields>({
  initialValues: {
    nationalId: '',
    laserCode: '',
    firstName: '',
    lastName: '',
    address: '',
    province: '',
    districtNumber: 0,
    // UI-only fields
    electoralDistrict: '',
  },
  validationRules,
});

const {
  formData,
  errors,
  validateField,
  validateForm,
  resetForm: resetFormData,
} = formState;

// Track touched fields for showing errors only after user interaction
const touched = ref<Record<string, boolean>>({});

const touch = (field: string): void => {
  touched.value[field] = true;
  validateField(field as keyof FormFields);
};

// เมื่อเปลี่ยนจังหวัด ให้ reset เขตและดึงใหม่
watch(
  () => formData.value.province,
  (newProvince) => {
    formData.value.electoralDistrict = '';
    districtOptions.value = [];
    if (newProvince) {
      fetchDistricts(newProvince);
    }
  },
);

// Sync UI fields to DTO fields
const syncToDTO = (): void => {
  // Sync constituencyId จาก electoralDistrict (value คือ id ของ constituency จาก API)
  formData.value.districtNumber =
    parseInt(formData.value.electoralDistrict) || 0;
};

const onIdNumberInput = (): void => {
  // Strip non-numeric characters
  formData.value.nationalId = formData.value.nationalId.replace(/\D/g, '');
};

// Step completion based on filled fields
const isStep1Complete = computed(() => {
  return !!(
    formData.value.firstName &&
    formData.value.lastName &&
    formData.value.nationalId &&
    formData.value.laserCode
  );
});

const isStep2Complete = computed(() => {
  return (
    isStep1Complete.value &&
    !!(
      formData.value.address &&
      formData.value.province &&
      formData.value.electoralDistrict
    )
  );
});

const onSubmit = async (): Promise<void> => {
  // Touch all fields to show validation errors
  const allFields = [
    'firstName',
    'lastName',
    'nationalId',
    'laserCode',
    'address',
    'province',
    'electoralDistrict',
  ];
  allFields.forEach((f) => {
    touched.value[f] = true;
  });

  // Validate all fields
  if (!validateForm()) {
    return;
  }

  // Sync UI fields to DTO
  syncToDTO();

  // Create DTO for registration
  const registrationData: RegistrationDTO = {
    nationalId: formData.value.nationalId,
    laserCode: formData.value.laserCode,
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    address: formData.value.address,
    province: formData.value.province,
    districtNumber: formData.value.districtNumber,
  };

  // Call register from auth store with try-catch for error handling
  try {
    await authStore.register(registrationData);
    showSuccessToast('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ');
    showSuccessState.value = true;
  } catch (err: any) {
    showError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
  }
};

const resetForm = (): void => {
  resetFormData();
  touched.value = {};
  showSuccessState.value = false;
};

// Expose form for template
const form = formData;
</script>

<template>
  <div
    class="form-container delay-fade-in"
    :class="{ 'form-success-state': showSuccessState }"
  >
    <!-- Success Overlay -->
    <transition name="success-transition">
      <div v-if="showSuccessState" class="success-overlay">
        <div class="success-content">
          <div class="success-icon-ring">
            <svg class="success-checkmark" viewBox="0 0 52 52">
              <circle
                class="checkmark-circle"
                cx="26"
                cy="26"
                r="24"
                fill="none"
              />
              <path class="checkmark-check" fill="none" d="M14 27l7 7 16-16" />
            </svg>
          </div>
          <h3 class="success-title">ลงทะเบียนสำเร็จ!</h3>
          <p class="success-message">ข้อมูลของท่านถูกบันทึกเรียบร้อยแล้ว</p>
          <button class="btn-secondary" @click="resetForm">
            ลงทะเบียนใหม่
          </button>
        </div>
      </div>
    </transition>

    <!-- Form Content -->
    <template v-if="!showSuccessState">
      <div class="header-section">
        <div class="logo-badge">
          <span class="logo-icon">🗳️</span>
        </div>
        <h2 class="title">สมัครสร้างรายชื่อผู้ใช้งาน</h2>
        <p class="subtitle">
          กรอกหมายเลขประจำตัว 13 หลัก และข้อมูลส่วนตัวเพื่อลงทะเบียนเข้าใช้ระบบ
        </p>
      </div>

      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" :class="{ active: true, completed: isStep1Complete }">
          <div class="step-dot">1</div>
          <span class="step-label">ข้อมูลส่วนตัว</span>
        </div>
        <div class="step-line" :class="{ filled: isStep1Complete }"></div>
        <div
          class="step"
          :class="{ active: isStep1Complete, completed: isStep2Complete }"
        >
          <div class="step-dot">2</div>
          <span class="step-label">ที่อยู่</span>
        </div>
        <div class="step-line" :class="{ filled: isStep2Complete }"></div>
        <div class="step" :class="{ active: isStep2Complete }">
          <div class="step-dot">3</div>
          <span class="step-label">ยืนยัน</span>
        </div>
      </div>

      <form @submit.prevent="onSubmit" class="form-body" novalidate>
        <!-- Row 1: Name -->
        <div class="form-section">
          <div class="section-label">ข้อมูลส่วนตัว</div>
          <div class="form-row flex-row">
            <CommonInput
              id="reg-firstName"
              v-model="form.firstName"
              label="ชื่อ"
              placeholder="ชื่อจริง"
              :icon="User"
              :required="true"
              :error="errors.firstName"
              :touched="touched.firstName"
              @blur="touch('firstName')"
            />
            <CommonInput
              id="reg-lastName"
              v-model="form.lastName"
              label="นามสกุล"
              placeholder="นามสกุล"
              :icon="User"
              :required="true"
              :error="errors.lastName"
              :touched="touched.lastName"
              @blur="touch('lastName')"
            />
          </div>
        </div>

        <!-- Row 2: ID -->
        <div class="form-row flex-row">
          <CommonInput
            id="reg-idNumber"
            v-model="form.nationalId"
            label="หมายเลขประจำตัว 13 หลัก"
            placeholder="X-XXXX-XXXXX-XX-X"
            :icon="CreditCard"
            :required="true"
            :maxlength="13"
            :show-char-count="true"
            :error="errors.nationalId"
            :touched="touched.nationalId"
            @blur="touch('nationalId')"
            @input="onIdNumberInput"
          />
          <CommonInput
            id="reg-backCard"
            v-model="form.laserCode"
            label="เลขหลังบัตร"
            placeholder="เลขหลังบัตรประชาชน"
            :icon="CreditCard"
            :required="true"
            :error="errors.laserCode"
            :touched="touched.laserCode"
            @blur="touch('laserCode')"
          />
        </div>

        <!-- Row 3: Address -->
        <div class="form-section">
          <div class="section-label">ที่อยู่ตามทะเบียนบ้าน</div>
          <div class="form-row">
            <CommonInput
              id="reg-address"
              v-model="form.address"
              label="ที่อยู่"
              placeholder="บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต"
              :icon="Home"
              :required="true"
              :error="errors.address"
              :touched="touched.address"
              @blur="touch('address')"
            />
          </div>
        </div>

        <!-- Row 4: Province & District -->
        <div class="form-row flex-row">
          <CommonDropdown
            id="reg-province"
            v-model="form.province"
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            :icon="MapPin"
            :required="true"
            :options="provinceOptions"
            :error="errors.province"
            :touched="touched.province"
            @blur="touch('province')"
            @change="touch('province')"
          />
          <CommonDropdown
            id="reg-district"
            v-model="form.electoralDistrict"
            label="เขตการเลือกตั้ง"
            :placeholder="
              isLoadingDistricts
                ? 'กำลังโหลด...'
                : !form.province
                  ? 'เลือกจังหวัดก่อน'
                  : 'เลือกเขตเลือกตั้ง'
            "
            :icon="Shield"
            :required="true"
            :options="districtOptions"
            :disabled="!form.province || isLoadingDistricts"
            :error="errors.electoralDistrict"
            :touched="touched.electoralDistrict"
            @blur="touch('electoralDistrict')"
            @change="touch('electoralDistrict')"
          />
        </div>

        <!-- Submit Button with Loading State -->
        <div class="form-actions">
          <button
            type="submit"
            class="submit-btn"
            :disabled="isLoading"
            :class="{ 'btn-loading': isLoading }"
          >
            <span v-if="isLoading" class="btn-spinner"></span>
            <span v-if="isLoading">กำลังดำเนินการ...</span>
            <span v-else class="btn-content">
              <span>สมัครใช้งาน</span>
              <svg
                class="btn-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </span>
          </button>
        </div>

        <p class="terms-text">
          การสมัครใช้งานแสดงว่าท่านยอมรับ
          <a href="#">ข้อกำหนดและเงื่อนไข</a> ของระบบ
        </p>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">หรือ</span>
          <span class="divider-line"></span>
        </div>

        <!-- Login Link -->
        <div class="login-section">
          <p class="login-text">มีบัญชีอยู่แล้ว?</p>
          <router-link to="/login" class="login-btn">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="login-icon"
            >
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
              <polyline points="10,17 15,12 10,7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>เข้าสู่ระบบ</span>
          </router-link>
        </div>
      </form>
    </template>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 620px;
  width: 100%;
  padding: 2.5rem;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition:
    transform var(--transition-slow),
    box-shadow var(--transition-slow);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #8b7cf7, #c084fc);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.form-container:hover {
  box-shadow: var(--shadow-lg);
}

.delay-fade-in {
  animation: fadeIn 0.6s ease-out 0.2s both;
}

/* === Header === */
.header-section {
  margin-bottom: 2rem;
  text-align: center;
}

.logo-badge {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  animation: fadeInScale 0.5s 0.4s ease both;
}

.title {
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.4rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* === Step Indicator === */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border-input);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.step.active .step-dot {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.step.completed .step-dot {
  border-color: var(--success);
  background: var(--success);
  color: white;
}

.step-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
  transition: color var(--transition-normal);
}

.step.active .step-label {
  color: var(--text-secondary);
}

.step.completed .step-label {
  color: var(--success);
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--border-input);
  margin: 0 0.5rem;
  border-radius: 999px;
  transition: background var(--transition-normal);
  flex-shrink: 0;
}

.step-line.filled {
  background: var(--success);
}

/* === Form Section === */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-row {
  flex-direction: row;
}

@media (max-width: 600px) {
  .flex-row {
    flex-direction: column;
  }

  .step-label {
    display: none;
  }
}

.flex-1 {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.required {
  color: var(--error);
  font-weight: 600;
}

/* === Input Wrapper with Icon === */
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  color: var(--text-muted);
  pointer-events: none;
  transition: color var(--transition-fast);
  z-index: 1;
}

.input-wrapper input {
  padding-left: 2.6rem;
}

.input-wrapper input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: var(--primary);
}

input,
select {
  width: 100%;
  padding: 0.72rem 1rem;
  font-family: var(--font-family);
  font-size: 0.88rem;
  color: var(--text-main);
  background-color: var(--bg-input);
  border: 1.5px solid var(--border-input);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-fast);
}

input::placeholder {
  color: #b8bcc4;
}

input:hover,
select:hover {
  border-color: #aeb4c0;
}

input:focus,
select:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3.5px var(--primary-glow);
}

.input-error {
  border-color: var(--border-error) !important;
  background-color: var(--error-bg) !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3.5px rgba(239, 68, 68, 0.15) !important;
}

/* Input meta row (error + char count) */
.input-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 1.2rem;
}

.char-count {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-left: auto;
  transition: color var(--transition-fast);
}

.char-count-full {
  color: var(--success);
  font-weight: 600;
}

/* === Error Messages === */
.error-text {
  font-size: 0.76rem;
  color: var(--error);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.error-text::before {
  content: '⚠';
  font-size: 0.7rem;
}

.error-msg-enter-active {
  animation: slideUp 0.25s ease-out forwards;
}

.error-msg-leave-active {
  animation: fadeOut 0.15s ease-in forwards;
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === Submit Button === */
.form-actions {
  margin-top: 0.75rem;
}

.submit-btn {
  width: 100%;
  padding: 0.9rem;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 0.95rem;
  color: white;
  background: linear-gradient(135deg, var(--primary), #7c6cf0);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.submit-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.submit-btn:hover:not(:disabled)::after {
  transform: translateX(100%);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover), #6b5ce0);
  box-shadow: 0 4px 16px rgba(89, 71, 236, 0.35);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(89, 71, 236, 0.25);
}

.submit-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-arrow {
  width: 18px;
  height: 18px;
  transition: transform var(--transition-fast);
}

.submit-btn:hover:not(:disabled) .btn-arrow {
  transform: translateX(3px);
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* === Terms === */
.terms-text {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 1rem;
  line-height: 1.5;
}

.terms-text a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.terms-text a:hover {
  text-decoration: underline;
}

/* === Success State === */
.success-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 380px;
  text-align: center;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.success-icon-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--success-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInScale 0.5s ease both;
}

.success-checkmark {
  width: 44px;
  height: 44px;
}

.checkmark-circle {
  stroke: var(--success);
  stroke-width: 2;
  stroke-dasharray: 151;
  stroke-dashoffset: 151;
  animation: checkmarkCircle 0.6s ease-out 0.2s forwards;
}

@keyframes checkmarkCircle {
  to {
    stroke-dashoffset: 0;
  }
}

.checkmark-check {
  stroke: var(--success);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: checkmark 0.4s ease-out 0.7s forwards;
}

@keyframes checkmark {
  to {
    stroke-dashoffset: 0;
  }
}

.success-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
  animation: fadeIn 0.4s ease 0.3s both;
}

.success-message {
  font-size: 0.9rem;
  color: var(--text-muted);
  animation: fadeIn 0.4s ease 0.5s both;
}

.btn-secondary {
  margin-top: 0.5rem;
  padding: 0.7rem 2rem;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--primary);
  background: var(--primary-light);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  animation: fadeIn 0.4s ease 0.7s both;
}

.btn-secondary:hover {
  background: transparent;
  border-color: var(--primary);
}

/* === Transition === */
.success-transition-enter-active {
  animation: fadeInScale 0.5s ease both;
}

.success-transition-leave-active {
  animation: fadeOut 0.3s ease both;
}

/* === Divider === */
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.25rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border-input);
}

.divider-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* === Login Section === */
.login-section {
  text-align: center;
}

.login-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.78rem;
  font-family: var(--font-family);
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--primary);
  background: var(--primary-light);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.login-btn:hover {
  background: transparent;
  border-color: var(--primary);
  transform: translateY(-1px);
}

.login-icon {
  width: 17px;
  height: 17px;
}
</style>
