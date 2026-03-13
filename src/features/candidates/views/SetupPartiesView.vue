<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useElectionStore } from '@/stores/election.store';
import { useToast } from '@/composables/useToast';
import {
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
  uploadProfileImage,
} from '@/utils';
import type { PartyOverview } from '@/types/dto/election.dto';
import CommonModal from '@/components/common/CommonModal.vue';

const router = useRouter();
const electionStore = useElectionStore();
const { showSuccess, showError } = useToast();

const searchQuery = ref('');
const showEditModal = ref(false);
const showAddModal = ref(false);
const selectedParty = ref<PartyOverview | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const addFileInputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);
const addPreviewUrl = ref<string | null>(null);
const isSubmitting = ref(false);

const editForm = ref({
  name: '',
  policy: '',
  logo: null as File | null,
});
const addForm = ref({
  name: '',
  policy: '',
  logo: null as File | null,
});

const filteredParties = computed(() => {
  if (!searchQuery.value.trim()) {
    return electionStore.partyOverview;
  }
  const query = searchQuery.value.toLowerCase();
  return electionStore.partyOverview.filter(
    (party) =>
      party.name.toLowerCase().includes(query) ||
      party.policy.toLowerCase().includes(query),
  );
});

const handleAdd = () => {
  addForm.value = {
    name: '',
    policy: '',
    logo: null,
  };
  showAddModal.value = true;
};

const handleEdit = (party: PartyOverview) => {
  selectedParty.value = party;
  editForm.value = {
    name: party.name,
    policy: party.policy,
    logo: null,
  };
  showEditModal.value = true;
};

const handleViewMembers = (partyId: number) => {
  router.push(`/parties/${partyId}/members`);
};

const triggerFileInput = (isAdd = false) => {
  if (isAdd) {
    addFileInputRef.value?.click();
  } else {
    fileInputRef.value?.click();
  }
};

const handleFileSelect = (event: Event, isAdd = false) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const validation = validateImageFile(file, 5);
  if (!validation.valid) {
    showError(validation.error || 'ไฟล์ไม่ถูกต้อง');
    if (target) {
      target.value = '';
    }
    return;
  }

  if (isAdd) {
    clearImagePreview(true);
    addPreviewUrl.value = createImagePreview(file);
    addForm.value.logo = file;
  } else {
    clearImagePreview(false);
    previewUrl.value = createImagePreview(file);
    editForm.value.logo = file;
  }
};

const clearImagePreview = (isAdd = false) => {
  if (isAdd) {
    if (addPreviewUrl.value) {
      revokeImagePreview(addPreviewUrl.value);
      addPreviewUrl.value = null;
    }
    addForm.value.logo = null;
  } else {
    if (previewUrl.value) {
      revokeImagePreview(previewUrl.value);
      previewUrl.value = null;
    }
    editForm.value.logo = null;
  }
};

const handleSubmitAdd = async () => {
  if (!addForm.value.name.trim()) {
    showError('กรุณากรอกชื่อพรรค');
    return;
  }

  isSubmitting.value = true;

  try {
    // 1. สร้างพรรคใหม่
    const newParty = await electionStore.createParty({
      name: addForm.value.name,
      logoUrl: '',
      policy: addForm.value.policy,
    });

    // 2. ถ้ามีไฟล์ logo ให้ upload แยก
    if (addForm.value.logo && newParty?.id) {
      await electionStore.uploadPartyLogo(newParty.id, addForm.value.logo);
    }

    showSuccess('เพิ่มพรรคการเมืองสำเร็จ');
    showAddModal.value = false;
    clearImagePreview(true);
    addForm.value = { name: '', policy: '', logo: null };
    if (addFileInputRef.value) addFileInputRef.value.value = '';
    await electionStore.fetchPartyOverview();
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
  } finally {
    isSubmitting.value = false;
  }
};

