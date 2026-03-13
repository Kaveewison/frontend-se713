<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useParty } from '@/features/parties/composables/useParty';

// Use party composable for state management
const { parties, fetchParties, createParty, updateParty } = useParty();

// UI-specific state (modal and form)
const showAddModal = ref(false);
const isEditing = ref(false);
const editingPartyId = ref<number | null>(null);

const newParty = ref({
  name: '',
  policy: '',
  logo: '',
});

const isFormValid = computed(() => {
  return newParty.value.name.length > 0 && newParty.value.policy.length > 0;
});

// Fetch parties on mount
onMounted(async () => {
  await fetchParties();
});

const openAddModal = () => {
  isEditing.value = false;
  editingPartyId.value = null;
  newParty.value = { name: '', policy: '', logo: '' };
  showAddModal.value = true;
};

const openEditModal = (index: number) => {
  isEditing.value = true;
  const partyToEdit = parties.value[index];
  editingPartyId.value = partyToEdit.id;
  newParty.value = {
    name: partyToEdit.name,
    policy: partyToEdit.description || '',
    logo: partyToEdit.logo,
  };
  showAddModal.value = true;
};

const saveParty = async () => {
  if (isFormValid.value) {
    let success = false;

    if (isEditing.value && editingPartyId.value !== null) {
      // Update existing party
      success = await updateParty(editingPartyId.value, {
        name: newParty.value.name,
        description: newParty.value.policy,
      });
    } else {
      // Create new party
      success = await createParty({
        name: newParty.value.name,
        logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${newParty.value.name.replace(/\s+/g, '')}`,
        description: newParty.value.policy,
      });
    }

    if (success) {
      showAddModal.value = false;
      await fetchParties(); // Refresh party list
    }
  }
};
</script>

<template>
  <div class="card">
    <div class="header">
      <div>
        <h2 class="title">รายชื่อพรรคการเมือง</h2>
        <p class="subtitle">
          เพิ่มพรรคการเมือง โดยระบุชื่อพรรค, นโยบายพรรค และอัปโหลดโลโก้พรรค
        </p>
      </div>
      <button class="btn btn-primary btn-add" @click="openAddModal">
        เพิ่มพรรคการเมือง
      </button>
    </div>

    <div class="search-section">
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
        <input type="text" placeholder="ค้นหาชื่อพรรค" class="search-input" />
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th width="80"></th>
            <th>พรรคการเมือง</th>
            <th>นโยบายพรรค</th>
            <th>จำนวนสมาชิก</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(party, index) in parties" :key="party.id">
            <td data-label="ลำดับ" class="index-col">{{ index + 1 }}</td>
            <td data-label="พรรคการเมือง">
              <div class="party-info">
                <img :src="party.logo" alt="logo" class="party-logo" />
                <span class="party-name">{{ party.name }}</span>
              </div>
            </td>
            <td data-label="นโยบายพรรค">{{ party.description || '-' }}</td>
            <td data-label="จำนวนสมาชิก">-</td>
            <td class="actions">
              <div class="action-buttons">
                <button
                  class="btn btn-action btn-edit"
                  @click="openEditModal(index)"
                >
                  แก้ไข
                </button>
                <button
                  class="btn btn-action btn-members"
                  @click="$router.push(`/parties/${party.id}/members`)"
                >
                  รายชื่อสมาชิก
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Party Modal -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{ isEditing ? 'แก้ไขข้อมูลพรรคการเมือง' : 'เพิ่มพรรคการเมือง' }}
          </h3>
          <button class="close-btn" @click="showAddModal = false">×</button>
        </div>

        <div class="modal-body form-body">
          <div class="form-group">
            <label>ชื่อพรรคการเมือง <span class="required">*</span></label>
            <input
              type="text"
              v-model="newParty.name"
              class="input"
              placeholder="ระบุชื่อพรรค"
            />
          </div>
          <div class="form-group">
            <label>นโยบายพรรค <span class="required">*</span></label>
            <textarea
              v-model="newParty.policy"
              class="input textarea"
              placeholder="ระบุนโยบายพรรค"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>โลโก้พรรค <span class="required">*</span></label>
            <div class="file-upload-zone">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                class="upload-icon"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>คลิกเพื่ออัพโหลดรูปภาพ โลโก้พรรค .png / .jpg</p>
              <input
                type="file"
                class="file-input"
                accept="image/png, image/jpeg"
              />
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showAddModal = false">
            ยกเลิก
          </button>
          <button
            class="btn btn-primary"
            @click="saveParty"
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
  padding: 2rem;
  position: relative;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header .btn-add {
    width: 100%;
  }
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-main);
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
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

.search-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 400px;
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
  padding: 16px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
  vertical-align: middle;
}

.data-table th {
  color: var(--text-main);
  font-weight: 600;
  white-space: nowrap;
}

.data-table td {
  color: var(--text-secondary);
}

.index-col {
  font-weight: 500;
  color: var(--text-main);
}

.party-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.party-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background-color: #f1f2f6;
  flex-shrink: 0;
}

.party-name {
  font-weight: 500;
  color: var(--text-main);
}

.actions {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Mobile card layout */
@media (max-width: 768px) {
  .search-box {
    max-width: 100%;
  }

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

  .data-table td.actions::before {
    content: none;
  }

  .data-table td.actions {
    justify-content: flex-end;
    padding: 10px 14px;
  }

  .card {
    padding: 1.25rem;
  }
}

.btn-action {
  padding: 8px 16px;
  font-size: 0.85rem;
}

.btn-edit {
  background-color: var(--primary-light);
  color: var(--primary);
}

.btn-members {
  background-color: var(--primary);
  color: white;
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
  max-width: 550px;
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

.textarea {
  resize: vertical;
  min-height: 80px;
}

.file-upload-zone {
  border: 2px dashed var(--border-input);
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  background-color: #f8fafc;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.file-upload-zone:hover {
  border-color: var(--primary);
  background-color: var(--primary-light);
}

.upload-icon {
  width: 32px;
  height: 32px;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.file-upload-zone p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
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
