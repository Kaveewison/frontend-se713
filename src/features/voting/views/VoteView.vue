<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';
import { useVoteStore } from '@/stores/vote.store';
import type { BallotCandidate } from '@/types/dto/vote.dto';

import VoteCard from './components/VoteCard.vue';

const authStore = useAuthStore();
const voteStore = useVoteStore();

const { currentUser } = storeToRefs(authStore);
const { ballot, isLoading, myVoteData } = storeToRefs(voteStore);

const previouslyVotedCandidateId = computed(() =>
  myVoteData.value?.vote?.candidate.id ?? null,
);

const selectedCandidate = ref<number | null>(null);
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);

const handleSelectCandidate = (candidateId: number) => {
  selectedCandidate.value = candidateId;
};

const confirmVote = () => {
  if (selectedCandidate.value !== null) {
    showConfirmModal.value = true;
  }
};

const submitVote = async () => {
  if (selectedCandidate.value === null) return;
  if (!currentUser.value?.id) return;

  showConfirmModal.value = false;

  try {
    await voteStore.submitVote({
      candidateId: selectedCandidate.value,
      voterId: currentUser.value.id,
    });

    await voteStore.getMyVote();

    showSuccessModal.value = true;
    setTimeout(() => {
      showSuccessModal.value = false;
    }, 1500);
  } catch (error) {
    console.error('Vote submission failed:', error);
  }
};

const selectedCandidateName = computed(() => {
  if (!selectedCandidate.value || !ballot.value) return '';
  const candidate = ballot.value.candidates.find(
    (c: BallotCandidate) => c.id === selectedCandidate.value,
  );
  return candidate
    ? `${candidate.title}${candidate.firstName} ${candidate.lastName}`
    : '';
});
</script>

<template>
  <div>
    <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <h2 v-if="ballot" class="text-xl sm:text-2xl font-semibold text-gray-900">
          ลงคะแนนเสียงผู้สมัครจังหวัด
          <span class="text-[#5947ec]">{{ ballot.constituency.province }}</span>
          เขตเลือกตั้งที่
          <span class="text-[#5947ec]">{{
            ballot.constituency.districtNumber
          }}</span>
        </h2>
        <h2 v-else class="text-xl sm:text-2xl font-semibold text-gray-900">
          กำลังโหลดข้อมูล...
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12 text-gray-600">
        <p>กำลังโหลดข้อมูลบัตรเลือกตั้ง...</p>
      </div>

      <!-- Voting Interface -->
      <template v-else-if="ballot && ballot.candidates.length > 0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <VoteCard
            v-for="candidate in ballot.candidates"
            :key="candidate.id"
            :candidate="candidate"
            :is-selected="selectedCandidate === candidate.id"
            :is-previously-voted="previouslyVotedCandidateId === candidate.id"
            @select="handleSelectCandidate"
          />
        </div>

        <div class="flex justify-center">
          <button
            class="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-3.5 text-base sm:text-lg font-medium rounded-full transition-colors duration-200"
            :class="
              selectedCandidate === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#5947ec] text-white hover:bg-[#4838db]'
            "
            :disabled="selectedCandidate === null"
            @click="confirmVote"
          >
            ยืนยันการลงคะแนน
          </button>
        </div>
      </template>

      <!-- No Candidates -->
      <div
        v-else-if="ballot && ballot.candidates.length === 0"
        class="text-center py-12 text-gray-600"
      >
        <p>ไม่มีผู้สมัครในเขตเลือกตั้งของคุณ</p>
      </div>

      <!-- Confirmation Modal -->
      <Teleport to="body">
        <div
          v-if="showConfirmModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-sm"
          @click.self="showConfirmModal = false"
        >
          <div
            class="bg-white p-6 sm:p-10 rounded-xl shadow-2xl max-w-md w-[90%] text-center"
          >
            <h3 class="text-2xl mb-4 text-gray-900">ยืนยันการลงคะแนนเสียง</h3>
            <p class="text-gray-600 mb-2">คุณต้องการลงคะแนนให้กับ</p>
            <p class="text-gray-600 mb-2">
              <strong>{{ selectedCandidateName }}</strong>
            </p>
            <p class="text-red-600 text-sm mb-8">
              หมายเหตุ: คุณสามารถเปลี่ยนคะแนนได้จนกว่าการเลือกตั้งจะปิด
            </p>
            <div class="flex justify-center gap-4">
              <button
                class="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                @click="showConfirmModal = false"
              >
                ยกเลิก
              </button>
              <button
                class="px-6 py-2.5 bg-[#5947ec] text-white font-medium rounded-lg hover:bg-[#4838db] transition-colors"
                @click="submitVote"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Success Modal -->
      <Teleport to="body">
        <div
          v-if="showSuccessModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-sm"
        >
          <div
            class="bg-white p-6 sm:p-10 rounded-xl shadow-2xl max-w-md w-[90%] text-center"
          >
            <h3 class="text-2xl mb-4 text-gray-900">ลงคะแนนเสียงสำเร็จ!</h3>
            <p class="text-gray-600 mb-2">ขอบคุณที่ใช้สิทธิ์ของคุณ</p>
            <p class="text-gray-600 mb-2">คุณสามารถเปลี่ยนคะแนนได้จนกว่าการเลือกตั้งจะปิด</p>
          </div>
        </div>
      </Teleport>
    </div>

    <div v-if="myVoteData?.vote" class="mt-6 rounded-xl p-6 sm:p-8 text-center">
      <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-relaxed">
        ท่านลงคะแนนให้กับผู้ลงสมัครหมายเลข 
        <span class="text-[#5947ec] text-xl sm:text-2xl">{{ myVoteData.vote.candidate.candidateNumber }}</span> 
        จังหวัด 
        <span class="text-[#5947ec]">{{ ballot?.constituency.province }}</span> 
        เขตเลือกตั้งที่ 
        <span class="text-[#5947ec]">{{ ballot?.constituency.districtNumber }}</span>
      </h3>
      <p class="text-gray-500 text-sm sm:text-base m-0">
        ท่านสามารถเปลี่ยนแปลงการลงคะแนนได้ตลอดเวลาเปิดหีบ
      </p>
    </div>
  </div>
</template>
