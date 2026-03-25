<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- Main content -->
    <main class="container mx-auto max-w-5xl p-4 pt-6 fade-in flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script lang="ts" setup></script>

<style>
body {
  margin: 0;
}
* {
  box-sizing: border-box;
}
</style>
