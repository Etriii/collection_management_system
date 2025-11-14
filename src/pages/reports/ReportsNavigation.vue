<template>
  <div class="mb-8">
    <nav class="flex space-x-3 text-sm font-medium">
      <button 
        @click="$emit('view-change', 'overview')" 
        :class="currentView === 'overview' ? 'bg-white text-gray-800' : 'bg-white text-gray-500 hover:text-blue-600'"
        class="rounded-md px-3 py-2 shadow-sm border border-gray-200"
      >
        Overview
      </button>
      <button 
        @click="$emit('view-change', 'collections')" 
        :class="currentView === 'collections' ? 'bg-white text-gray-800' : 'bg-white text-gray-500 hover:text-blue-600'"
        class="rounded-md px-3 py-2 shadow-sm border border-gray-200"
      >
        Collections
      </button>
      <button 
        @click="$emit('view-change', 'payment-methods')" 
        :class="currentView === 'payment-methods' ? 'bg-white text-gray-800' : 'bg-white text-gray-500 hover:text-blue-600'"
        class="rounded-md px-3 py-2 shadow-sm border border-gray-200"
      >
        Payment Methods
      </button>
      <button 
        @click="$emit('view-change', 'students')" 
        :class="currentView === 'students' ? 'bg-white text-gray-800' : 'bg-white text-gray-500 hover:text-blue-600'"
        class="rounded-md px-3 py-2 shadow-sm border border-gray-200"
      >
        Students
      </button>
      <button 
        @click="$emit('view-change', 'overdue')" 
        :class="currentView === 'overdue' ? 'bg-white text-gray-800' : 'bg-white text-gray-500 hover:text-blue-600'"
        class="rounded-md px-3 py-2 shadow-sm border border-gray-200"
      >
        Overdue
      </button>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'ReportsNavigation',
  props: {
    currentView: {
      type: String,
      required: true
    }
  },
  emits: ['view-change']
}
</script>
