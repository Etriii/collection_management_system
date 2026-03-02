import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { getActiveAcademicPeriod } from "@api/academic"

export const useAcademicStore = defineStore("academic", () => {
  const academicYear = ref(null)
  const semester = ref(null)
  const isLoaded = ref(false)
  const isLoading = ref(false)

  const displayPeriod = computed(() =>
    academicYear.value && semester.value
      ? `${academicYear.value} - ${semester.value}`
      : "Not Set"
  )

  async function fetchActivePeriod(force = false) {
    if (isLoaded.value && !force) return

    try {
      isLoading.value = true
      const res = await getActiveAcademicPeriod()
      academicYear.value = res.data.academic_year
      semester.value = res.data.semester
      isLoaded.value = true
    } catch (error) {
      console.error("Failed to fetch academic period:", error)
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    academicYear.value = null
    semester.value = null
    isLoaded.value = false
  }

  return {
    academicYear,
    semester,
    isLoaded,
    isLoading,
    displayPeriod,
    fetchActivePeriod,
    reset,
  }
})