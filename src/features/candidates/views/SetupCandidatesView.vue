<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useCandidateStore, useUserStore, useElectionStore } from '@/stores';
import { useToast } from '@/composables/useToast';
import type { DropdownOption } from '@/components/common/CommonDropdown.vue';
import type { User } from '@/types/models/user.model';

import CommonSwitch from '@/components/common/CommonSwitch.vue';
import CommonModal from '@/components/common/CommonModal.vue';
import CommonInput from '@/components/common/CommonInput.vue';
import CommonDropdown from '@/components/common/CommonDropdown.vue';

// Stores
const candidateStore = useCandidateStore();
const electionStore = useElectionStore();
const userStore = useUserStore();
const { showSuccess, showError } = useToast();

const { users } = storeToRefs(userStore);
const { partyOverview } = storeToRefs(electionStore);

// Party options for CommonDropdown (จาก electionStore.partyOverview)
const partyOptions = computed<DropdownOption[]>(() =>
  partyOverview.value.map((p) => ({ label: p.name, value: p.id })),
);

// Local state
const selectedProvince = ref('');
const searchQuery = ref('');
const isLoading = ref(false);

// Form state per user
interface CandidateForm {
  isCandidate: boolean;
  partyId: number | '';
  policy: string;
  candidateNumber: number | '';
}

const candidateForms = reactive<Record<number, CandidateForm>>({});

function initializeForms() {
  users.value.forEach((user) => {
    const profile = user.candidateProfile;
    candidateForms[user.id] = {
      isCandidate: !!profile,
      partyId: profile?.partyId ?? '',
      policy: profile?.policy ?? '',
      candidateNumber: profile?.candidateNumber ?? '',
    };
  });
}

watch(
  users,
  () => {
    initializeForms();
  },
  { immediate: true },
);

const provinces = computed(() => {
  const set = new Set<string>();
  users.value.forEach((u) => {
    if (u.constituency?.province) set.add(u.constituency.province);
  });
  return [...set].sort((a, b) => a.localeCompare(b, 'th'));
});

const provinceOptions = computed<DropdownOption[]>(() => [
  { label: 'ทุกจังหวัด', value: '' },
  ...provinces.value.map((p) => ({ label: p, value: p })),
]);

// Filtered list
const filteredUsers = computed(() => {
  let filtered = users.value;
  if (selectedProvince.value) {
    filtered = filtered.filter(
      (u) => u.constituency?.province === selectedProvince.value,
    );
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim();
    filtered = filtered.filter((u) => u.nationalId.includes(q));
  }
  return filtered;
});

function handlePartyChange(userId: number, value: string | number) {
  candidateForms[userId].partyId = Number(value) || '';
}

function getConstituencyLabel(user: User): string {
  if (!user.constituency) return 'ไม่ระบุ';
  return `${user.constituency.province} / เขต ${user.constituency.districtNumber}`;
}

// Determine if candidateProfile already exists → registered candidate
function isRegistered(user: User): boolean {
  return !!user.candidateProfile;
}

// Actions
async function handleSubmit(user: User) {
  const form = candidateForms[user.id];

  if (!form.partyId) {
    showError('กรุณาเลือกพรรคการเมือง');
    return;
  }
  if (!form.candidateNumber) {
    showError('กรุณาระบุหมายเลขผู้สมัคร');
    return;
  }

  try {
    const existingProfile = user.candidateProfile;

    if (existingProfile) {
      const candidateId = existingProfile.id;
      await candidateStore.updateCandidate(candidateId, {
        partyId: form.partyId as number,
        candidateNumber: form.candidateNumber as number,
        firstName: user.firstName,
        lastName: user.lastName,
        policy: form.policy,
      });
      showSuccess('อัปเดตข้อมูลผู้สมัครสำเร็จ');
    } else {
      await candidateStore.addCandidate({
        userId: user.id,
        partyId: form.partyId as number,
        constituencyId: user.constituencyId!,
        candidateNumber: form.candidateNumber as number,
        title: user.title ?? undefined,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl ?? undefined,
        policy: form.policy,
      });
      showSuccess('ลงสมัครรับเลือกตั้งสำเร็จ');
    }

    await userStore.fetchUsers();
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการลงสมัคร');
  }
}

const showDeleteModal = ref(false);
const pendingDeleteUser = ref<User | null>(null);

