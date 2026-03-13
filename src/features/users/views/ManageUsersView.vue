<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user.store';
import { UserRole } from '@/types/models/user.model';

const userStore = useUserStore();
const { users, isLoading, error } = storeToRefs(userStore);

const searchQuery = ref('');

onMounted(async () => {
  await userStore.fetchUsers();
});

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim();
  if (!q) return users.value;
  return users.value.filter((u) => u.nationalId.includes(q));
});

function isECT(role: string): boolean {
  return role === UserRole.EC;
}

async function handleToggleECT(userId: number): Promise<void> {
  try {
    await userStore.toggleECTStatus(userId);
  } catch (err) {
    console.error('Failed to toggle ECT status:', err);
  }
}
</script>

<template>
  <div class="card">
    <div class="header">
      <h2 class="title">รายชื่อผู้ใช้งาน</h2>
      <p class="subtitle">จัดการบริหารรายชื่อผู้ใช้งานระบบ</p>
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
          placeholder="ค้นหาด้วยเลขประจำตัวประชาชน 13 หลัก"
          class="search-input"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th width="60">ลำดับ</th>
            <th>ชื่อ</th>
            <th>นามสกุล</th>
            <th>เลขประจำตัว</th>
            <th>ที่อยู่</th>
            <th>จังหวัด</th>
            <th>เขตเลือกตั้ง</th>
            <th>กกต.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="8" class="empty-state">ไม่พบข้อมูลผู้ใช้</td>
          </tr>
          <tr v-for="(user, index) in filteredUsers" :key="user.id">
            <td data-label="ลำดับ" class="index-col">{{ index + 1 }}</td>
            <td data-label="ชื่อ">
              <div class="user-name">
                <span>{{ user.title }} {{ user.firstName }}</span>
              </div>
            </td>
            <td data-label="นามสกุล">{{ user.lastName }}</td>
            <td data-label="เลขประจำตัว" class="mono">{{ user.nationalId }}</td>
            <td data-label="ที่อยู่">{{ user.address ?? '-' }}</td>
            <td data-label="จังหวัด">
              {{ user.constituency?.province ?? '-' }}
            </td>
            <td data-label="เขตเลือกตั้ง">
              <span v-if="user.constituency">
                {{ user.constituency.districtNumber }}
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <td data-label="กกต.">
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="isECT(user.role)"
                  @change="handleToggleECT(user.id)"
                  :disabled="isLoading"
                />
                <span class="slider round"></span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1rem;
}

.header {
  margin-bottom: 1.25rem;
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
  margin-bottom: 1.25rem;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid var(--border-input);
  border-radius: var(--radius-md);
  outline: none;
  font-size: 0.9rem;
  background-color: var(--bg-card);
  color: var(--text-main);
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

/* Loading */
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

/* Error */
.error-state {
  padding: 2rem;
  text-align: center;
  color: #e53e3e;
  background-color: #fff5f5;
  border-radius: var(--radius-md);
  border: 1px solid #feb2b2;
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
  padding: 14px 10px;
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

.data-table tr:hover td {
  background-color: rgba(0, 0, 0, 0.01);
}

.index-col {
  font-weight: 600;
  color: var(--text-main);
}

.mono {
  font-family: monospace;
  letter-spacing: 0.03em;
  font-size: 0.85rem;
}

.text-muted {
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: var(--text-muted);
}

/* Avatar + name */
.user-name {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary, #5947ec), #8b7cf8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

/* Role badges */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-voter {
  background-color: #edf2ff;
  color: #3b5bdb;
}

.badge-ect {
  background-color: #fff3bf;
  color: #e67700;
}

.badge-admin {
  background-color: #ffe3e3;
  color: #c92a2a;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background-color: var(--primary, #5947ec);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (min-width: 640px) {
  .card {
    padding: 2rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  .filters {
    margin-bottom: 2rem;
  }

  .search-box {
    width: 340px;
  }
}

@media (max-width: 768px) {
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

  .user-name {
    white-space: normal;
  }

  .mono {
    font-size: 0.82rem;
  }
}
</style>
