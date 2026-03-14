<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  partyName: string;
  description: string;
  logoUrl: string;
  candidateCount: number;
  constituencyCount: number;
  index: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  viewMembers: [];
}>();

const imgFailed = ref(false);
</script>

<template>
  <div class="party-row">
    <!-- ลำดับ -->
    <div class="col-num">{{ index }}</div>

    <!-- โลโก้ + ชื่อ -->
    <div class="col-profile">
      <div class="logo-wrap">
        <img
          v-if="props.logoUrl?.trim() && !imgFailed"
          :src="props.logoUrl"
          :alt="`${props.partyName} logo`"
          class="party-logo"
          @error="imgFailed = true"
        />
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" class="placeholder-icon">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
      <span class="party-name">{{ partyName }}</span>
    </div>

    <!-- นโยบาย -->
    <div class="col-policy">{{ description }}</div>

    <!-- จำนวนสมาชิก -->
    <div class="col-members">{{ candidateCount }}</div>

    <!-- คะแนน -->
    <div class="col-score">{{ constituencyCount }}</div>

    <!-- ปุ่ม -->
    <div class="col-action">
      <button class="btn-view" @click="emit('viewMembers')">
        ดูข้อมูลสมาชิกพรรค
      </button>
    </div>
  </div>
</template>

<style scoped>
.party-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.15s;
}

.party-row:last-child {
  border-bottom: none;
}

.party-row:hover {
  background-color: #fafafb;
}

/* ลำดับ */
.col-num {
  width: 30px;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary, #6b7280);
}

/* โลโก้ + ชื่อ */
.col-profile {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 0 0 180px;
  min-width: 140px;
}

.logo-wrap {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: var(--radius-sm, 6px);
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  width: 32px;
  height: 32px;
}

.party-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  display: block;
}

.party-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-main);
  word-break: break-word;
}

/* นโยบาย */
.col-policy {
  flex: 1;
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* จำนวนสมาชิก */
.col-members {
  width: 100px;
  text-align: center;
  flex-shrink: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-main);
}

/* คะแนน */
.col-score {
  width: 90px;
  text-align: center;
  flex-shrink: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-main);
}

/* ปุ่ม */
.col-action {
  width: 160px;
  flex-shrink: 0;
  text-align: right;
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

.btn-view:hover {
  background-color: var(--primary-hover, #4f46e5);
}

/* ===== Responsive ===== */

@media (max-width: 1024px) {
  .col-action {
    width: 140px;
  }

  .col-profile {
    flex: 0 0 160px;
  }
}

@media (max-width: 768px) {
  .party-row {
    display: grid;
    grid-template-columns: 28px 1fr;
    grid-template-rows: auto auto auto;
    gap: 0.35rem 0.5rem;
    padding: 1rem 0.75rem;
    align-items: center;
  }

  /* ลำดับ - แถวที่ 1 */
  .col-num {
    grid-row: 1 / 3;
    grid-column: 1;
    width: auto;
    font-size: 0.9rem;
    align-self: start;
    padding-top: 6px;
  }

  /* โลโก้ + ชื่อ - แถวที่ 1 */
  .col-profile {
    grid-row: 1;
    grid-column: 2;
    flex: unset;
    min-width: 0;
  }

  .party-name {
    white-space: normal;
    word-break: break-word;
  }

  /* นโยบาย - แถวที่ 2 */
  .col-policy {
    grid-row: 2;
    grid-column: 2;
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
    font-size: 0.82rem;
    color: var(--text-muted, #a0aec0);
  }

  /* สมาชิก + คะแนน + ปุ่ม - แถวที่ 3 */
  .col-members,
  .col-score {
    grid-row: 3;
    grid-column: 2;
    width: auto;
    text-align: left;
    font-size: 0.82rem;
  }

  /* ใช้ flex สำหรับแถวล่าง */
  .party-row {
    grid-template-rows: auto auto auto;
  }

  .col-members {
    grid-row: 3;
    grid-column: 2;
    display: none;
  }

  .col-score {
    display: none;
  }

  .col-action {
    grid-row: 3;
    grid-column: 2;
    width: 100%;
    text-align: left;
  }

  .btn-view {
    width: 100%;
    text-align: center;
    padding: 8px 14px;
  }
}
</style>
