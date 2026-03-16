<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useConstituencyStore } from '@/stores';
import { useToast } from '@/composables/useToast';
import type { Constituency } from '@/types/models';
import type { CreateConstituencyDTO, UpdateConstituencyDTO } from '@/types/dto';
import provincesData from '@/datas/provinces.json';

import CommonSwitch from '@/components/common/CommonSwitch.vue';
import CommonDropdown from '@/components/common/CommonDropdown.vue';
import CommonInput from '@/components/common/CommonInput.vue';
import CommonModal from '@/components/common/CommonModal.vue';
import type { DropdownOption } from '@/components/common/CommonDropdown.vue';
const constituencyStore = useConstituencyStore();
const {
  constituencies,
  isLoading,
  regions,
  constituencyStatsMap,
  isAllOpened,
} = storeToRefs(constituencyStore);
const {
  fetchPublicConstituencies,
  createConstituency,
  updateConstituency,
  deleteConstituency: deleteConstituencyAction,
  toggleConstituencyStatus,
  toggleAllConstituenciesStatus,
} = constituencyStore;

const { showSuccess, showError } = useToast();

const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editingConstituencyId = ref<number | null>(null);
const constituencyToDelete = ref<Constituency | null>(null);
const selectedRegion = ref('');
const selectedConstituency = ref('');

const formData = ref<CreateConstituencyDTO>({
  province: '',
  districtNumber: null,
});

const formTouched = ref({
  province: false,
  districtNumber: false,
});

const formErrors = ref({
  province: '',
  districtNumber: '',
});

const filteredConstituencies = computed(() => {
  let result = constituencies.value;

  if (selectedRegion.value) {
    result = result.filter((c) => {
      const region = c.region || c.province;
      return region === selectedRegion.value;
    });
  }

  if (selectedConstituency.value) {
    result = result.filter((c) => {
      const number = c.number || c.districtNumber;
      return number?.toString() === selectedConstituency.value;
    });
  }

  return result;
});

const constituencyNumbers = computed(() => {
  if (!selectedRegion.value) return [];

  const numbers = constituencies.value
    .filter((c) => {
      const region = c.region || c.province;
      return region === selectedRegion.value;
    })
    .map((c) => c.number || c.districtNumber)
    .filter((n): n is number => n !== undefined);

  return [...new Set(numbers)].sort((a, b) => a - b);
});

const handleRegionChange = (value: string | number) => {
  selectedRegion.value = String(value);
  selectedConstituency.value = '';
};

const regionOptions = computed<DropdownOption[]>(() => {
  return [
    { label: 'ทั้งหมด', value: '' },
    ...regions.value.map((region) => ({
      label: region,
      value: region,
    })),
  ];
});

const constituencyOptions = computed<DropdownOption[]>(() => {
  return constituencyNumbers.value.map((number) => ({
    label: `เขตเลือกตั้ง ${number}`,
    value: number.toString(),
  }));
});

const provinceOptions = computed<DropdownOption[]>(() => {
  return provincesData.map((province) => ({
    label: province.name_th,
    value: province.name_th,
  }));
});

const isFormValid = computed(() => {
  return (
    formData.value.province.trim() !== '' &&
    formData.value.districtNumber !== null &&
    formData.value.districtNumber > 0 &&
    !formErrors.value.province &&
    !formErrors.value.districtNumber
  );
});

const getToggleState = (constituencyId: number) => {
  const constituency = constituencies.value.find(
    (c) => c.id === constituencyId,
  );
  return !(constituency?.isClosed ?? false);
};

const setToggleState = async (constituencyId: number) => {
  try {
    await toggleConstituencyStatus(constituencyId);
    showSuccess('อัปเดตสถานะสำเร็จ');
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
  }
};

const handleMasterToggle = async (newValue: boolean) => {
  try {
    await toggleAllConstituenciesStatus(!newValue);
    showSuccess('อัปเดตสถานะทุกเขตสำเร็จ');
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานทุกเขต');
  }
};

const validateProvince = () => {
  if (!formData.value.province || formData.value.province.trim() === '') {
    formErrors.value.province = 'กรุณาเลือกจังหวัด';
  } else {
    formErrors.value.province = '';
  }
};

const validateDistrictNumber = () => {
  if (
    formData.value.districtNumber === null ||
    formData.value.districtNumber === undefined ||
    formData.value.districtNumber < 1
  ) {
    formErrors.value.districtNumber = 'กรุณากรอกเขตเลือกตั้ง';
  } else {
    formErrors.value.districtNumber = '';
  }
};

const handleProvinceChange = (value: string | number) => {
  formData.value.province = String(value);
  formTouched.value.province = true;
  validateProvince();
};

const handleProvinceBlur = () => {
  formTouched.value.province = true;
  validateProvince();
};

const handleDistrictNumberBlur = () => {
  formTouched.value.districtNumber = true;
  validateDistrictNumber();
};

