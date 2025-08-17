<script setup lang="ts">
import { ref, computed, type Component } from "vue"
import {
  Plus,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Trophy,
  CreditCard,
  CalendarCheck,
  LayoutGrid,
  Wallet

} from "lucide-vue-next"

type Status = "active" | "completed" | "draft"
type Category = "academic" | "facilities" | "activities" | "miscellaneous"

interface Collection {
  id: string
  name: string
  description: string
  amount: number
  collected: number
  dueDate: string
  category: Category
  status: Status
  icon: Component
}

interface NewCollection {
  name: string
  description: string
  amount: number
  dueDate: string
  category: Category
  status: Status
}

const collections = ref<Collection[]>([
  {
    id: "1",
    name: "Library Fund",
    description: "For new books and digital resources",
    amount: 5000,
    collected: 3200,
    dueDate: "2024-12-15",
    category: "academic",
    status: "active",
    icon: BookOpen
  },
  {
    id: "2",
    name: "Sports Facility Upgrade",
    description: "Renovation of basketball court and gym",
    amount: 10000,
    collected: 6500,
    dueDate: "2024-11-30",
    category: "facilities",
    status: "active",
    icon: Users
  },
  {
    id: "3",
    name: "Scholarship Fund",
    description: "Support for underprivileged students",
    amount: 20000,
    collected: 20000,
    dueDate: "2025-01-31",
    category: "activities",
    status: "completed",
    icon: Trophy
  }
])

const searchQuery = ref("")
const activeFilter = ref<"all" | Status | Category>("all")
const isDialogOpen = ref(false)

const newCollection = ref<NewCollection>({
  name: "",
  description: "",
  amount: 0,
  dueDate: "",
  category: "academic",
  status: "active"
})

const filteredCollections = computed(() =>
  collections.value.filter((c) => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    const matchesFilter =
      activeFilter.value === "all" ||
      c.status === activeFilter.value ||
      c.category === activeFilter.value
    return matchesSearch && matchesFilter
  })
)

const stats = computed(() => {
  const active = collections.value.filter((c) => c.status === "active")
  const completed = collections.value.filter((c) => c.status === "completed")
  return {
    activeCount: active.length,
    completedCount: completed.length,
    totalAmount: collections.value.reduce((sum, c) => sum + c.amount, 0),
    totalCollected: collections.value.reduce((sum, c) => sum + c.collected, 0)
  }
})

const iconMap: Record<Category, Component> = {
  academic: BookOpen,
  facilities: Users,
  activities: Trophy,
  miscellaneous: CreditCard
}

function handleCreate() {
  if (!newCollection.value.name || !newCollection.value.amount || !newCollection.value.dueDate) {
    return
  }

  const item: Collection = {
    id: String(collections.value.length + 1),
    name: newCollection.value.name,
    description: newCollection.value.description,
    amount: newCollection.value.amount,
    collected: 0,
    dueDate: newCollection.value.dueDate,
    category: newCollection.value.category,
    status: newCollection.value.status,
    icon: iconMap[newCollection.value.category] ?? BookOpen
  }

  collections.value.push(item)

  isDialogOpen.value = false
  newCollection.value = {
    name: "",
    description: "",
    amount: 0,
    dueDate: "",
    category: "academic",
    status: "active"
  }
}

function handleDelete(id: string) {
  collections.value = collections.value.filter((c) => c.id !== id)
}
</script>