const handleSubmit = async () => {
  if (!selectedParty.value) return;

  isSubmitting.value = true;

  try {
    let logoUrl = selectedParty.value.logoUrl;

    // If new logo file was selected, upload it first
    if (editForm.value.logo) {
      const uploadResponse = await uploadProfileImage(editForm.value.logo);
      logoUrl = uploadResponse.data.imageUrl;
    }

    // Update party with new data
    await electionStore.updateParty(selectedParty.value.id, {
      name: editForm.value.name,
      logoUrl: logoUrl,
      policy: editForm.value.policy,
    });

    showSuccess('อัปเดตพรรคสำเร็จ');
    await electionStore.fetchPartyOverview();
    showEditModal.value = false;
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  showEditModal.value = false;
  clearImagePreview(false);
  selectedParty.value = null;
  editForm.value = {
    name: '',
    policy: '',
    logo: null,
  };
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleCancelAdd = () => {
  showAddModal.value = false;
  clearImagePreview(true);
  addForm.value = {
    name: '',
    policy: '',
    logo: null,
  };
  if (addFileInputRef.value) {
    addFileInputRef.value.value = '';
  }
};

onMounted(async () => {
  try {
    await electionStore.fetchPartyOverview();
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
  }
});

onUnmounted(() => {
  clearImagePreview(false);
  clearImagePreview(true);
});
</script>

<template>
  <div class="card">
    <div class="header">
      <div class="header-row">
        <div>
          <h2 class="title">รายชื่อพรรคการเมือง</h2>

          <p class="subtitle">
            ดูพรรคการเมืองทั้งหมด ใช้ค้นหาเพื่อหาพรรค, นโยบายพรรค
            และจำนวนสมาชิกที่ได้รับเลือกให้พรรคนั้น
          </p>
        </div>

        <button class="btn btn-primary" @click="handleAdd">
          เพิ่มพรรคการเมือง
        </button>
      </div>
    </div>

    <div class="filters">
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
          placeholder="ค้นหาชื่อพรรค"
          class="search-input"
        />
      </div>
    </div>

    <div v-if="electionStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="electionStore.error" class="error-state">
      <p>{{ electionStore.error }}</p>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>พรรคการเมือง</th>
            <th>นโยบายพรรค</th>
            <th>จำนวนสมาชิก</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredParties.length === 0">
            <td colspan="5" class="empty-state">ไม่พบข้อมูลพรรคการเมือง</td>
          </tr>
          <tr v-else v-for="(party, index) in filteredParties" :key="party.id">
            <td data-label="ลำดับ">{{ index + 1 }}</td>
            <td data-label="พรรคการเมือง">
              <div class="party-info">
                <img
                  :src="party.logoUrl"
                  :alt="party.name"
                  class="party-logo"
                />
                <span class="party-name">{{ party.name }}</span>
              </div>
            </td>
            <td data-label="นโยบายพรรค">{{ party.policy }}</td>
            <td data-label="จำนวนสมาชิก">{{ party.totalElectedMPs }}</td>
            <td class="actions">
              <div class="action-buttons">
                <button
                  class="btn btn-action btn-edit"
                  @click="handleEdit(party)"
                >
                  แก้ไข
                </button>
                <button
                  class="btn btn-action btn-members"
                  @click="handleViewMembers(party.id)"
                >
                  รายชื่อสมาชิก
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Modal -->
    <CommonModal
      v-model="showAddModal"
      title="ข้อมูลพรรคการเมือง"
      size="medium"
      confirm-text="บันทึก"
      :show-cancel="false"
      :confirm-disabled="isSubmitting"
      :confirm-loading="isSubmitting"
      @confirm="handleSubmitAdd"
      @cancel="handleCancelAdd"
    >
      <div class="form-body">
        <div class="form-group">
          <div class="profile-header">
            <div class="avatar-circle">
              <img
                :src="addPreviewUrl || 'https://via.placeholder.com/150'"
                alt="Party logo preview"
              />
            </div>
            <div class="upload-actions">
              <input
                ref="addFileInputRef"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                style="display: none"
                @change="handleFileSelect($event, true)"
              />
              <button
                type="button"
                class="btn-upload"
                @click="triggerFileInput(true)"
              >
                เพิ่มรูป
              </button>
              <p class="help-text">ใช้รูปไฟล์ JPG or PNG</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>ชื่อพรรค</label>
          <input
            v-model="addForm.name"
            type="text"
            class="input"
            placeholder="ชื่อพรรคการเมือง"
          />
        </div>

        <div class="form-group">
          <label>นโยบายพรรค</label>
          <input
            v-model="addForm.policy"
            type="text"
            class="input"
            placeholder="นโยบายพรรคการเมือง"
          />
        </div>
      </div>
    </CommonModal>

    <!-- Edit Modal -->
    <CommonModal
      v-model="showEditModal"
      title="ข้อมูลพรรคการเมือง"
      size="medium"
      confirm-text="บันทึก"
      :show-cancel="false"
      :confirm-disabled="isSubmitting"
      :confirm-loading="isSubmitting"
      @confirm="handleSubmit"
      @cancel="handleCancel"
    >
      <div class="form-body">
        <div class="form-group">
          <label>โลโก้พรรค</label>
          <div class="profile-header">
            <div class="avatar-circle">
              <img
                :src="
                  previewUrl ||
                  selectedParty?.logoUrl ||
                  'https://via.placeholder.com/150'
                "
                :alt="selectedParty?.name || 'Party logo'"
              />
            </div>
            <div class="upload-actions">
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                style="display: none"
                @change="handleFileSelect($event, false)"
              />
              <button
                type="button"
                class="btn-upload"
                @click="triggerFileInput(false)"
              >
                เปลี่ยนรูป
              </button>
              <p class="help-text">ใช้รูปไฟล์ JPG or PNG</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>ชื่อพรรค</label>
          <input
            v-model="editForm.name"
            type="text"
            class="input"
            placeholder="ชื่อพรรคการเมือง"
          />
        </div>

        <div class="form-group">
          <label>นโยบายพรรค</label>
          <input
            v-model="editForm.policy"
            type="text"
            class="input"
            placeholder="นโยบายพรรคการเมือง"
          />
        </div>
      </div>
    </CommonModal>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.header {
  margin-bottom: 2rem;
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

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid var(--border-input);
  border-radius: var(--radius-md);
  outline: none;
}

.search-input:focus {
  border-color: var(--primary);
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-input);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #e53e3e;
  background-color: #fff5f5;
  border-radius: var(--radius-md);
  border: 1px solid #feb2b2;
}

.table-wrapper {
  width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
  vertical-align: middle;
  height: 72px;
}

.data-table th {
  color: var(--text-main);
  font-weight: 600;
  white-space: nowrap;
  height: auto;
}

.data-table td {
  color: var(--text-secondary);
}

.party-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
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

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: var(--text-muted);
}

