<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Page Title -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Student Payment Status Distribution</h1>
      <p class="text-gray-500">Overview of payment completion across all students</p>
    </div>
    
    <!-- Status Cards Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Fully Paid Card -->
      <div class="bg-green-50 rounded-xl p-8 shadow-sm border border-green-100">
        <div class="text-center">
          <div class="text-6xl font-bold text-green-600 mb-4">967</div>
          <div class="text-2xl font-semibold text-green-700 mb-2">Fully Paid</div>
          <div class="text-lg text-green-600">77.5% of students</div>
        </div>
      </div>
      
      <!-- Partially Paid Card -->
      <div class="bg-blue-50 rounded-xl p-8 shadow-sm border border-blue-100">
        <div class="text-center">
          <div class="text-6xl font-bold text-blue-600 mb-4">156</div>
          <div class="text-2xl font-semibold text-blue-700 mb-2">Partially Paid</div>
          <div class="text-lg text-blue-600">12.5% of students</div>
        </div>
      </div>
      
      <!-- Overdue Card -->
      <div class="bg-orange-50 rounded-xl p-8 shadow-sm border border-orange-100">
        <div class="text-center">
          <div class="text-6xl font-bold text-orange-600 mb-4">84</div>
          <div class="text-2xl font-semibold text-orange-700 mb-2">Overdue</div>
          <div class="text-lg text-orange-600">6.7% of students</div>
        </div>
      </div>
      
      <!-- Not Started Card -->
      <div class="bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-200">
        <div class="text-center">
          <div class="text-6xl font-bold text-gray-700 mb-4">40</div>
          <div class="text-2xl font-semibold text-gray-800 mb-2">Not Started</div>
          <div class="text-lg text-gray-600">3.2% of students</div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'StudentsDashboard',
  data() {
    return {
      // Data for the status cards
      statusData: {
        fullyPaid: { count: 967, percentage: 77.5, color: 'green' },
        partiallyPaid: { count: 156, percentage: 12.5, color: 'blue' },
        overdue: { count: 84, percentage: 6.7, color: 'orange' },
        notStarted: { count: 40, percentage: 3.2, color: 'gray' }
      }
    };
  },
  computed: {
    totalStudents() {
      return this.statusData.fullyPaid.count + 
             this.statusData.partiallyPaid.count + 
             this.statusData.overdue.count + 
             this.statusData.notStarted.count;
    }
  },
  mounted() {
    // Trigger progress bar animations
    setTimeout(() => {
      const progressBars = document.querySelectorAll('.bg-green-500, .bg-blue-500, .bg-orange-500, .bg-gray-500');
      progressBars.forEach(bar => {
        bar.style.transition = 'width 1s ease-out';
      });
    }, 100);
  }
};
</script>

<style scoped>
/* Custom animations for the progress bars */
.bg-green-500, .bg-blue-500, .bg-orange-500, .bg-gray-500 {
  transition: width 0s;
}
</style>
