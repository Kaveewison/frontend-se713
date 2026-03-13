<script setup lang="ts">
import { computed } from 'vue';
import type { BallotCandidate } from '@/types/dto/vote.dto';

// Props definition
const props = defineProps<{
  candidate: BallotCandidate;
  isSelected: boolean;
  isPreviouslyVoted?: boolean;
}>();

// Events definition
const emit = defineEmits<{
  select: [candidateId: number];
}>();

// Computed properties for avatar and logo
const candidateAvatar = computed(() => {
  if (props.candidate.imageUrl) return props.candidate.imageUrl;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.candidate.firstName}`;
});

const partyLogo = computed(() => {
  if (props.candidate.party.logoUrl) return props.candidate.party.logoUrl;
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${props.candidate.party.name}`;
});

// Event handlers
const handleClick = () => {
  emit('select', props.candidate.id);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('select', props.candidate.id);
  }
};
</script>

<template>
  <div
    class="grid grid-cols-2 sm:grid sm:grid-cols-[auto_1fr_auto_1fr_auto] sm:items-center gap-3 sm:gap-x-4 p-4 sm:p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 bg-white w-full"
    :class="{
      'border-[#5947ec] bg-[#5947ec]/10': isSelected,
      'border-emerald-400 bg-emerald-50': isPreviouslyVoted && !isSelected,
      'border-gray-300 hover:border-[#5947ec]/50 hover:bg-gray-50':
        !isSelected && !isPreviouslyVoted,
    }"
    role="button"
    :tabindex="0"
    :aria-pressed="isSelected"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div
      class="flex items-center col-span-1 row-span-1 sm:col-auto sm:row-auto"
    >
      <img
        :src="candidateAvatar"
        :alt="`${candidate.title}${candidate.firstName} ${candidate.lastName}`"
        class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 object-cover flex-shrink-0"
      />
    </div>

    <div
      class="flex items-center col-span-1 row-span-1 sm:col-auto sm:row-auto min-w-0"
    >
      <div class="min-w-0">
        <div
          class="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1 leading-tight"
        >
          {{ candidate.title }}{{ candidate.firstName }}
          {{ candidate.lastName }}
        </div>
        <div
          v-if="candidate.policy"
          class="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none"
        >
          {{ candidate.policy }}
        </div>
      </div>
    </div>

    <div
      class="flex items-center justify-end sm:justify-center col-span-1 row-span-1 sm:col-auto sm:row-auto"
    >
      <img
        :src="partyLogo"
        :alt="`โลโก้${candidate.party.name}`"
        class="w-10 h-10 sm:w-16 sm:h-16 object-contain flex-shrink-0"
      />
    </div>

    <div class="hidden sm:flex items-center min-w-0">
      <div class="text-sm sm:text-base font-semibold text-gray-900 truncate">
        {{ candidate.party.name }}
      </div>
    </div>

    <div class="flex items-center justify-end col-span-1 sm:col-auto">
      <div class="flex flex-col items-center gap-1">
        <div class="text-xs text-gray-500 whitespace-nowrap">หมายเลข</div>
        <div class="flex items-center gap-1.5">
          <div
            v-if="isPreviouslyVoted"
            class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              class="w-3 h-3 sm:w-3.5 sm:h-3.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div
            v-else
            class="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            :class="
              isSelected
                ? 'bg-[#5947ec] border-[#5947ec] text-white'
                : 'border-gray-300'
            "
          >
            <svg
              v-if="isSelected"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-3 h-3 sm:w-3.5 sm:h-3.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div
            class="font-prompt text-2xl sm:text-4xl font-bold text-center flex-shrink-0"
            :class="isPreviouslyVoted ? 'text-emerald-500' : 'text-[#5947ec]'"
          >
            {{ candidate.candidateNumber }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
