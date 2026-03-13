import { onMounted, onUnmounted, Ref } from 'vue'

/**
 * Composable for detecting clicks outside a target element
 * 
 * @param target - Ref to the target HTML element
 * @param callback - Function to call when a click outside is detected
 * 
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { onClickOutside } from '@/composables/useClickOutside'
 * 
 * const menuRef = ref<HTMLElement | null>(null)
 * 
 * onClickOutside(menuRef, () => {
 *   console.log('Clicked outside!')
 * })
 * </script>
 * 
 * <template>
 *   <div ref="menuRef">Menu content</div>
 * </template>
 * ```
 */
export function onClickOutside(
  target: Ref<HTMLElement | null>,
  callback: () => void,
  excludeElements?: Ref<HTMLElement | null>[]
) {
  const handleClick = (event: MouseEvent) => {
    if (!target.value) return
    
    const clickedElement = event.target as Node
    
    // Check if click is inside target
    if (target.value.contains(clickedElement)) {
      return
    }
    
    // Check if click is inside any excluded elements
    if (excludeElements) {
      for (const excludeElement of excludeElements) {
        if (excludeElement.value?.contains(clickedElement)) {
          return
        }
      }
    }
    
    callback()
  }

  onMounted(() => {
    // Use mousedown to capture before click events
    document.addEventListener('mousedown', handleClick)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClick)
  })
}
