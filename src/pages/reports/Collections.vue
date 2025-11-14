<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Collections by Grade Level -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="mb-6">
          <h3 class="font-bold text-lg text-gray-800">Collections by Grade Level</h3>
          <p class="text-gray-500 text-sm">Payment status across different grades</p>
        </div>
        
        <div class="space-y-6">
          <!-- Grade 10 -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="font-semibold text-gray-800">Grade 10</h4>
              <span class="text-sm text-gray-500">412 students</span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-green-600 font-semibold">Collected: ₱967,500</span>
                <span class="text-red-600 font-semibold">Pending: ₱234,500</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-green-500 h-3 rounded-full" style="width: 80.5%"></div>
              </div>
            </div>
          </div>

          <!-- Grade 11 -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="font-semibold text-gray-800">Grade 11</h4>
              <span class="text-sm text-gray-500">398 students</span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-green-600 font-semibold">Collected: ₱1,123,400</span>
                <span class="text-red-600 font-semibold">Pending: ₱189,200</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-green-500 h-3 rounded-full" style="width: 85.6%"></div>
              </div>
            </div>
          </div>

          <!-- Grade 12 -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="font-semibold text-gray-800">Grade 12</h4>
              <span class="text-sm text-gray-500">437 students</span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-green-600 font-semibold">Collected: ₱1,345,600</span>
                <span class="text-red-600 font-semibold">Pending: ₱167,800</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-green-500 h-3 rounded-full" style="width: 88.9%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performing Fee Categories -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="mb-6">
          <h3 class="font-bold text-lg text-gray-800">Top Performing Fee Categories</h3>
          <p class="text-gray-500 text-sm">Highest revenue-generating categories</p>
        </div>
        
        <div class="space-y-4">
          <!-- Tuition Fee -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-semibold text-gray-800">Tuition Fee</h4>
              <span class="text-lg font-bold text-gray-800">₱1,567,000</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">97% collection rate</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Excellent
              </span>
            </div>
          </div>

          <!-- Laboratory Fee -->
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-semibold text-gray-800">Laboratory Fee</h4>
              <span class="text-lg font-bold text-gray-800">₱434,000</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">89% collection rate</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Good
              </span>
            </div>
          </div>

          <!-- Miscellaneous Fee -->
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-semibold text-gray-800">Miscellaneous Fee</h4>
              <span class="text-lg font-bold text-gray-800">₱267,000</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">76% collection rate</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Average
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Collections',
  data() {
    return {
      // Component data can be added here if needed
    }
  }
}
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
</style>
