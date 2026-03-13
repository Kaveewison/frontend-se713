<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores';
import { useToast } from '@/composables/useToast';
import { validateCitizenId, validateRequired } from '@/utils/validators';

// Composables
const router = useRouter();
const authStore = useAuthStore();
const { isLoading } = storeToRefs(authStore);
const { showSuccess: showSuccessToast, showError } = useToast();

// Form state
interface LoginForm {
  idNumber: string;
  laserCode: string;
}

const form = ref<LoginForm>({
  idNumber: '',
  laserCode: '',
});

// UI state
const showSuccessState = ref(false);
const showPassword = ref(false);
const rememberMe = ref(false);

// Validation state
interface ValidationErrors {
  idNumber?: string;
  laserCode?: string;
}

const errors = ref<ValidationErrors>({});
const touched = ref<Record<string, boolean>>({});

// Validation functions
const validateForm = (): ValidationErrors => {
  const validationErrors: ValidationErrors = {};

  // Validate ID number
  const idValidation = validateCitizenId(form.value.idNumber);
  if (!idValidation.isValid) {
    validationErrors.idNumber = idValidation.error || 'หมายเลขประจำตัวไม่ถูกต้อง';
  }

  // Validate laser code
  const laserCodeValidation = validateRequired(form.value.laserCode, 'Laser Code');
  if (!laserCodeValidation.isValid) {
    validationErrors.laserCode = laserCodeValidation.error || 'กรุณากรอก Laser Code';
  }

  return validationErrors;
};


const touch = (field: string) => {
  touched.value[field] = true;
  const currentErrors = validateForm();

  if ((currentErrors as Record<string, string>)[field]) {
    (errors.value as Record<string, string>)[field] = (currentErrors as Record<string, string>)[field];
  } else {
    delete (errors.value as Record<string, string>)[field];
  }
};

const onIdNumberInput = () => {
  form.value.idNumber = form.value.idNumber.replace(/\D/g, '');
};

const onSubmit = async () => {
  // Touch all fields
  touched.value = { idNumber: true, laserCode: true };

  console.log('log in')

  // Validate
  const validationErrors = validateForm();
  errors.value = validationErrors;

  console.log('errors : ', errors.value)

  if (Object.keys(validationErrors).length > 0) {
    return;
  }

  // Call login from auth store with try-catch for error handling
  try {
    await authStore.login({
      nationalId: form.value.idNumber,
      laserCode: form.value.laserCode,
    });

    showSuccessToast('เข้าสู่ระบบสำเร็จ');
    showSuccessState.value = true;

    // Redirect after short delay for success animation
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (err: any) {
    showError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
  }
};

// Live validation
watch(form, () => {
  const currentErrors = validateForm();
  const filteredErrors: ValidationErrors = {};

  for (const key of Object.keys(touched.value)) {
    if (touched.value[key] && (currentErrors as Record<string, string>)[key]) {
      (filteredErrors as Record<string, string>)[key] = (currentErrors as Record<string, string>)[key];
    }
  }

  errors.value = filteredErrors;
}, { deep: true });

</script>

<template>
  <div class="login-card delay-fade-in">

    <!-- Success Overlay -->
    <transition name="success-transition">
      <div v-if="showSuccessState" class="success-overlay">
        <div class="success-content">
          <div class="success-icon-ring">
            <svg class="success-checkmark" viewBox="0 0 52 52">
              <circle class="checkmark-circle" cx="26" cy="26" r="24" fill="none" />
              <path class="checkmark-check" fill="none" d="M14 27l7 7 16-16" />
            </svg>
          </div>
          <h3 class="success-title">เข้าสู่ระบบสำเร็จ!</h3>
          <p class="success-message">กำลังเปลี่ยนหน้า...</p>
        </div>
      </div>
    </transition>

    <!-- Login Form -->
    <template v-if="!showSuccessState">
      <!-- Header -->
      <div class="header-section">
        <div class="logo-badge">
          <svg viewBox="0 0 24 24" fill="none" class="logo-svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(89,71,236,0.2)" stroke="#5947ec" stroke-width="1.5" />
            <path d="M2 17l10 5 10-5" stroke="#5947ec" stroke-width="1.5" stroke-linecap="round" />
            <path d="M2 12l10 5 10-5" stroke="#5947ec" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <h2 class="title">เข้าสู่ระบบ</h2>
        <p class="subtitle">ใช้หมายเลขประจำตัว 13 หลัก และ Laser Code เพื่อเข้าใช้งาน</p>
      </div>

      <form @submit.prevent="onSubmit" class="form-body" novalidate>
        <!-- ID Number Field -->
        <div class="form-group" :class="{ 'has-error': touched.idNumber && errors.idNumber }">
          <label for="login-idNumber">หมายเลขประจำตัว 13 หลัก</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="7" y1="8" x2="17" y2="8" />
              <line x1="7" y1="12" x2="13" y2="12" />
            </svg>
            <input id="login-idNumber" type="text" v-model="form.idNumber" maxlength="13"
              placeholder="X-XXXX-XXXXX-XX-X" autocomplete="username" @blur="touch('idNumber')" @input="onIdNumberInput"
              :class="{ 'input-error': touched.idNumber && errors.idNumber }" />
          </div>
          <div class="input-meta">
            <transition name="error-msg">
              <span v-if="touched.idNumber && errors.idNumber" class="error-text">{{ errors.idNumber }}</span>
            </transition>
            <span class="char-count" :class="{ 'char-count-full': form.idNumber.length === 13 }">{{ form.idNumber.length
              }}/13</span>
          </div>
        </div>

        <!-- Laser Code Field -->
        <div class="form-group" :class="{ 'has-error': touched.laserCode && errors.laserCode }">
          <label for="login-laserCode">Laser Code</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input id="login-laserCode" :type="showPassword ? 'text' : 'password'" v-model="form.laserCode"
              placeholder="JT1234567890" autocomplete="off" @blur="touch('laserCode')"
              :class="{ 'input-error': touched.laserCode && errors.laserCode }" />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword" tabindex="-1">
              <!-- Eye Open -->
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                class="eye-icon">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <!-- Eye Closed -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-icon">
                <path
                  d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <transition name="error-msg">
            <span v-if="touched.laserCode && errors.laserCode" class="error-text">{{ errors.laserCode }}</span>
          </transition>
        </div>

        <!-- Remember & Forgot -->
        <div class="form-extras">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="rememberMe" />
            <span class="custom-checkbox">
              <svg viewBox="0 0 12 12" fill="none" class="check-svg">
                <polyline points="2,6 5,9 10,3" stroke="white" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
            <span class="checkbox-label">จดจำการเข้าสู่ระบบ</span>
          </label>
          <a href="#" class="forgot-link">ลืมรหัสผ่าน?</a>
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isLoading" :class="{ 'btn-loading': isLoading }">
            <span v-if="isLoading" class="btn-spinner"></span>
            <span v-if="isLoading">กำลังตรวจสอบ...</span>
            <span v-else class="btn-content">
              <span>เข้าสู่ระบบ</span>
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </span>
          </button>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-text">หรือ</span>
          <span class="divider-line"></span>
        </div>

        <!-- Register Link -->
        <div class="register-section">
          <p class="register-text">ยังไม่มีบัญชีผู้ใช้?</p>
          <router-link to="/register" class="register-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="register-icon">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>สมัครสร้างบัญชีใหม่</span>
          </router-link>
        </div>
      </form>
    </template>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 440px;
  width: 100%;
  padding: 2.75rem 2.5rem;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #8b7cf7, #c084fc);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.login-card:hover {
  box-shadow: var(--shadow-lg);
}

