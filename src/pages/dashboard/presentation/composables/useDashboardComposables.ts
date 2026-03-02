import { onMounted, onUnmounted, watch } from "vue"
import type { useDashboardStore } from "../store/useDashboardStore"

let interval: ReturnType<typeof setInterval> | null = null

export function useDashboard(
  store: ReturnType<typeof useDashboardStore>
) {
  async function start() {
    if (!store.fetched) {
      await store.fetchDashboard()
    }
    // await store.fetchDashboard()

    if (!interval) {
      interval = setInterval(() => {
        store.fetchDashboard()
      // }, 138000) //2.5 mins
      }, 250000) //5 mins
      // }, 10000) //10 seconds
    }
  }

  function stop() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  watch(
    () => [store.academicYear, store.semester],
    () => {
      store.fetchDashboard()
    }
  )
}