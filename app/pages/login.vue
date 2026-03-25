<template>
  <div class="flex min-h-[70vh] items-center justify-center">
    <div class="card w-full max-w-sm bg-base-100 shadow-lg slide-up">
      <div class="card-body">
        <div class="flex flex-col items-center gap-3 mb-2">
          <span
            class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-content text-lg font-black"
          >
            HC
          </span>
          <h2 class="card-title text-xl m-0">管理者ログイン</h2>
          <p class="text-sm text-base-content/50 m-0">パスワードを入力してください</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-control mt-4">
            <label class="floating-label w-full">
              <span>パスワード</span>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="パスワード"
                class="input input-bordered w-full"
                :class="{ 'input-error': error }"
                required
              />
            </label>
          </div>

          <div v-if="error" class="mt-3 text-sm text-error text-center">{{ error }}</div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary w-full" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              ログイン
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    const result = await client.auth.login({ password: password.value });
    if (result.success) {
      localStorage.setItem("auth_token", password.value);
      navigateTo("/");
    } else {
      error.value = "パスワードが正しくありません";
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}
</script>
