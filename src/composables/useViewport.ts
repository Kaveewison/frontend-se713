import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface ViewportBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

const DEFAULT_BREAKPOINTS: ViewportBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024,
}

export function useViewport(breakpoints: ViewportBreakpoints = DEFAULT_BREAKPOINTS) {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const height = ref(typeof window !== 'undefined' ? window.innerHeight : 768)

  const isMobile = computed(() => width.value < breakpoints.mobile)
  const isTablet = computed(() => width.value >= breakpoints.mobile && width.value < breakpoints.tablet)
  const isDesktop = computed(() => width.value >= breakpoints.desktop)

  const updateDimensions = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateDimensions)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
  })

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
  }
}
