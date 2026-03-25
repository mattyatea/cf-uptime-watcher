<template>
  <div class="min-h-screen bg-base-200">
    <!-- Navbar -->
    <header class="navbar-wrapper">
      <div class="container mx-auto max-w-3xl px-4">
        <div class="flex items-center justify-between h-14">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <span class="logo-mark">HC</span>
            <span class="hidden sm:inline">CF Healthcheck</span>
          </NuxtLink>
          <nav class="flex items-center gap-1">
            <template v-if="isLoggedIn">
              <button class="nav-link" @click="logout">ログアウト</button>
            </template>
            <NuxtLink v-else to="/login" class="nav-link">ログイン</NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto max-w-3xl p-4 pt-6 fade-in">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="py-8 text-center text-xs text-base-content/30">
      CF Healthcheck &mdash; Powered by Cloudflare Workers
    </footer>
  </div>
</template>

<script lang="ts" setup>
const token = ref<string | null>(null);

const isLoggedIn = computed(() => !!token.value);

onMounted(() => {
  token.value = localStorage.getItem("auth_token");
});

function logout() {
  localStorage.removeItem("auth_token");
  token.value = null;
  navigateTo("/login");
}
</script>

<style>
body {
  margin: 0;
}
* {
  box-sizing: border-box;
}
</style>

<style scoped>
.navbar-wrapper {
  background: oklch(var(--b1, 1 0 0) / 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid oklch(var(--bc, 0.2 0 0) / 0.08);
  position: sticky;
  top: 0;
  z-index: 50;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: #10b981;
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
}

.nav-link {
  font-size: 0.875rem;
  color: oklch(var(--bc, 0.2 0 0) / 0.6);
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  background: none;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;
}

.nav-link:hover {
  color: oklch(var(--bc, 0.2 0 0));
  background: oklch(var(--bc, 0.2 0 0) / 0.06);
}
</style>
