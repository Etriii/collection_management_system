<script setup lang="ts">
import { ref, computed, type Component } from "vue"
import {
  Plus,
  Search,
  Trash2,
  //   CheckCircle,
  Clock,
  BookOpen,
  Users,
  Trophy,
  CreditCard
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
  <div class="min-h-screen bg-gray-50/50">
    <div class="border-b border-gray-200 bg-white/95 backdrop-blur">
      <div class="container flex h-16 items-center justify-between px-4">
        <div>
          <p class="text-sm text-gray-600">Manage fee types and collection settings</p>
        </div>
        <button class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          @click="isDialogOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          New Collection
        </button>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="p-4 bg-white rounded-xl shadow">
          <div class="text-2xl font-bold">{{ collections.length }}</div>
          <p class="text-xs text-gray-500">Total Collections</p>
        </div>
        <div class="p-4 bg-white rounded-xl shadow">
          <div class="text-2xl font-bold text-green-600">{{ stats.activeCount }}</div>
          <p class="text-xs text-gray-500">Active</p>
        </div>
        <div class="p-4 bg-white rounded-xl shadow">
          <div class="text-2xl font-bold text-blue-600">{{ stats.completedCount }}</div>
          <p class="text-xs text-gray-500">Completed</p>
        </div>
        <div class="p-4 bg-white rounded-xl shadow">
          <div class="text-2xl font-bold text-purple-600">₱{{ stats.totalCollected.toLocaleString() }}</div>
          <p class="text-xs text-gray-500">Total Collected</p>
        </div>
      </div>

      <!-- Search + Filters -->
      <div class="mb-6 p-4 bg-white rounded-xl shadow">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input v-model="searchQuery" class="pl-10 w-full border rounded-lg py-2 px-3"
                placeholder="Search collections by name or description..." />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              v-for="f in ['all', 'active', 'completed', 'draft', 'academic', 'facilities', 'activities', 'miscellaneous']"
              :key="f" @click="activeFilter = f as any" class="px-3 py-1.5 rounded-md border text-sm"
              :class="activeFilter === f ? 'bg-blue-100 border-blue-500 text-blue-700' : 'hover:bg-gray-100'">
              {{ (f as string).charAt(0).toUpperCase() + (f as string).slice(1) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Collections Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="c in filteredCollections" :key="c.id"
          class="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
          <div class="p-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <component :is="c.icon" class="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold">{{ c.name }}</h3>
                  <p class="text-sm text-gray-600">{{ c.description }}</p>
                </div>
              </div>
              <span class="px-2 py-1 text-xs rounded-full" :class="c.status === 'active'
                ? 'bg-green-100 text-green-800'
                : c.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'">
                {{ c.status }}
              </span>
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
                  <Clock class="mr-1 h-3 w-3" />
                  {{ new Date(c.dueDate).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-2 p-4 border-t">
            <button class="flex-1 px-3 py-2 rounded-md border hover:bg-gray-50" @click="console.log('Edit', c.id)">
              Edit
            </button>
            <button class="px-3 py-2 rounded-md border text-red-600 hover:bg-red-50" @click="handleDelete(c.id)"
              aria-label="Delete" title="Delete">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredCollections.length === 0" class="mt-8 p-12 text-center bg-white rounded-xl shadow">
        <CreditCard class="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
        <p class="text-gray-600 mb-4">No categories match your current search and filter.</p>
        <button class="px-4 py-2 border rounded-md hover:bg-gray-50" @click="
          searchQuery = '';
        activeFilter = 'all';
        ">
          Clear Filters
        </button>
      </div>
    </div>

    <div v-if="isDialogOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow p-6 w-full max-w-lg">
        <h2 class="text-lg font-semibold mb-1">Create New Collection Category</h2>
        <p class="text-sm text-gray-600 mb-4">Set up a new fee type or collection category</p>

        <form class="space-y-4" @submit.prevent="handleCreate">
          <div>
            <label class="block mb-1 text-sm font-medium">Collection Name</label>
            <input v-model="newCollection.name" class="w-full border rounded-lg px-3 py-2" placeholder="Library Fee"
              required />
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium">Amount (₱)</label>
            <input v-model.number="newCollection.amount" type="number" min="1"
              class="w-full border rounded-lg px-3 py-2" required />
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium">Due Date</label>
            <input v-model="newCollection.dueDate" type="date" class="w-full border rounded-lg px-3 py-2" required />
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium">Description</label>
            <textarea v-model="newCollection.description" class="w-full border rounded-lg px-3 py-2"
              placeholder="Describe what this fee covers..." />
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium">Category</label>
            <select v-model="newCollection.category" class="w-full border rounded-lg px-3 py-2">
              <option value="academic">Academic</option>
              <option value="facilities">Facilities</option>
              <option value="activities">Activities</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="px-4 py-2 border rounded-md hover:bg-gray-50" @click="isDialogOpen = false">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
