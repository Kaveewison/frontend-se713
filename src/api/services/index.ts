/**
 * API Services
 *
 * This module has been deprecated. All API service functionality has been
 * merged into Pinia stores for better state management and reduced boilerplate.
 *
 * Please use the stores directly:
 * - useAuthStore() instead of authService
 * - useUserStore() instead of userService
 * - usePartyStore() instead of partyService
 * - useCandidateStore() instead of candidateService
 * - useVoteStore() instead of voteService
 * - useConstituencyStore() instead of constituencyService
 *
 * @module api/services
 * @deprecated Use Pinia stores instead
 */

// Re-export GetAllUsersParams type for backward compatibility
export type { GetAllUsersParams } from "@/stores/user.store";
