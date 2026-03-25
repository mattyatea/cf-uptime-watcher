<template>
  <AppModal :open="open" title="モニター編集" @close="$emit('close')">
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <AppInput v-model="form.name" label="名前" required />
      </div>

      <div class="mb-4">
        <AppInput
          v-model="form.url"
          label="URL"
          type="url"
          placeholder="https://example.com"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <AppSelect v-model="form.method" label="メソッド" :options="methodOptions" />

        <AppInput
          v-model="form.timeout"
          label="タイムアウト (秒)"
          type="number"
          required
          min="1"
          max="120"
        />
      </div>

      <div class="mb-4">
        <AppInput
          v-model="form.expectedStatus"
          label="期待ステータス"
          type="number"
          min="100"
          max="599"
        />
      </div>

      <div v-if="form.method === 'POST'">
        <div class="mb-4">
          <AppSelect
            :model-value="selectedContentType"
            label="Content-Type"
            :options="contentTypeOptions"
            @update:model-value="handleContentTypeChange"
          />
        </div>

        <div class="mb-4">
          <AppCollapsible title="リクエストボディ">
            <AppTextarea
              v-model="form.body"
              label="ボディ"
              :rows="4"
              placeholder='{"key": "value"}'
              monospace
            />
          </AppCollapsible>
        </div>
      </div>

      <div class="mb-4">
        <AppCollapsible title="カスタムヘッダー">
          <AppTextarea
            v-model="form.headers"
            label="ヘッダー"
            :rows="3"
            placeholder='{"Authorization": "Bearer token"}'
            monospace
          />
        </AppCollapsible>
      </div>

      <div class="form-control mb-4">
        <AppToggle v-model="form.active" label="有効" />
      </div>

      <AppAlert v-if="error" variant="error" class="text-sm mb-4">{{ error }}</AppAlert>

      <div class="modal-action">
        <AppButton variant="ghost" @click="$emit('close')">キャンセル</AppButton>
        <AppButton type="submit" variant="primary" :loading="loading">保存</AppButton>
      </div>
    </form>
  </AppModal>
</template>

<script lang="ts" setup>
import type { MonitorWithStatus } from "./types";

const props = defineProps<{ open: boolean; monitor: MonitorWithStatus | null }>();
const emit = defineEmits<{ close: []; updated: [] }>();

const form = ref({
  name: "",
  url: "",
  method: "GET",
  timeout: "30",
  expectedStatus: "200",
  headers: "",
  body: "",
  active: true,
});

const loading = ref(false);
const error = ref("");

const headersRef = computed({
  get: () => form.value.headers,
  set: (v: string) => {
    form.value.headers = v;
  },
});

const { parseHeaders, selectedContentType, handleContentTypeChange, CONTENT_TYPE_OPTIONS } =
  useHeadersEditor(headersRef);

const methodOptions = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
];

const contentTypeOptions = [
  { value: "", label: "なし" },
  ...CONTENT_TYPE_OPTIONS.map((ct) => ({ value: ct, label: ct })),
  { value: "custom", label: "カスタム / ヘッダーJSONを保持" },
];

watch(
  () => props.monitor,
  (m) => {
    if (m) {
      form.value = {
        name: m.name,
        url: m.url,
        method: m.method,
        timeout: String(m.timeout),
        expectedStatus: String(m.expectedStatus),
        headers: m.headers ?? "",
        body: m.body ?? "",
        active: m.active,
      };
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  if (!props.monitor) return;
  error.value = "";
  loading.value = true;
  try {
    parseHeaders(form.value.headers);

    await client.monitor.update({
      id: props.monitor.id,
      name: form.value.name,
      url: form.value.url,
      method: form.value.method as "GET" | "POST",
      timeout: Number(form.value.timeout),
      expectedStatus: Number(form.value.expectedStatus),
      headers: form.value.headers || null,
      body: form.value.method === "POST" ? form.value.body || null : null,
      active: form.value.active,
    });
    emit("updated");
    emit("close");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "更新に失敗しました";
  } finally {
    loading.value = false;
  }
}
</script>
