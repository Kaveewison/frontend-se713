<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useElectionStore, useConstituencyStore } from '@/stores';
import { storeToRefs } from 'pinia';
import PublicPartiesCardLayout from '@/features/parties/components/PublicPartiesCardLayout.vue';
import CommonDropdown from '@/components/common/CommonDropdown.vue';
import type { DropdownOption } from '@/components/common/CommonDropdown.vue';

const router = useRouter();
const electionStore = useElectionStore();
const constituencyStore = useConstituencyStore();

const { constituencies } = storeToRefs(constituencyStore);

const selectedProvinceId = ref<string | number | null>(null);
const selectedDistrictId = ref<string | number | null>(null);

const provinceOptions = computed<DropdownOption[]>(() => {
  const seen = new Set<string>();
  const list = constituencies.value
    .filter((c) => {
      const prov = c.province || '';
      if (!prov || seen.has(prov)) return false;
      seen.add(prov);
      return true;
    })
    .map((c) => ({ label: c.province || '', value: c.id }));
  return [{ label: 'ทั้งหมด', value: '' }, ...list];
});

const districtsForProvince = computed(() => {
  if (!selectedProvinceId.value) return [];
  const anchor = constituencies.value.find(
    (c) => c.id === Number(selectedProvinceId.value),
  );
  if (!anchor?.province) return [];
  return constituencies.value.filter((c) => c.province === anchor.province);
});

const districts = districtsForProvince;

const districtOptions = computed<DropdownOption[]>(() =>
  districtsForProvince.value.map((c) => ({
    label: `เขต ${c.districtNumber}`,
    value: c.id,
  })),
);

const handleProvinceChange = (val: string | number) => {
  selectedProvinceId.value = val === '' ? null : val;
  selectedDistrictId.value = null;
};

const isPollingOpen = computed(() => constituencyStore.isAllOpened);

const filteredParties = computed(() => electionStore.partyOverview);

const viewMembers = (partyId: number) => {
  router.push(`/parties/public/${partyId}`);
};

const loadData = async (params?: { id?: number; districtNumber?: number }) => {
  try {
    await electionStore.fetchPartyOverview(params);
  } catch (error) {
    console.error('Failed to load party overview:', error);
  }
};

watch(selectedDistrictId, (districtId) => {
  if (!districtId) {
    if (selectedProvinceId.value) {
      loadData({ id: Number(selectedProvinceId.value) });
    } else {
      loadData();
    }
    return;
  }
  const constituency = districts.value.find((c) => c.id === Number(districtId));
  if (constituency) {
    loadData({ id: constituency.id, districtNumber: constituency.districtNumber });
  }
});

watch(selectedProvinceId, (provId) => {
  if (!provId) {
    loadData();
  } else {
    loadData({ id: Number(provId) });
  }
});


onMounted(async () => {
  await constituencyStore.fetchConstituencies();
  await loadData();
});
</script>

<template>
  <div class="card">
    <h2 class="title">รายชื่อพรรคการเมือง</h2>

    <div class="top-bar">
      <div class="filters-bar">
        <CommonDropdown
          v-model="selectedProvinceId"
          :options="provinceOptions"
          placeholder="เลือกจังหวัด"
          @change="handleProvinceChange"
        />
        <CommonDropdown
          v-model="selectedDistrictId"
          :key="selectedProvinceId ?? 'none'"
          :options="districtOptions"
          placeholder="เลือกเขต"
          :disabled="!selectedProvinceId"
        />
      </div>

      <div class="status-toggle">
        <span class="text-[24px] font-semibold">สถานะการปิดหีบ:</span>
        <button
          class="font-semibold text-[24px]"
          :class="{
            'text-green-500': isPollingOpen,
            'text-red-500': !isPollingOpen,
          }"
        >
          {{ isPollingOpen ? 'เปิด' : 'ปิด' }}
        </button>
      </div>
    </div>

    <div v-if="electionStore.isLoading" class="loading-state">
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="electionStore.error" class="error-state">
      <p>{{ electionStore.error }}</p>
      <button class="btn-retry" @click="() => loadData()">ลองอีกครั้ง</button>
    </div>

    <div v-else-if="filteredParties.length === 0" class="empty-state">
      <p>ไม่มีข้อมูลพรรคการเมือง</p>
    </div>

    <div v-else class="parties-list">
      <div class="list-header">
        <div class="col-num"></div>
        <div class="col-profile">พรรคการเมือง</div>
        <div class="col-policy">นโยบายพรรค</div>
        <div class="col-members">จำนวนผู้สมัคร</div>
        <div class="col-score">จำนวนผู้ชนะ</div>
        <div class="col-action"></div>
      </div>

      <PublicPartiesCardLayout
        v-for="(party, index) in filteredParties"
        :key="party.id"
        :index="index + 1"
        :party-name="party.name"
        :description="party.policy"
        :logo-url="party.logoUrl"
        :candidate-count="party.totalCandidates"
        :constituency-count="party.totalElectedMPs"
        @view-members="viewMembers(party.id)"
      />
    </div>
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

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 1.25rem;
}

/* Top bar */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Status toggle */
.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.toggle-btn {
  padding: 4px 14px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: var(--text-muted, #a0aec0);
}

.toggle-btn.active {
  background-color: var(--primary, #6366f1);
  color: white;
}

/* List layout */
.parties-list {
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  font-size: 0.82rem;
  font-weight: 600;
}

.col-num {
  width: 30px;
  text-align: center;
  flex-shrink: 0;
}

.col-profile {
  flex: 0 0 180px;
  min-width: 140px;
}

.col-policy {
  flex: 1;
  min-width: 0;
}

.col-members {
  width: 100px;
  text-align: center;
  flex-shrink: 0;
}

.col-score {
  width: 90px;
  text-align: center;
  flex-shrink: 0;
}

.col-action {
  width: 160px;
  flex-shrink: 0;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.error-state {
  color: var(--error);
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background-color: var(--primary-dark);
}

.empty-state p {
  font-size: 1rem;
}

/* ===== Responsive ===== */

@media (max-width: 1024px) {
  .card {
    padding: 1.25rem;
  }

  .col-action {
    width: 140px;
  }
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }

  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-bar {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .filters-bar :deep(.form-group) {
    width: 100%;
  }

  .status-toggle {
    font-size: 0.9rem;
  }

  .list-header {
    display: none;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 18px;
  }

  .btn-retry {
    width: 100%;
  }
}
</style>