function handleToggleCandidate(user: User, newValue: boolean) {
  if (!newValue && isRegistered(user)) {
    pendingDeleteUser.value = user;
    showDeleteModal.value = true;
    return;
  }
  candidateForms[user.id].isCandidate = newValue;
}

const deleteCandidate = async (user: User) => {
  const profile = user.candidateProfile;
  if (!profile) return;
  try {
    await candidateStore.deleteCandidate(profile.id);
    showSuccess('ยกเลิกการลงสมัครสำเร็จ');
    await userStore.fetchUsers();
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการยกเลิกการลงสมัคร');
  }
};

async function confirmDeleteCandidate() {
  if (!pendingDeleteUser.value) return;
  const user = pendingDeleteUser.value;
  showDeleteModal.value = false;
  pendingDeleteUser.value = null;
  await deleteCandidate(user);
}

function cancelDeleteCandidate() {
  if (pendingDeleteUser.value) {
    // คืนค่า toggle กลับ true เพราะผู้ใช้กด ยกเลิก
    candidateForms[pendingDeleteUser.value.id].isCandidate = true;
  }
  showDeleteModal.value = false;
  pendingDeleteUser.value = null;
}

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      userStore.fetchUsers(),
      electionStore.fetchPartyOverview(),
    ]);
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
  <div class="card">
    <div class="header">
      <h2 class="title">รายชื่อผู้มีสิทธิ์เลือกตั้ง และตั้งค่าลงสมัคร</h2>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="dropdowns">
        <CommonDropdown
          v-model="selectedProvince"
          :options="provinceOptions"
          style="min-width: 180px"
        />
      </div>

      <div class="search-box">
        <svg
          class="icon-search"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาด้วยเลขประจำตัวประชาชน 13 หลัก"
          class="search-input"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredUsers.length === 0" class="empty">
      ไม่พบข้อมูลผู้ใช้
    </div>

    <div v-else class="candidates-list">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="candidate-row"
        :class="{ 'row-registered': isRegistered(user) }"
      >
        <!-- Profile -->
        <div class="candidate-profile">
          <div class="avatar-wrap">
            <img
              v-if="user.imageUrl"
              :src="user.imageUrl"
              :alt="`${user.firstName} ${user.lastName}`"
              class="avatar-img"
            />
            <div v-else class="avatar-initials">
              {{ user.firstName?.charAt(0) ?? '?' }}
            </div>
          </div>
          <div>
            <div class="candidate-name">
              {{ user.title }} {{ user.firstName }} {{ user.lastName }}
            </div>
            <div class="candidate-id">เลขประจำตัว {{ user.nationalId }}</div>
          </div>
        </div>

        <!-- Constituency + Toggle -->
        <div class="candidate-status">
          <div class="status-zone">{{ getConstituencyLabel(user) }}</div>
          <div class="toggle-container">
            <span class="toggle-label">ลงสมัครรับเลือกตั้ง</span>
            <!-- ใช้ CommonSwitch — intercept เมื่อปิด toggle และมี candidateProfile อยู่แล้ว -->
            <CommonSwitch
              :modelValue="candidateForms[user.id].isCandidate"
              @update:modelValue="(v) => handleToggleCandidate(user, v)"
            />
          </div>
        </div>

        <!-- Form fields -->
        <div class="candidate-form !items-start">
          <!-- สังกัดพรรค -->
          <div class="flex-1">
            <CommonDropdown
              v-model="candidateForms[user.id].partyId"
              label="สังกัดพรรค"
              placeholder="เลือกพรรค"
              :options="partyOptions"
              :disabled="!candidateForms[user.id].isCandidate"
              @change="(v) => handlePartyChange(user.id, v)"
            />
          </div>

          <!-- นโยบาย -->
          <div class="flex-2">
            <CommonInput
              v-model="candidateForms[user.id].policy"
              label="นโยบายผู้สมัคร"
              placeholder="นโยบาย..."
              :disabled="!candidateForms[user.id].isCandidate"
            />
          </div>

          <!-- หมายเลขผู้สมัคร -->
          <div class="form-group-number">
            <CommonInput
              v-model="candidateForms[user.id].candidateNumber"
              label="หมายเลขผู้สมัคร"
              type="number"
              placeholder="0"
              :disabled="!candidateForms[user.id].isCandidate"
            />
          </div>

          <!-- ปุ่มลงสมัคร -->
        </div>
        <div class="form-actions">
          <button
            class="btn"
            :class="
              candidateForms[user.id].isCandidate
                ? 'btn-primary'
                : 'btn-disabled'
            "
            :disabled="
              !candidateForms[user.id].isCandidate || candidateStore.isLoading
            "
            @click="handleSubmit(user)"
          >
            ลงสมัคร
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm Delete Modal (outside .card, uses Teleport internally) -->
  <CommonModal
    v-model="showDeleteModal"
    title="ยืนยันการยกเลิกการลงสมัคร"
    size="small"
    confirmText="ยืนยัน"
    cancelText="ยกเลิก"
    :confirmLoading="candidateStore.isLoading"
    @confirm="confirmDeleteCandidate"
    @cancel="cancelDeleteCandidate"
  >
    <template #footer>
      <button
        class="modal-btn modal-btn-cancel"
        :disabled="candidateStore.isLoading"
        @click="cancelDeleteCandidate"
      >
        ยกเลิก
      </button>
      <button
        class="modal-btn modal-btn-danger"
        :disabled="candidateStore.isLoading"
        @click="confirmDeleteCandidate"
      >
        {{ candidateStore.isLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน' }}
      </button>
    </template>
  </CommonModal>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
  overflow: hidden;
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-main);
}

