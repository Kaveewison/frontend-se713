<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useConstituencyStore, useElectionStore } from '@/stores';

import CommonDropdown from '@/components/common/CommonDropdown.vue';
import type { DropdownOption } from '@/components/common/CommonDropdown.vue';

const route = useRoute();
const constituencyStore = useConstituencyStore();
const electionStore = useElectionStore();

const partyId = computed(() => Number(route.params.id) || 1);
const isPublicRoute = computed(() => route.path.includes('/parties/public'));
const backPath = computed(() => isPublicRoute.value ? '/parties/public' : '/candidates/party');

const { publicPartyDetail: party, isLoading, error } = storeToRefs(electionStore);

// Filters
const filterProvince = ref('');
const filterDistrict = ref<number | ''>('');

const provinceOptions = computed<DropdownOption[]>(() => {
  if (!party.value) return [];
  const set = new Set(
    party.value.candidates.map((c) => c.constituency.province),
  );
  const opts: DropdownOption[] = [{ label: 'ทุกจังหวัด', value: '' }];
  Array.from(set)
    .sort()
    .forEach((p) => opts.push({ label: p, value: p }));
  return opts;
});

const districtOptions = computed<DropdownOption[]>(() => {
  if (!party.value) return [];
  const candidates = filterProvince.value
    ? party.value.candidates.filter(
        (c) => c.constituency.province === filterProvince.value,
      )
    : party.value.candidates;
  const set = new Set(candidates.map((c) => c.constituency.districtNumber));
  const opts: DropdownOption[] = [{ label: 'ทุกเขต', value: '' }];
  Array.from(set)
    .sort((a, b) => a - b)
    .forEach((d) => opts.push({ label: `เขต ${d}`, value: d }));
  return opts;
});

function onProvinceChange(val: string | number) {
  filterProvince.value = String(val);
  filterDistrict.value = ''; // reset เขตเมื่อเปลี่ยนจังหวัด
}

function onDistrictChange(val: string | number) {
  filterDistrict.value = val === '' ? '' : Number(val);
}

const filteredCandidates = computed(() => {
  if (!party.value) return [];
  return party.value.candidates.filter((c) => {
    const matchProvince = filterProvince.value
      ? c.constituency.province === filterProvince.value
      : true;
    const matchDistrict =
      filterDistrict.value !== ''
        ? c.constituency.districtNumber === filterDistrict.value
        : true;
    return matchProvince && matchDistrict;
  });
});

const isAllClosed = computed(() => !constituencyStore.isAllOpened);

async function fetchParty() {
  try {
    await electionStore.fetchPublicPartyById(partyId.value);
  } catch {
    // error is already set in the store
  }
}

onMounted(() => {
  Promise.all([fetchParty(), constituencyStore.fetchConstituencies()]);
});
</script>

