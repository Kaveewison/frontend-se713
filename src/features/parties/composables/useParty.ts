/**
 * Party Management Composable
 * 
 * Provides party management functionality with integrated toast notifications.
 * Wraps the party store with user-friendly error handling for all CRUD operations
 * and member management.
 * 
 * @module features/parties/composables/useParty
 * 
 * @example
 * ```typescript
 * const { parties, fetchParties, createParty } = useParty();
 * 
 * await fetchParties();
 * const success = await createParty({
 *   name: 'พรรคประชาธิปัตย์',
 *   logo: 'https://example.com/logo.png'
 * });
 * ```
 */

import { storeToRefs } from 'pinia';
import { usePartyStore } from '@/stores';
import { useToast } from '@/composables/useToast';
import type { CreatePartyDTO, UpdatePartyDTO } from '@/types/dto';

/**
 * Party Management Composable
 * 
 * Provides party CRUD operations and member management with automatic
 * toast notifications for success and error states.
 * 
 * @returns Party state and management functions
 * 
 * @example
 * ```typescript
 * const party = useParty();
 * 
 * // Fetch all parties
 * await party.fetchParties();
 * console.log(party.parties.value);
 * 
 * // Create new party
 * const success = await party.createParty({
 *   name: 'พรรคใหม่',
 *   logo: 'https://example.com/logo.png',
 *   description: 'คำอธิบายพรรค'
 * });
 * 
 * // Add member to party
 * await party.addMember(partyId, userId);
 * ```
 */
export function useParty() {
  const partyStore = usePartyStore();
  const { showSuccess, showError } = useToast();
  
  // Get reactive state from store using storeToRefs
  const { parties, selectedParty, partyMembers, isLoading, sortedParties } = storeToRefs(partyStore);

  /**
   * Fetches all parties from the API
   * 
   * Shows error toast with Thai message on failure.
   * 
   * @example
   * ```typescript
   * await fetchParties();
   * console.log(`Found ${parties.value.length} parties`);
   * ```
   */
  async function fetchParties(): Promise<void> {
    try {
      await partyStore.fetchParties();
    } catch (err: any) {
      showError(err.message || 'ไม่สามารถโหลดข้อมูลพรรคได้');
    }
  }

  /**
   * Fetches a specific party by ID
   * 
   * Sets the party as selectedParty and loads its members.
   * Shows error toast with Thai message on failure.
   * 
   * @param id - Party ID
   * 
   * @example
   * ```typescript
   * await fetchPartyById(1);
   * console.log(selectedParty.value?.name);
   * console.log(`Members: ${partyMembers.value.length}`);
   * ```
   */
  async function fetchPartyById(id: number): Promise<void> {
    try {
      await partyStore.fetchPartyById(id);
      await partyStore.fetchPartyMembers(id);
    } catch (err: any) {
      showError(err.message || 'ไม่สามารถโหลดข้อมูลพรรคได้');
    }
  }

  /**
   * Creates a new party
   * 
   * Shows success toast on successful creation.
   * Shows error toast with Thai message on failure.
   * 
   * @param data - Party creation data
   * @returns Promise resolving to true if creation successful, false otherwise
   * 
   * @example
   * ```typescript
   * const success = await createParty({
   *   name: 'พรรคประชาธิปัตย์',
   *   logo: 'https://example.com/logo.png',
   *   description: 'พรรคการเมืองเพื่อประชาชน',
   *   foundedDate: '2020-01-01'
   * });
   * ```
   */
  async function createParty(data: CreatePartyDTO): Promise<boolean> {
    try {
      await partyStore.createParty(data);
      showSuccess('สร้างพรรคสำเร็จ');
      return true;
    } catch (err: any) {
      showError(err.message || 'ไม่สามารถสร้างพรรคได้');
      return false;
    }
  }

  /**
   * Updates an existing party
   * 
   * Shows success toast on successful update.
   * Shows error toast with Thai message on failure.
   * 
   * @param id - Party ID to update
   * @param data - Updated party data (partial)
   * @returns Promise resolving to true if update successful, false otherwise
   * 
   * @example
   * ```typescript
   * const success = await updateParty(1, {
   *   name: 'พรรคประชาธิปัตย์ใหม่',
   *   description: 'คำอธิบายใหม่'
   * });
   * ```
   */
  async function updateParty(id: number, data: UpdatePartyDTO): Promise<boolean> {
    try {
      await partyStore.updateParty(id, data);
      showSuccess('อัพเดทข้อมูลพรรคสำเร็จ');
      return true;
    } catch (err: any) {
      showError(err.message || 'ไม่สามารถอัพเดทข้อมูลพรรคได้');
      return false;
    }
  }

  /**
   * Deletes a party
   * 
   * Shows success toast on successful deletion.
   * Shows error toast with Thai message on failure.
   * 
   * @param id - Party ID to delete
   * @returns Promise resolving to true if deletion successful, false otherwise
   * 
   * @example
   * ```typescript
   * const success = await deleteParty(1);
   * if (success) {
   *   router.push('/parties');
   * }
   * ```
   */
  async function deleteParty(id: number): Promise<boolean> {
    try {
      await partyStore.deleteParty(id);
      showSuccess('ลบพรรคสำเร็จ');
      return true;
    } catch (err: any) {
      showError(err.message || 'ไม่สามารถลบพรรคได้');
      return false;
    }
  }

  /**
   * Adds a user as a member to a party
   * 
   * Shows success toast on successful addition.
   * Shows error toast with Thai message on failure.
   * 
   * @param partyId - Party ID
   * @param userId - User ID to add as member
   * @returns Promise resolving to true if addition successful, false otherwise
   * 
   * @example
   * ```typescript
   * const success = await addMember(1, 123);
   * if (success) {
   *   console.log('Member added successfully');
   * }
   * ```
   */
  async function addMember(partyId: number, userId: number): Promise<boolean> {
    try {
      await partyStore.addMember(partyId, userId);
      showSuccess('เพิ่มสมาชิกสำเร็จ');
      return true;
    } catch (err: any) {
      showError(err.message || 'ไม่สามารถเพิ่มสมาชิกได้');
      return false;
    }
  }

  /**
   * Removes a user from party membership
   * 
   * Shows success toast on successful removal.
   * Shows error toast with Thai message on failure.
   * 
   * @param partyId - Party ID
   * @param userId - User ID to remove from membership
   * @returns Promise resolving to true if removal successful, false otherwise
   * 
   * @example
   * ```typescript
   * const success = await removeMember(1, 123);
   * if (success) {
   *   console.log('Member removed successfully');
   * }
   * ```
   */
  async function removeMember(partyId: number, userId: number): Promise<boolean> {
    try {
      await partyStore.removeMember(partyId, userId);
      showSuccess('ลบสมาชิกสำเร็จ');
      return true;
    } catch (err: any) {
      showError(err.message || 'ไม่สามารถลบสมาชิกได้');
      return false;
    }
  }

  return {
    // State from store
    /** Array of all parties */
    parties,
    /** Currently selected party (null if none selected) */
    selectedParty,
    /** Members of the selected party */
    partyMembers,
    /** Loading state for async operations */
    isLoading,
    /** Parties sorted alphabetically by name (Thai locale) */
    sortedParties,
    
    // Actions
    /** Fetch all parties */
    fetchParties,
    /** Fetch specific party by ID */
    fetchPartyById,
    /** Create new party */
    createParty,
    /** Update existing party */
    updateParty,
    /** Delete party */
    deleteParty,
    /** Add member to party */
    addMember,
    /** Remove member from party */
    removeMember,
  };
}