/* Filters */
.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.dropdowns {
  display: flex;
  gap: 1rem;
}

.search-box {
  position: relative;
  width: 350px;
  max-width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid var(--border-input);
  border-radius: var(--radius-md);
  outline: none;
}

.icon-search {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-muted);
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: var(--text-muted);
  gap: 1rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-input);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* List */
.candidates-list {
  display: flex;
  flex-direction: column;
}

.candidate-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.15s;
}

.candidate-row:last-child {
  border-bottom: none;
}

/* Avatar */
.candidate-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
  max-width: 270px;
  flex: 1 1 200px;
}

.avatar-wrap {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  display: block;
}

.avatar-initials {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary, #5947ec), #8b7cf8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
}

.candidate-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.candidate-id {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
  font-family: monospace;
  letter-spacing: 0.02em;
}

/* Status + toggle */
.candidate-status {
  min-width: 180px;
  flex: 0 1 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-zone {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-main);
}

/* Candidate form */
.candidate-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  flex: 1 1 300px;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-main);
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-input);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
}

.input:disabled {
  background-color: #f4f5f9;
  color: #a0aec0;
  border-color: #e2e8f0;
}

.flex-1 {
  flex: 1 1 120px;
  min-width: 0;
}
.flex-2 {
  flex: 2 1 180px;
  min-width: 0;
}

.form-group-number {
  flex: 0 1 100px;
  min-width: 80px;
}

.form-actions {
  margin-bottom: 1px;
}

/* Modal buttons */
.modal-btn {
  padding: 9px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn-cancel {
  background-color: #e5e7eb;
  color: var(--text-secondary);
}

.modal-btn-cancel:hover:not(:disabled) {
  background-color: #d1d5db;
}

.modal-btn-danger {
  background-color: #5947ec;
  color: white;
}

.modal-btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-disabled {
  background-color: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
}

/* ===== Responsive ===== */

/* Tablet: ≤ 1024px */
@media (max-width: 1024px) {
  .card {
    padding: 1.25rem;
  }

  .candidate-row {
    gap: 1rem;
  }

  .candidate-profile {
    flex: 1 1 180px;
    max-width: none;
  }

  .candidate-status {
    flex: 0 1 180px;
  }

  .candidate-form {
    flex: 1 1 100%;
  }
}

/* Mobile: ≤ 640px */
@media (max-width: 640px) {
  .card {
    padding: 1rem;
  }

  .title {
    font-size: 1.05rem;
  }

  .filters {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .select-input {
    width: 100%;
    min-width: unset;
  }

  .candidate-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 0.25rem;
  }

  .candidate-profile {
    width: 100%;
    max-width: none;
    flex: unset;
  }

  .candidate-status {
    width: 100%;
    flex: unset;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .candidate-form {
    width: 100%;
    flex: unset;
    flex-direction: column;
    align-items: stretch;
  }

  .flex-1,
  .flex-2 {
    flex: unset;
    width: 100%;
  }

  .form-group-number {
    max-width: none;
    width: 100%;
  }

  .form-actions {
    width: 100%;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
