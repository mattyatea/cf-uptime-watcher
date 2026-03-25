<template>
  <div class="min-h-screen bg-base-200">
    <!-- Navbar -->
    <header
      class="navbar-wrapper bg-base-100/95 border-b border-base-300 sticky top-0 z-50 backdrop-blur-sm"
    >
      <div class="container mx-auto max-w-5xl px-4">
        <div class="flex items-center justify-between h-14">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <span class="logo-mark">HC</span>
            <span class="hidden sm:inline">CF Healthcheck</span>
          </NuxtLink>
          <nav class="flex items-center gap-1">
            <button
              class="nav-link text-base-content/60 hover:text-base-content hover:bg-base-200"
              :title="themeLabel"
              @click="toggleTheme"
            >
              {{ theme === "dark" ? "\u2600" : "\u263E" }}
            </button>
            <template v-if="isLoggedIn">
              <NuxtLink
                to="/settings"
                class="nav-link text-base-content/60 hover:text-base-content hover:bg-base-200"
              >
                設定
              </NuxtLink>
              <button
                class="nav-link text-base-content/60 hover:text-base-content hover:bg-base-200"
                @click="logout"
              >
                ログアウト
              </button>
            </template>
            <NuxtLink
              v-else
              to="/login"
              class="nav-link text-base-content/60 hover:text-base-content hover:bg-base-200"
            >
              ログイン
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto max-w-5xl p-4 pt-6 fade-in">
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

const { theme, init: initTheme, toggle: toggleTheme } = useTheme();
const themeLabel = computed(() => (theme.value === "dark" ? "ライトモード" : "ダークモード"));

onMounted(() => {
  token.value = localStorage.getItem("auth_token");
  initTheme();
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
.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: var(--status-up);
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
}

.nav-link {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  background: none;
  cursor: pointer;
  text-decoration: none;
  transition:
    color 0.15s,
    background 0.15s;
}
</style>
