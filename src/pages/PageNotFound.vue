<template>
  <div class="flex flex-col items-center justify-center h-screen text-center bg-gray-900 text-white">
    <h1 class="text-6xl font-bold text-red-500">404</h1>
    <p class="text-lg text-gray-400 mt-2">Oops! The page you're looking for doesn't exist.</p>
    <p class="text-sm text-gray-500 mt-1">It might have been moved or deleted.</p>
    <RouterLink to="/" class="text-blue-400 underline mt-6 text-xl hover:text-blue-600 transition">
      Go Back Home
    </RouterLink>
  </div>
</template>
