<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Payment Method Distribution Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-2">Payment Method Distribution</h2>
        <p class="text-sm text-gray-500 mb-6">How students prefer to pay their fees</p>
        
        <!-- Donut Chart -->
        <div class="flex justify-center mb-6">
          <div class="relative w-48 h-48">
            <svg class="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" stroke-width="8"/>
              
              <!-- Face to Face Cash - 45% -->
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#10b981" 
                stroke-width="8"
                stroke-dasharray="113.1 251.2"
                stroke-dashoffset="0"
                class="transition-all duration-1000 ease-out"
              />
              
              <!-- GCash - 35% -->
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#3b82f6" 
                stroke-width="8"
                stroke-dasharray="87.96 251.2"
                stroke-dashoffset="-113.1"
                class="transition-all duration-1000 ease-out"
              />
              
              <!-- Bank Transfer - 15% -->
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#8b5cf6" 
                stroke-width="8"
                stroke-dasharray="37.7 251.2"
                stroke-dashoffset="-201.06"
                class="transition-all duration-1000 ease-out"
              />
              
              <!-- Online Banking - 5% -->
              <circle 
                cx="50" cy="50" r="40" 
                fill="none" 
                stroke="#f59e0b" 
                stroke-width="8"
                stroke-dasharray="12.57 251.2"
                stroke-dashoffset="-238.76"
                class="transition-all duration-1000 ease-out"
              />
            </svg>
            
            <!-- Center text -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-800">₱3,604,456</div>
                <div class="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Legend -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span class="text-sm font-medium text-gray-700">Face to Face Cash</span>
            </div>
            <span class="text-sm font-medium text-gray-700">45% (₱1,567,890)</span>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span class="text-sm font-medium text-gray-700">GCash</span>
            </div>
            <span class="text-sm font-medium text-gray-700">35% (₱1,234,567)</span>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <span class="text-sm font-medium text-gray-700">Bank Transfer</span>
            </div>
            <span class="text-sm font-medium text-gray-700">15% (₱567,890)</span>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <span class="text-sm font-medium text-gray-700">Online Banking</span>
            </div>
            <span class="text-sm font-medium text-gray-700">5% (₱234,567)</span>
          </div>
        </div>
      </div>
      
      <!-- Daily Payment Volume Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-2">Daily Payment Volume</h2>
        <p class="text-sm text-gray-500 mb-6">Number of transactions per day this month</p>
        
        <!-- Line Chart -->
        <div class="relative h-64">
          <!-- Y-axis labels -->
          <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>
          
          <!-- Grid lines -->
          <div class="absolute left-8 right-0 top-0 h-full">
            <div class="h-full flex flex-col justify-between">
              <div v-for="n in 5" :key="n" class="border-t border-gray-200"></div>
            </div>
          </div>
          
          <!-- Chart area -->
          <div class="ml-8 h-full relative">
            <svg class="w-full h-full" viewBox="0 0 400 200">
              <!-- Line path -->
              <path 
                :d="linePath" 
                fill="none" 
                stroke="#3b82f6" 
                stroke-width="2"
                class="transition-all duration-1000 ease-out"
              />
              
              <!-- Data points -->
              <circle 
                v-for="(point, index) in chartPoints" 
                :key="index"
                :cx="point.x" 
                :cy="point.y" 
                r="4" 
                fill="#3b82f6"
                class="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
          
          <!-- X-axis labels -->
          <div class="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-500">
            <span v-for="n in 13" :key="n">{{ n }}</span>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'PaymentDashboard',
  data() {
    return {
      dailyPayments: [25, 45, 65, 30, 90, 55, 75, 40, 85, 50, 65, 80, 70]
    };
  },
  computed: {
    chartPoints() {
      const maxValue = Math.max(...this.dailyPayments);
      const width = 400;
      const height = 200;
      const padding = 20;
      
      return this.dailyPayments.map((value, index) => ({
        x: padding + (index * (width - 2 * padding)) / (this.dailyPayments.length - 1),
        y: height - padding - ((value / maxValue) * (height - 2 * padding))
      }));
    },
    linePath() {
      if (this.chartPoints.length === 0) return '';
      
      let path = `M ${this.chartPoints[0].x} ${this.chartPoints[0].y}`;
      
      for (let i = 1; i < this.chartPoints.length; i++) {
        const point = this.chartPoints[i];
        path += ` L ${point.x} ${point.y}`;
      }
      
      return path;
    }
  },
  mounted() {
    // Trigger animations after component is mounted
    setTimeout(() => {
      const circles = document.querySelectorAll('circle[stroke]');
      circles.forEach(circle => {
        circle.style.strokeDasharray = circle.getAttribute('stroke-dasharray');
        circle.style.strokeDashoffset = circle.getAttribute('stroke-dashoffset');
      });
    }, 100);
  }
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>