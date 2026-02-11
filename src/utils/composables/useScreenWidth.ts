import { ref, onMounted, onUnmounted } from 'vue'

export function useScreenWidth() {
  const width = ref<number>(window.innerWidth)

  const update = () => {
    width.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { width }
}