const openAddModal = () => {
  isEditing.value = false;
  editingConstituencyId.value = null;
  formData.value = { province: '', districtNumber: null };
  formTouched.value = { province: false, districtNumber: false };
  formErrors.value = { province: '', districtNumber: '' };
  showModal.value = true;
};

const openEditModal = (constituency: Constituency) => {
  isEditing.value = true;
  editingConstituencyId.value = constituency.id;
  formData.value = {
    province: constituency.province || '',
    districtNumber: constituency.districtNumber || 1,
  };
  formTouched.value = { province: false, districtNumber: false };
  formErrors.value = { province: '', districtNumber: '' };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = { province: '', districtNumber: null };
  formTouched.value = { province: false, districtNumber: false };
  formErrors.value = { province: '', districtNumber: '' };
};

const saveConstituency = async () => {
  formTouched.value.province = true;
  formTouched.value.districtNumber = true;
  validateProvince();
  validateDistrictNumber();

  if (!isFormValid.value) return;

  isSaving.value = true;
  try {
    if (isEditing.value && editingConstituencyId.value) {
      const updateData: UpdateConstituencyDTO = {
        province: formData.value.province,
        districtNumber: formData.value.districtNumber,
      };
      await updateConstituency(editingConstituencyId.value, updateData);
      showSuccess('อัปเดตข้อมูลเขตเลือกตั้งสำเร็จ');
    } else {
      await createConstituency(formData.value);
      showSuccess('เพิ่มเขตเลือกตั้งสำเร็จ');
    }
    closeModal();
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (constituency: Constituency) => {
  constituencyToDelete.value = constituency;
  showDeleteModal.value = true;
};

const deleteConstituency = async () => {
  if (!constituencyToDelete.value) return;

  isDeleting.value = true;
  try {
    await deleteConstituencyAction(constituencyToDelete.value.id);
    showSuccess('ลบเขตเลือกตั้งสำเร็จ');
    showDeleteModal.value = false;
    constituencyToDelete.value = null;
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
  } finally {
    isDeleting.value = false;
  }
};

const getConstituencyStats = (constituencyId: number) => {
  const constituency = constituencies.value.find(
    (c) => c.id === constituencyId,
  );
  const fromUsers = constituencyStatsMap.value[constituencyId];
  return {
    candidates: constituency?._count?.candidates ?? 0,
    eligibleVoters: fromUsers?.eligibleVoters ?? 0,
    parties: fromUsers?.parties ?? 0,
  };
};

onMounted(async () => {
  try {
    await fetchPublicConstituencies();
  } catch (error: any) {
    showError(error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
  }
});
</script>

<template>
  <div class="card">
    <div class="header">
      <div>
        <h2 class="title">รายชื่อจังหวัด และเขตเลือกตั้ง</h2>
        <p class="subtitle">เพิ่มรายการ จังหวัด และเขตการเลือกตั้ง</p>
      </div>
      <div class="header-toggle">
        <span class="toggle-label">สถานะเปิดหีบทุกเขต</span>
        <CommonSwitch
          v-model="isAllOpened"
          @update:model-value="handleMasterToggle"
        />
      </div>
    </div>

    <div class="filters">
      <div class="dropdowns">
        <CommonDropdown
          v-model="selectedRegion"
          placeholder="ทุกจังหวัด"
          :options="regionOptions"
          @change="handleRegionChange"
        />

        <CommonDropdown
          v-model="selectedConstituency"
          placeholder="ทุกเขตเลือกตั้ง"
          :options="constituencyOptions"
          :disabled="!selectedRegion"
        />
      </div>
      <button class="btn btn-primary" @click="openAddModal">เพิ่มรายการ</button>
    </div>

    <div v-if="isLoading" class="loading">กำลังโหลดข้อมูล...</div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>จังหวัด</th>
            <th>เขตเลือกตั้ง</th>
            <th>จำนวนผู้มีสิทธิเลือกตั้ง</th>
            <th>จำนวนผู้ลงสมัคร</th>
            <th>จำนวนพรรค</th>
            <th>สถานะเปิดหีบ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredConstituencies.length === 0">
            <td
              colspan="8"
              style="
                text-align: center;
                padding: 2rem;
                color: var(--text-muted);
              "
            >
              ไม่พบข้อมูลเขตเลือกตั้ง
            </td>
          </tr>
          <tr
            v-for="(constituency, index) in filteredConstituencies"
            :key="constituency.id"
          >
            <td data-label="ลำดับ">{{ index + 1 }}</td>
            <td data-label="จังหวัด">
              {{ constituency.region || constituency.province || '-' }}
            </td>
            <td data-label="เขตเลือกตั้ง">
              {{ constituency.number || constituency.districtNumber || '-' }}
            </td>
            <td data-label="จำนวนผู้มีสิทธิ">
              {{ getConstituencyStats(constituency.id).eligibleVoters }}
            </td>
            <td data-label="จำนวนผู้ลงสมัคร">
              {{ getConstituencyStats(constituency.id).candidates }}
            </td>
            <td data-label="จำนวนพรรค">
              {{ getConstituencyStats(constituency.id).parties }}
            </td>
            <td data-label="สถานะเปิดหีบ">
              <CommonSwitch
                :model-value="getToggleState(constituency.id)"
                @update:model-value="setToggleState(constituency.id)"
              />
            </td>
            <td class="actions">
              <div class="action-buttons">
                <button
                  class="btn btn-action btn-edit"
                  @click="openEditModal(constituency)"
                >
                  แก้ไข
                </button>
                <button
                  class="btn btn-action btn-delete"
                  @click="confirmDelete(constituency)"
                >
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Constituency Modal -->
    <CommonModal
      v-model="showModal"
      :title="isEditing ? 'แก้ไขข้อมูลเขตเลือกตั้ง' : 'เพิ่มเขตเลือกตั้ง'"
      size="medium"
      :confirm-disabled="!isFormValid"
      :confirm-loading="isSaving"
      @confirm="saveConstituency"
    >
      <div class="form-body">
        <CommonDropdown
          v-model="formData.province"
          label="จังหวัด"
          placeholder="เลือกจังหวัด"
          :options="provinceOptions"
          :required="true"
          :error="formErrors.province"
          :touched="formTouched.province"
          @change="handleProvinceChange"
          @blur="handleProvinceBlur"
        />

        <CommonInput
          v-model="formData.districtNumber"
          label="เขตเลือกตั้ง"
          placeholder="กรอกหมายเลขเขต"
          type="number"
          :required="true"
          :error="formErrors.districtNumber"
          :touched="formTouched.districtNumber"
          @blur="handleDistrictNumberBlur"
        />
      </div>
    </CommonModal>

    <!-- Delete Confirmation Modal -->
    <CommonModal
      v-model="showDeleteModal"
      title="ยืนยันการลบ"
      size="small"
      confirm-text="ลบ"
      :confirm-loading="isDeleting"
      @confirm="deleteConstituency"
    >
      <template #default>
        <p>
          คุณต้องการลบเขตเลือกตั้ง "{{
            constituencyToDelete?.name ||
            constituencyToDelete?.province +
              ' เขต ' +
              (constituencyToDelete?.districtNumber ||
                constituencyToDelete?.number)
          }}" ใช่หรือไม่?
        </p>
        <p class="warning-text">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
      </template>
      <template #footer>
        <button
          class="btn btn-cancel"
          @click="showDeleteModal = false"
          :disabled="isDeleting"
        >
          ยกเลิก
        </button>
        <button
          class="btn btn-delete"
          @click="deleteConstituency"
          :disabled="isDeleting"
        >
          {{ isDeleting ? 'กำลังลบ...' : 'ลบ' }}
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
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
    border-radius: var(--radius-md);
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }
}

