<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useParty } from '@/features/parties/composables/useParty';

const route = useRoute();
const partyId = computed(() => Number(route.params.id) || 1);

// Use party composable
const {
  partyMembers,
  fetchPartyById,
  addMember: addPartyMember,
  removeMember: removePartyMember,
} = useParty();

const showAddModal = ref(false);
const newMember = ref({
  id: '',
  firstName: '',
  lastName: '',
  role: 'สมาชิก',
});

const isFormValid = computed(() => {
  return (
    newMember.value.id.length === 13 &&
    newMember.value.firstName &&
    newMember.value.lastName
  );
});

// Fetch party and members on mount
onMounted(async () => {
  await fetchPartyById(partyId.value);
});

const addMember = async () => {
  if (isFormValid.value) {
    // In a real implementation, we would need to find or create the user first
    // For now, we'll use a mock user ID (this should be replaced with actual user lookup)
    const mockUserId = Date.now(); // Temporary mock ID

    const success = await addPartyMember(partyId.value, mockUserId);

    if (success) {
      // Reset form
      newMember.value = { id: '', firstName: '', lastName: '', role: 'สมาชิก' };
      showAddModal.value = false;
    }
  }
};

const removeMember = async (userId: number) => {
  if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายชื่อนี้?')) {
    await removePartyMember(partyId.value, userId);
  }
};
</script>

