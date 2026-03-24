<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useElectionStore, useVoteStore } from '@/stores';
import CommonDropdown from '@/components/common/CommonDropdown.vue';

const electionStore = useElectionStore();
const voteStore = useVoteStore();

const { electionResults, isLoading } = storeToRefs(electionStore);

const selectedProvince = '';
const selectedDistrict = '';

const provinceOptions = computed(() => []);
const districtOptions = computed(() => []);

const constituency = computed(
  () => electionResults.value?.constituency ?? null,
);
const candidates = computed(() =>
  [...(electionResults.value?.candidates ?? [])].sort(
    (a, b) => b.voteCount - a.voteCount,
  ),
);

const isClosed = computed(() => constituency.value?.isClosed ?? false);

const getAvatarUrl = (candidate: {
  imageUrl: string | null;
  party: { logoUrl: string | null };
}) => {
  return candidate.imageUrl || candidate.party.logoUrl || null;
};

onMounted(async () => {
  if (voteStore.myVoteData?.constituency.id) {
    await electionStore.fetchElectionResults(
      voteStore.myVoteData?.constituency.id,
    );
  }
});
</script>

<template>
  <div class="card">
    <div class="page-header">
      <h2 class="page-title">รายงานผลคะแนน</h2>
    </div>

    <div class="filters-row">
      <div class="dropdowns"></div>

      <div class="status-section">
        <span class="status-label">สถานะการปิดหีบ:</span>
        <span
          v-if="constituency"
          class="status-label"
          :class="!isClosed ? '!text-green-500' : '!text-red-500'"
        >
          {{ isClosed ? 'ปิด' : 'เปิด' }}
        </span>
        <span v-else class="status-label">-</span>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">กำลังโหลดข้อมูล...</div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>นโยบาย</th>
            <th>จังหวัด</th>
            <th>เขตเลือกตั้ง</th>
            <th>หมายเลขผู้สมัคร</th>
            <th class="text-right">คะแนนที่ได้</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="candidates.length === 0">
            <td colspan="6" class="empty-cell">ไม่พบข้อมูลผู้สมัคร</td>
          </tr>

          <tr v-for="candidate in candidates" :key="candidate.id">
            <td data-label="ชื่อ-นามสกุล">
              <div class="candidate-cell">
                <div class="avatar">
                  <img
                    v-if="getAvatarUrl(candidate)"
                    :src="getAvatarUrl(candidate)!"
                    :alt="candidate.firstName"
                    class="avatar-img"
                  />
                  <span v-else class="avatar-fallback">
                    {{ candidate.firstName.charAt(0) }}
                  </span>
                </div>
                <div class="candidate-info">
                  <span class="candidate-name">
                    {{ candidate.title }}{{ candidate.firstName }}
                    {{ candidate.lastName }}
                  </span>
                  <span class="party-name">{{ candidate.party.name }}</span>
                </div>
              </div>
            </td>

            <td data-label="นโยบาย">
              <span class="policy-text">{{ candidate.policy }}</span>
            </td>

            <td data-label="จังหวัด">
              {{ constituency?.province ?? '-' }}
            </td>

            <td data-label="เขตเลือกตั้ง">
              {{ constituency ? `เขต ${constituency.districtNumber}` : '-' }}
            </td>

            <td data-label="หมายเลขผู้สมัคร">
              {{ candidate.candidateNumber }}
            </td>

            <td data-label="คะแนนที่ได้" class="text-right">
              <span class="vote-count">{{
                candidate.voteCount.toLocaleString()
              }}</span>
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
  padding: 2rem;
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
    border-radius: var(--radius-md);
  }
}

.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.page-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
}

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  gap: 1rem;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
}

.dropdowns {
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 520px;
}

@media (max-width: 768px) {
  .dropdowns {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .dropdowns {
    flex-direction: column;
  }
}

.status-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .status-section {
    justify-content: flex-end;
  }
}

.status-label {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-main);
}

@media (max-width: 768px) {
  .status-label {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .status-label {
    font-size: 16px;
  }
}

.loading-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-muted);
  font-size: 0.95rem;
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

.text-right {
  text-align: right !important;
}

.empty-cell {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-muted);
}

.candidate-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background-color: var(--primary-light, #e0e7ff);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary, #6366f1);
}

.candidate-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.candidate-name {
  font-weight: 600;
  color: var(--text-main);
  font-size: 0.9rem;
  white-space: nowrap;
}

.party-name {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.policy-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 280px;
  line-height: 1.4;
}

.vote-count {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary, #6366f1);
}

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

  .data-table td.text-right {
    text-align: right !important;
  }

  .policy-text {
    max-width: 180px;
  }

  .candidate-name {
    white-space: normal;
  }
}
</style>
