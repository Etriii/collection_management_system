<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Page Title -->
    <div class="mb-2">
      <h1 class="text-2xl font-bold text-gray-800">{{ currentView === 'overview' ? 'Overview' : 'Collections' }}</h1>
    </div>
    
    <!-- Navigation -->
    <ReportsNavigation 
      :current-view="currentView" 
      @view-change="currentView = $event" 
    />

    <!-- Dynamic Content -->
    <Collections v-if="currentView === 'collections'" />
    <Payment_method v-else-if="currentView === 'payment-methods'" />
    <Students v-else-if="currentView === 'students'" />
    <Overdue v-else-if="currentView === 'overdue'" />
    <div v-else-if="currentView === 'overview'">
      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <!-- Total Revenue -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p class="text-gray-500 text-xs mb-1">Total Revenue</p>
          <div class="flex items-baseline">
            <h3 class="text-2xl font-bold">₱3,604,456</h3>
            <span class="ml-2 text-green-500 text-xs font-medium">+12.5%</span>
          </div>
        </div>

        <!-- Collection Rate -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p class="text-gray-500 text-xs mb-1">Collection Rate</p>
          <h3 class="text-2xl font-bold">78.3%</h3>
          <div class="mt-2 h-1 w-full bg-gray-200 rounded">
            <div class="h-1 bg-blue-600 rounded" style="width: 78.3%"></div>
          </div>
        </div>

        <!-- Avg Payment -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p class="text-gray-500 text-xs mb-1">Avg Payment</p>
          <h3 class="text-2xl font-bold">₱1,456</h3>
        </div>

        <!-- Overdue Amount -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p class="text-gray-500 text-xs mb-1">Overdue Amount</p>
          <div class="flex items-baseline">
            <h3 class="text-2xl font-bold text-red-600">₱234,567</h3>
            <span class="ml-2 text-red-500 text-xs">84 students</span>
          </div>
        </div>

        <!-- Pending Approvals -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p class="text-gray-500 text-xs mb-1">Pending Approvals</p>
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold text-orange-600">12</h3>
            <button class="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">Review</button>
          </div>
        </div>

        <!-- Total Students -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p class="text-gray-500 text-xs mb-1">Total Students</p>
          <div class="flex items-baseline">
            <h3 class="text-2xl font-bold">1,247</h3>
            <span class="ml-2 text-blue-600 text-xs">+12 new</span>
          </div>
        </div>
      </div>

      <!-- Chart Card -->
      <div class="bg-white p-6 rounded-xl shadow-sm">
        <div class="mb-4">
          <h3 class="font-bold text-lg">Monthly Collection Trends</h3>
          <p class="text-gray-500 text-sm">Revenue trends across different fee categories</p>
        </div>
        
        <!-- Chart Container -->
        <div class="flex">
          <!-- Y-axis -->
          <div class="flex flex-col justify-between text-xs text-gray-500 mr-2 pb-7">
            <div>3,600,000</div>
            <div>1,950,000</div>
            <div>1,300,000</div>
            <div>650,000</div>
            <div>0</div>
          </div>
          
          <!-- Chart Area -->
          <div class="flex-1">
            <div class="relative h-64">
              <!-- Grid Lines -->
              <div class="absolute inset-0 flex flex-col justify-between">
                <div v-for="n in 5" :key="n" class="border-t border-gray-200"></div>
              </div>
              
              <!-- Bars (stacked) -->
              <div class="absolute inset-0 flex items-end justify-between px-4">
                <div 
                  v-for="(bar, index) in stackedBars" 
                  :key="index" 
                  class="flex flex-col items-center w-1/5 bar-container"
                  :data-value="bar.totalFormatted"
                >
                  <div class="w-3/4 flex flex-col justify-end">
                    <div 
                      class="bar-segment bg-purple-500 rounded-t"
                      :style="{ height: bar.segments.others + '%' }"
                    ></div>
                    <div 
                      class="bar-segment bg-green-500"
                      :style="{ height: bar.segments.misc + '%' }"
                    ></div>
                    <div 
                      class="bar-segment bg-green-500"
                      :style="{ height: bar.segments.tuition + '%' }"
                    ></div>
                  </div>
                  <div class="text-xs text-gray-500 mt-2">{{ bar.month }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Collections from './Collections.vue'
import ReportsNavigation from './ReportsNavigation.vue'
import Payment_method from './Payment_method.vue'
import Students from './Students.vue'
import Overdue from './Overdue.vue'

export default {
  name: 'ReportsDashboard',
  components: {
    Collections,
    ReportsNavigation,
    Payment_method,
    Students,
    Overdue
  },
  data() {
    return {
      currentView: 'overview',
      barData: [
        { month: 'Aug 2024', segments: { tuition: 1300000, misc: 400000, others: 250000 }, total: 1950000 },
        { month: 'Sep 2024', segments: { tuition: 1300000, misc: 650000, others: 390000 }, total: 2340000 },
        { month: 'Oct 2024', segments: { tuition: 1300000, misc: 400000, others: 100000 }, total: 1800000 },
        { month: 'Nov 2024', segments: { tuition: 1400000, misc: 700000, others: 960000 }, total: 3060000 },
        { month: 'Dec 2024', segments: { tuition: 1100000, misc: 550000, others: 300000 }, total: 1950000 }
      ]
    }
  },
  computed: {
    stackedBars() {
      const maxTotal = Math.max(...this.barData.map(b => b.total)) || 1
      return this.barData.map(b => ({
        month: b.month,
        totalFormatted: `₱${b.total.toLocaleString()}`,
        segments: {
          tuition: Math.round((b.segments.tuition / maxTotal) * 100),
          misc: Math.round((b.segments.misc / maxTotal) * 100),
          others: Math.round((b.segments.others / maxTotal) * 100)
        }
      }))
    }
  },
  mounted() {
    // Initialize bar animations
    setTimeout(() => {
      const segments = document.querySelectorAll('.bar-segment');
      segments.forEach(seg => {
        seg.style.transition = 'height 0.8s ease-out';
      });
    }, 100);
  }
}
</script>

<style scoped>
.bar-segment {
  transition: height 0s;
}

.bar-container { position: relative; }
.bar-container::after {
  content: attr(data-value);
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 10;
}

.bar-container:hover::after { opacity: 1; }
</style>