.actions {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0;
  flex-wrap: wrap;
  gap: 4px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action {
  padding: 8px 16px;
  font-size: 0.85rem;
}

.btn-edit {
  background-color: var(--primary-light);
  color: var(--primary);
}

.btn-edit:hover {
  background-color: rgba(89, 71, 236, 0.15);
}

.btn-members {
  background-color: var(--primary);
  color: white;
  margin-left: 8px;
}

.btn-members:hover {
  background-color: var(--primary-hover);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 0.5rem;
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

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  background-color: #f1f2f6;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-upload {
  padding: 8px 20px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-upload:hover {
  background-color: var(--primary-hover);
}

.help-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .card {
    padding: 1.25rem;
    border-radius: var(--radius-md);
  }

  .header-row {
    flex-direction: column;
    align-items: stretch;
  }

  .header-row .btn-primary {
    width: 100%;
  }

  .search-box {
    max-width: 100%;
  }

  /* Card-based table layout */
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
    padding: 0.5rem 0;
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
    min-width: 6rem;
  }

  /* actions cell — ไม่ต้องแสดง label */
  .data-table td.actions::before {
    content: none;
  }

  .data-table td.actions {
    justify-content: flex-end;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .party-logo {
    width: 32px;
    height: 32px;
  }

  .action-buttons {
    justify-content: flex-end;
    flex-direction: row;
  }

  .btn-members {
    margin-left: 0;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .upload-actions {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 1rem;
  }

  .title {
    font-size: 1.05rem;
  }

  .btn {
    padding: 8px 14px;
    font-size: 0.9rem;
  }

  .btn-action {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>
