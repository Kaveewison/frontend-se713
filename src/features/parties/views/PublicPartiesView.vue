<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useElectionStore } from '@/stores';
import PublicPartiesCardLayout from '@/features/parties/components/PublicPartiesCardLayout.vue';

const router = useRouter();
const electionStore = useElectionStore();
const searchQuery = ref('');
const isPollingOpen = ref(true);

const filteredParties = computed(() => {
  if (!searchQuery.value) {
    return electionStore.partyOverview;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return electionStore.partyOverview.filter((party: any) =>
    party.name.toLowerCase().includes(query),
  );
});

const viewMembers = (partyId: number) => {
  router.push(`/parties/public/${partyId}`);
};

const loadData = async () => {
  try {
    await electionStore.fetchPartyOverview();
  } catch (error) {
    console.error('Failed to load party overview:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="card">
    <h2 class="title">รายชื่อพรรคการเมือง</h2>

    <div class="top-bar">
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
      <button class="btn-retry" @click="loadData">ลองอีกครั้ง</button>
    </div>

    <div v-else-if="filteredParties.length === 0" class="empty-state">
      <p>
        {{
          searchQuery ? 'ไม่พบพรรคการเมืองที่ค้นหา' : 'ไม่มีข้อมูลพรรคการเมือง'
        }}
      </p>
    </div>

    <div v-else class="parties-list">
      <div class="list-header">
        <div class="col-num"></div>
        <div class="col-profile">พรรคการเมือง</div>
        <div class="col-policy">นโยบายพรรค</div>
        <div class="col-members">จำนวนสมาชิก</div>
        <div class="col-score">คะแนนที่ได้</div>
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

.search-box {
  position: relative;
  width: 280px;
  max-width: 100%;
}

.search-input {
  width: 100%;
  padding: 8px 14px 8px 36px;
  border: 1px solid var(--border-input, #e2e8f0);
  border-radius: var(--radius-md);
  outline: none;
  font-size: 0.88rem;
  color: var(--text-main);
}

.search-input::placeholder {
  color: var(--text-muted, #a0aec0);
}

.icon-search {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-muted, #a0aec0);
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

  .search-box {
    width: 100%;
  }

  .list-header {
    display: none;
  }
}
</style>
