<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVoteStore } from '@/stores/vote.store';
import VoteView from './VoteView.vue';
import VoteResultView from './VoteResultView.vue';

const voteStore = useVoteStore();

const isInitializing = ref(true);

const showResult = computed(() => {
  return voteStore.ballot?.constituency.isClosed === true;
});

onMounted(async () => {
  try {
    await Promise.all([
      voteStore.getMyVote(),
      voteStore.getBallot(),
    ]);
  } catch {
  } finally {
    isInitializing.value = false;
  }
});
</script>

<template>
  <div>
    <div v-if="isInitializing" class="flex justify-center py-20">
      <p class="text-gray-500">กำลังโหลดข้อมูล...</p>
    </div>
    <VoteResultView v-else-if="showResult" />
    <VoteView v-else />
  </div>
</template>
