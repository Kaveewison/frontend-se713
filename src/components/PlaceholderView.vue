<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const title = computed(() => {
  if (route.path.includes('/vote')) return 'ลงคะแนนเสียง/ดูผลคะแนน';
  if (route.path.includes('/admin')) return 'ระบบบริหารการเลือกตั้ง';
  return 'ระบบกำลังพัฒนา';
});
</script>

<template>
  <div class="card placeholder-container">
    <div class="header">
      <h2 class="title">{{ title }}</h2>
      <p class="subtitle">อยู่ระหว่างการพัฒนา (Under Construction)</p>
    </div>

    <div class="empty-state">
      <div class="empty-icon">🚧</div>
      <h3>หน้านี้ยังไม่เปิดใช้งาน</h3>
      <p>ระบบอยู่ในช่วงนำเสนอ Demo เฉพาะฟังก์ชันที่ระบุใน Requirement</p>
    </div>
  </div>
</template>

<style scoped>
.placeholder-container {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 3rem;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-main);
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 4px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.2rem;
  color: var(--text-main);
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.95rem;
  max-width: 400px;
}
</style>