<template>
  <div class="card">
    <!-- Header -->
    <div class="header-banner">
      <!-- Loading skeleton -->
      <div v-if="isLoading" class="party-info">
        <div class="skeleton-logo"></div>
        <div class="party-text">
          <div class="skeleton-text skeleton-title"></div>
          <div class="skeleton-text skeleton-subtitle"></div>
        </div>
      </div>

      <!-- Party info -->
      <div v-else-if="party" class="party-info">
        <img
          :src="
            party.logoUrl?.trim() ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${party.id}`
          "
          alt="logo"
          class="party-logo"
          @error="
            (e: Event) =>
              ((e.target as HTMLImageElement).src =
                `https://api.dicebear.com/7.x/identicon/svg?seed=${party!.id}`)
          "
        />
        <div class="party-text">
          <h2 class="title">
            รายชื่อสมาชิก <span class="text-primary">{{ party.name }}</span>
          </h2>
          <p class="subtitle">{{ party.policy }}</p>
        </div>

        <button class="btn-view" @click="$router.push(backPath)">
          กลับ
        </button>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchParty">ลองใหม่</button>
    </div>

    <template v-else-if="party">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <CommonDropdown
            v-model="filterProvince"
            placeholder="เลือกจังหวัด"
            :options="provinceOptions"
            @change="onProvinceChange"
          />
          <CommonDropdown
            :model-value="filterDistrict"
            placeholder="เลือกเขต"
            :options="districtOptions"
            :disabled="districtOptions.length <= 1"
            @change="onDistrictChange"
          />
        </div>

        <div class="status-toggle">
          <span class="status-label">สถานะการปิดหีบ: </span>
          <span
            class="status-label"
            :class="{
              '!text-red-500': isAllClosed,
              '!text-green-500': !isAllClosed,
            }"
            >{{ isAllClosed ? 'ปิด' : 'เปิด' }}</span
          >
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>นโยบายผู้สมัคร</th>
              <th>จังหวัด</th>
              <th>เขตการเลือกตั้ง</th>
              <th>หมายเลขผู้สมัคร</th>
              <th>คะแนนที่ได้</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="candidate in filteredCandidates" :key="candidate.id">
              <td data-label="ชื่อ-นามสกุล">
                <div class="member-info">
                  <img
                    :src="
                      candidate.imageUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.firstName}${candidate.lastName}`
                    "
                    alt="avatar"
                    class="member-avatar"
                    @error="
                      (e: Event) =>
                        ((e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.firstName}${candidate.lastName}`)
                    "
                  />
                  <div>
                    <div class="candidate-name">
                      {{ candidate.title }}{{ candidate.firstName }}
                      {{ candidate.lastName }}
                    </div>
                  </div>
                </div>
              </td>
              <td data-label="นโยบายผู้สมัคร" class="policy-cell">
                {{ candidate.policy }}
              </td>
              <td data-label="จังหวัด">
                {{ candidate.constituency.province }}
              </td>
              <td data-label="เขตการเลือกตั้ง">
                {{ candidate.constituency.districtNumber }}
              </td>
              <td data-label="หมายเลขผู้สมัคร" class="center-col">
                {{ candidate.candidateNumber }}
              </td>
              <td data-label="คะแนนที่ได้" class="vote-col">
                <span v-if="candidate.voteCount !== null" class="vote-count">{{
                  candidate.voteCount.toLocaleString()
                }}</span>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>

            <tr v-if="filteredCandidates.length === 0">
              <td colspan="6" class="empty-state">ไม่พบรายชื่อผู้สมัคร</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Loading rows -->
    <div v-else-if="isLoading" class="skeleton-rows">
      <div v-for="i in 5" :key="i" class="skeleton-row"></div>
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
}

/* Header */
.header-banner {
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 4px 12px;
  border-radius: 999px;
  transition: all 0.2s;
}

.back-link:hover {
  background-color: var(--primary-light);
}

.back-icon {
  width: 16px;
  height: 16px;
}

.party-info {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}

.party-logo {
  width: 90px;
  height: 90px;
  border-radius: var(--radius-md);
  padding: 8px;
}

.party-text {
  flex: 1;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.4rem;
}

.text-primary {
  color: var(--primary);
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.stats-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-badge {
  padding: 4px 12px;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.stat-badge.elected {
  background: #dcfce7;
  color: #166534;
}

/* Filter bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.election-status {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
}

.status-badge.closed {
  background: #fee2e2;
  color: #b91c1c;
}

.status-badge.open {
  background: #dcfce7;
  color: #166534;
}

.btn-view {
  padding: 6px 14px;
  background-color: var(--primary, #6366f1);
  color: white;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
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
  background-color: #f8fafc;
}

.data-table td {
  color: var(--text-secondary);
}

.row-elected {
  background-color: #f0fdf4;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e2e8f0;
  flex-shrink: 0;
}

.candidate-name {
  font-weight: 500;
  color: var(--text-main);
  font-size: 0.9rem;
}

.status-label {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-main);
}

.elected-badge {
  display: inline-block;
  margin-top: 3px;
  padding: 1px 8px;
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.policy-cell {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.center-col {
  text-align: center !important;
}

.vote-col {
  text-align: center !important;
}

.vote-count {
  font-weight: 700;
  color: var(--primary);
  font-size: 1rem;
}

.text-muted {
  color: var(--text-muted);
}

.empty-state {
  text-align: center !important;
  color: var(--text-muted) !important;
  padding: 3rem !important;
}

/* Error state */
.error-state {
  text-align: center;
  padding: 3rem;
  color: var(--error);
}

/* Skeleton */
.skeleton-logo {
  width: 90px;
  height: 90px;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-text {
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 0.5rem;
}

.skeleton-title {
  height: 28px;
  width: 300px;
  max-width: 100%;
}

.skeleton-subtitle {
  height: 18px;
  width: 220px;
  max-width: 100%;
}

.skeleton-rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.skeleton-row {
  height: 56px;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    padding: 1.25rem;
  }

  .party-info {
    flex-direction: column;
    gap: 1rem;
  }

  .party-logo {
    width: 70px;
    height: 70px;
  }

  .title {
    font-size: 1.15rem;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .election-status {
    justify-content: flex-end;
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
    min-width: 8rem;
  }

  .policy-cell {
    max-width: none;
    white-space: normal;
  }

  .center-col,
  .vote-col {
    text-align: right !important;
  }
}
</style>