<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">

      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">Fee Collections</h1>
        <p class="text-sm text-gray-500 mt-1">Manage fee types and collection settings</p>
      </header>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
          <div>
            <div class="text-3xl font-bold">{{ collections.length }}</div>
            <p class="text-sm text-gray-500">Total Collections</p>
            <p class="text-xs text-gray-400">Number of Total Collection</p>
          </div>
          <LayoutGrid class="h-8 w-8 text-blue-500" />
        </div>
        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
          <div>
            <div class="text-3xl font-bold text-green-600">{{ stats.activeCount }}</div>
            <p class="text-sm text-gray-500">Active</p>
            <p class="text-xs text-gray-400">Number of Active Collections</p>
          </div>
          <CheckCircle class="h-8 w-8 text-green-500" />
        </div>
        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
          <div>
            <div class="text-3xl font-bold text-blue-600">{{ stats.completedCount }}</div>
            <p class="text-sm text-gray-500">Completed</p>
            <p class="text-xs text-gray-400">All Completed Collections</p>
          </div>
          <CalendarCheck class="h-8 w-8 text-blue-500" />
        </div>
        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
          <div>
            <div class="text-3xl font-bold text-purple-600">₱{{ stats.totalCollected.toLocaleString() }}</div>
            <p class="text-sm text-gray-500">Total Collected</p>
            <p class="text-xs text-gray-400">Overall Collected Payments</p>
          </div>
          <Wallet class="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <!-- main -->
      <div class="bg-white rounded-xl shadow p-6">

        <div class="flex justify-end mb-6">
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="isDialogOpen = true">
            <Plus class="mr-2 h-4 w-4" />
            New Collection
          </button>
        </div>

        <!-- search w/ filter -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input v-model="searchQuery"
              class="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search collections by name or description..." />
          </div>
          <div class="relative">
            <select v-model="activeFilter"
              class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
              <option value="academic">Academic</option>
              <option value="facilities">Facilities</option>
              <option value="activities">Activities</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- collections grid-->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="c in filteredCollections" :key="c.id"
            class="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-4">
                  <div class="p-3 bg-blue-100 rounded-xl">
                    <component :is="c.icon" class="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">{{ c.name }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ c.description }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Amount per student</span>
                  <span class="font-bold">₱{{ c.amount.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Collected</span>
                  <span class="font-semibold text-green-600">₱{{ c.collected.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Due Date</span>
                  <span class="font-medium flex items-center">
                    <Clock class="mr-1 h-3 w-3 text-gray-500" />
                    {{ new Date(c.dueDate).toLocaleDateString() }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Status</span>
                  <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="c.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : c.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-200 text-gray-800'">
                    {{ (c.status as string).charAt(0).toUpperCase() + (c.status as string).slice(1) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-2 p-4 border-t border-gray-100">
              <button class="flex-1 px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors"
                @click="console.log('Edit', c.id)">
                Edit
              </button>
              <button class="px-3 py-2 rounded-md border text-red-600 hover:bg-red-50 transition-colors"
                @click="handleDelete(c.id)" aria-label="Delete" title="Delete">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- if empty -->
        <div v-if="filteredCollections.length === 0" class="mt-8 p-12 text-center bg-white rounded-xl">
          <CreditCard class="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
          <p class="text-gray-600 mb-4">No categories match your current search and filter.</p>
          <button class="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors" @click="
            searchQuery = '';
          activeFilter = 'all';
          ">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- create new collection -->
    <div v-if="isDialogOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-2 text-gray-800">Create New Collection Category</h2>
        <p class="text-sm text-gray-600 mb-6">Set up a new fee type or collection category</p>

        <form class="space-y-4" @submit.prevent="handleCreate">
          <div>
            <label for="collectionName" class="block mb-1 text-sm font-medium text-gray-700">Collection Name</label>
            <input id="collectionName" v-model="newCollection.name"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Library Fee" required />
          </div>

          <div>
            <label for="amount" class="block mb-1 text-sm font-medium text-gray-700">Amount (₱)</label>
            <input id="amount" v-model.number="newCollection.amount" type="number" min="1"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required />
          </div>

          <div>
            <label for="dueDate" class="block mb-1 text-sm font-medium text-gray-700">Due Date</label>
            <input id="dueDate" v-model="newCollection.dueDate" type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required />
          </div>

          <div>
            <label for="description" class="block mb-1 text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" v-model="newCollection.description"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what this fee covers..." />
          </div>

          <div>
            <label for="category" class="block mb-1 text-sm font-medium text-gray-700">Category</label>
            <select id="category" v-model="newCollection.category"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="academic">Academic</option>
              <option value="facilities">Facilities</option>
              <option value="activities">Activities</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button"
              class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              @click="isDialogOpen = false">
              Cancel
            </button>
            <button type="submit"
              class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