.header-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .header-toggle {
    justify-content: space-between;
  }
}

.toggle-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

@media (max-width: 480px) {
  .toggle-label {
    font-size: 0.85rem;
  }
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-main);
}

@media (max-width: 768px) {
  .title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1rem;
  }
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 4px;
}

@media (max-width: 768px) {
  .subtitle {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .subtitle {
    font-size: 0.8rem;
  }
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }
}

.dropdowns {
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 600px;
}

@media (max-width: 768px) {
  .dropdowns {
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dropdowns {
    flex-direction: column;
    gap: 0.75rem;
  }
}

.dropdowns :deep(.form-group) {
  min-width: 180px;
}

@media (max-width: 768px) {
  .dropdowns :deep(.form-group) {
    min-width: 0;
    flex: 1;
  }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-action {
  padding: 6px 14px;
  font-size: 0.85rem;
}

@media (max-width: 480px) {
  .btn-action {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}

.btn-edit {
  background-color: var(--primary-light);
  color: var(--primary);
}

.btn-delete {
  background-color: #f76e6e;
  color: white;
  margin-left: 8px;
}

@media (max-width: 480px) {
  .btn-delete {
    margin-left: 4px;
  }
}

.btn-cancel {
  background-color: #e5e7eb;
  color: var(--text-secondary);
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
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
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

.actions {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

/* ===== Mobile card layout ===== */
@media (max-width: 768px) {
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
    min-width: 8rem;
  }

  .data-table td.actions::before {
    content: none;
  }

  .data-table td.actions {
    justify-content: flex-end;
    padding: 10px 14px;
  }

  .btn-delete {
    margin-left: 0;
  }

  .btn {
    width: auto;
  }
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (max-width: 480px) {
  .form-body {
    gap: 1rem;
  }
}

.warning-text {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (max-width: 480px) {
  .warning-text {
    font-size: 0.85rem;
  }
}

.btn-delete {
  background-color: #f76e6e;
  color: white;
  margin-left: 8px;
}

@media (max-width: 480px) {
  .btn-delete {
    margin-left: 4px;
  }
}
</style>