.delay-fade-in {
  animation: fadeIn 0.6s ease-out 0.15s both;
}

/* === Header === */
.header-section {
  margin-bottom: 2rem;
  text-align: center;
}

.logo-badge {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.1rem;
  animation: fadeInScale 0.5s 0.3s ease both;
}

.logo-svg {
  width: 28px;
  height: 28px;
}

.title {
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.4rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.55;
}

/* === Form === */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
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

/* === Input Wrapper === */
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

.input-wrapper:focus-within .input-icon {
  color: var(--primary);
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 0.78rem 1rem 0.78rem 2.65rem;
  font-family: var(--font-family);
  font-size: 0.9rem;
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

input:hover {
  border-color: #aeb4c0;
}

input:focus {
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

/* === Password Toggle === */
.password-toggle {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.password-toggle:hover {
  background: rgba(0, 0, 0, 0.04);
}

.eye-icon {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.password-toggle:hover .eye-icon {
  color: var(--text-secondary);
}

/* === Input Meta === */
.input-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 1.1rem;
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

/* === Error === */
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
  animation: slideUpSmall 0.25s ease-out forwards;
}

.error-msg-leave-active {
  animation: fadeOutSmall 0.15s ease-in forwards;
}

@keyframes slideUpSmall {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutSmall {
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

/* === Extras Row === */
.form-extras {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Custom Checkbox */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--border-input);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.check-svg {
  width: 12px;
  height: 12px;
  opacity: 0;
  transform: scale(0.5);
  transition: all var(--transition-fast);
}

.checkbox-wrapper input[type="checkbox"]:checked+.custom-checkbox {
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox-wrapper input[type="checkbox"]:checked+.custom-checkbox .check-svg {
  opacity: 1;
  transform: scale(1);
}

.checkbox-label {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.forgot-link {
  font-size: 0.82rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.forgot-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* === Submit Button === */
.form-actions {
  margin-top: 0.25rem;
}

.submit-btn {
  width: 100%;
  padding: 0.88rem;
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
  background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
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
  transform: translateY(0);
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
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

/* === Register Section === */
.register-section {
  text-align: center;
}

.register-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.register-btn {
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

.register-btn:hover {
  background: transparent;
  border-color: var(--primary);
  transform: translateY(-1px);
}

.register-icon {
  width: 17px;
  height: 17px;
}

/* === Success State === */
.success-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 340px;
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
  animation: drawCircle 0.6s ease-out 0.2s forwards;
}

@keyframes drawCircle {
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
  animation: drawCheck 0.4s ease-out 0.7s forwards;
}

@keyframes drawCheck {
  to {
    stroke-dashoffset: 0;
  }
}

.success-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
  animation: fadeIn 0.4s ease 0.3s both;
}

.success-message {
  font-size: 0.88rem;
  color: var(--text-muted);
  animation: fadeIn 0.4s ease 0.5s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.85);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Transitions */
.success-transition-enter-active {
  animation: fadeInScale 0.5s ease both;
}

.success-transition-leave-active {
  animation: fadeOutAnim 0.3s ease both;
}

@keyframes fadeOutAnim {
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