<template>
  <div class="card">
    <div class="header-banner">
      <div class="back-link" @click="$router.push('/parties')">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          class="back-icon"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>กลับไปรายชื่อพรรค</span>
      </div>

      <div class="party-info">
        <h2 class="title">
          รายชื่อสมาชิกพรรค:
          <span class="text-primary"
            >พรรคทดสอบประชาธิปไตย ที่ {{ partyId }}</span
          >
        </h2>
        <p class="subtitle">จัดการเพิ่ม หรือลบรายชื่อสมาชิกภายในพรรค</p>
      </div>
    </div>

    <div class="actions-bar">
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
          type="text"
          placeholder="ค้นหาด้วยเลขประจำตัว 13 หลัก หรือ ชื่อ"
          class="search-input"
        />
      </div>

      <button class="btn btn-primary btn-add" @click="showAddModal = true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          class="btn-icon"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        เพิ่มรายชื่อสมาชิก
      </button>
    </div>

    <!-- Members Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th width="80">ลำดับ</th>
            <th>ชื่อ-นามสกุล</th>
            <th>เลขประจำตัวประชาชน</th>
            <th>ตำแหน่ง</th>
            <th width="120">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(member, index) in partyMembers" :key="member.id">
            <td data-label="ลำดับ" class="index-col">{{ index + 1 }}</td>
            <td data-label="ชื่อ-นามสกุล">
              <div class="member-info">
                <img
                  :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name.replace(' ', '')}`"
                  alt="avatar"
                  class="member-avatar"
                />
                <span>{{ member.name }}</span>
              </div>
            </td>
            <td data-label="เลขประจำตัว" class="text-muted">
              {{ member.citizenId }}
            </td>
            <td data-label="ตำแหน่ง">
              <span
                class="role-badge"
                :class="member.role === 'EC' ? 'role-leader' : 'role-member'"
              >
                {{ member.role === 'EC' ? 'กรรมการบริหารพรรค' : 'สมาชิก' }}
              </span>
            </td>
            <td class="actions">
              <button
                class="btn-icon-only text-error"
                @click="removeMember(member.id)"
                title="ลบรายชื่อ"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </button>
            </td>
          </tr>

          <tr v-if="partyMembers.length === 0">
            <td colspan="5" class="empty-state">ไม่มีรายชื่อสมาชิกในระบบ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>เพิ่มรายชื่อสมาชิกพรรค</h3>
          <button class="close-btn" @click="showAddModal = false">×</button>
        </div>

        <div class="modal-body form-body">
          <div class="form-group">
            <label
              >เลขประจำตัวประชาชน (ดึงข้อมูล)
              <span class="required">*</span></label
            >
            <input
              type="text"
              v-model="newMember.id"
              class="input"
              placeholder="13 หลัก"
              maxlength="13"
            />
          </div>
          <div class="form-group flex-row">
            <div class="flex-1">
              <label>ชื่อ <span class="required">*</span></label>
              <input
                type="text"
                v-model="newMember.firstName"
                class="input"
                placeholder="ชื่อจริง"
              />
            </div>
            <div class="flex-1">
              <label>นามสกุล <span class="required">*</span></label>
              <input
                type="text"
                v-model="newMember.lastName"
                class="input"
                placeholder="นามสกุล"
              />
            </div>
          </div>
          <div class="form-group">
            <label>ตำแหน่ง <span class="required">*</span></label>
            <select v-model="newMember.role" class="input">
              <option value="สมาชิก">สมาชิก</option>
              <option value="กรรมการบริหารพรรค">กรรมการบริหารพรรค</option>
              <option value="หัวหน้าพรรค">หัวหน้าพรรค</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showAddModal = false">
            ยกเลิก
          </button>
          <button
            class="btn btn-primary"
            @click="addMember"
            :disabled="!isFormValid"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 2.5rem;
  overflow: hidden;
  position: relative;
}

.header-banner {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 4px 12px 4px 0;
  transition: all 0.2s;
}

.back-link:hover {
  opacity: 0.8;
}

.back-icon {
  width: 16px;
  height: 16px;
}

.party-info {
  margin-top: 0.5rem;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.text-primary {
  color: var(--primary);
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  width: 380px;
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

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-primary:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

/* Table */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
  vertical-align: middle;
}

.data-table th {
  color: var(--text-main);
  font-weight: 600;
  white-space: nowrap;
  background-color: #f8fafc;
}

.data-table td {
  color: var(--text-secondary);
}

.index-col {
  font-weight: 500;
  color: var(--text-main);
  text-align: center !important;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: var(--text-main);
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f1f2f6;
}

.text-muted {
  color: var(--text-muted) !important;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.role-leader {
  background-color: #fef3c7;
  color: #b45309;
}

.role-member {
  background-color: #f1f5f9;
  color: #475569;
}

.actions {
  text-align: center !important;
}

.btn-icon-only {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon-only:hover {
  background-color: #fee2e2;
}

.text-error {
  color: var(--error);
}

.text-error svg {
  width: 18px;
  height: 18px;
}

.empty-state {
  text-align: center !important;
  color: var(--text-muted) !important;
  padding: 3rem !important;
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    padding: 1.25rem;
  }

  .title {
    font-size: 1.15rem;
  }

  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .actions-bar .btn {
    width: 100%;
    justify-content: center;
  }

  /* Card-based table */
  .data-table thead {
    display: none;
  }

  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td {
    display: block;
    width: 100%;
  }

  .data-table tr {
    border: 1px solid #e8e8e8;
    border-radius: var(--radius-md);
    margin-bottom: 0.75rem;
    padding: 0.25rem 0;
    background-color: var(--bg-card);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .data-table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-bottom: 1px solid #f5f5f5;
    height: auto;
    font-size: 0.88rem;
    text-align: left !important;
  }

  .data-table td:last-child {
    border-bottom: none;
  }

  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-main);
    font-size: 0.82rem;
    flex-shrink: 0;
    margin-right: 0.75rem;
    min-width: 7rem;
  }

  .data-table td.actions {
    justify-content: flex-end;
    text-align: right !important;
    padding: 8px 14px;
  }

  .data-table td.actions::before {
    content: none;
  }

  .index-col {
    text-align: left !important;
  }

  .flex-row {
    flex-direction: column;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-input);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  color: var(--text-main);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.flex-row {
  flex-direction: row;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-main);
}

.required {
  color: var(--error);
}

.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-input);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
}

.input:focus {
  border-color: var(--primary);
}

.modal-actions {
  padding: 1.25rem 1.5rem;
  background-color: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--border-input);
}

.btn-cancel {
  background-color: white;
  border: 1px solid var(--border-input);
  color: var(--text-main);
}

.btn-cancel:hover {
  background-color: #f1f5f9;
}
</style>
