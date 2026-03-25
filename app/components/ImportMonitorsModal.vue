<template>
  <AppModal :open="open" title="モニターインポート" max-width="lg" @close="handleClose">
    <div v-if="!result" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">JSONファイル</span>
        </label>
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="file-input file-input-bordered w-full"
          @change="handleFileChange"
        />
      </div>

      <div class="form-control">
        <AppToggle v-model="skipDuplicates" label="重複をスキップ（URLで判定）" />
      </div>

      <div v-if="preview.length > 0" class="bg-base-200 rounded-lg p-4">
        <h4 class="font-medium text-sm mb-2">プレビュー ({{ preview.length }}件のモニター)</h4>
        <div class="max-h-48 overflow-y-auto space-y-1">
          <div
            v-for="(item, i) in preview.slice(0, 10)"
            :key="i"
            class="text-xs flex items-center gap-2"
          >
            <AppBadge variant="ghost" size="sm">{{ item.method }}</AppBadge>
            <span class="truncate">{{ item.name }}</span>
            <span class="text-base-content/50 truncate flex-1">{{ item.url }}</span>
          </div>
          <div v-if="preview.length > 10" class="text-xs text-base-content/50 text-center py-2">
            ... 他 {{ preview.length - 10 }}件
          </div>
        </div>
      </div>

      <AppAlert v-if="error" variant="error" class="text-sm">{{ error }}</AppAlert>

      <div class="modal-action">
        <AppButton variant="ghost" @click="handleClose">キャンセル</AppButton>
        <AppButton
          variant="primary"
          :disabled="!preview.length"
          :loading="loading"
          @click="handleImport"
        >
          インポート{{ preview.length > 0 ? ` (${preview.length})` : "" }}
        </AppButton>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex gap-4">
        <div class="stat bg-success/10 rounded-lg p-3 flex-1">
          <div class="stat-value text-success text-2xl">{{ result.imported }}</div>
          <div class="stat-title text-xs">インポート済</div>
        </div>
        <div class="stat bg-warning/10 rounded-lg p-3 flex-1">
          <div class="stat-value text-warning text-2xl">{{ result.skipped }}</div>
          <div class="stat-title text-xs">スキップ</div>
        </div>
        <div class="stat bg-error/10 rounded-lg p-3 flex-1">
          <div class="stat-value text-error text-2xl">{{ result.errors }}</div>
          <div class="stat-title text-xs">エラー</div>
        </div>
      </div>

      <div
        v-if="result.details.some((d) => d.status !== 'imported')"
        class="bg-base-200 rounded-lg p-4"
      >
        <h4 class="font-medium text-sm mb-2">詳細</h4>
        <div class="max-h-64 overflow-y-auto space-y-1">
          <div
            v-for="(detail, i) in result.details.filter((d) => d.status !== 'imported')"
            :key="i"
            class="text-xs flex items-center gap-2"
          >
            <AppBadge :variant="detail.status === 'skipped' ? 'warning' : 'error'" size="sm">
              {{ detail.status === "skipped" ? "スキップ" : "エラー" }}
            </AppBadge>
            <span class="truncate">{{ detail.name }}</span>
            <span v-if="detail.message" class="text-base-content/50 truncate flex-1">
              {{ detail.message }}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <AppButton variant="primary" @click="handleClose">完了</AppButton>
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts" setup>
interface MonitorInput {
  name: string;
  url: string;
  method: "GET" | "POST";
  headers?: string | null;
  body?: string | null;
  timeout?: number;
  expectedStatus?: number;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  details: Array<{
    name: string;
    status: "imported" | "skipped" | "error";
    message?: string;
  }>;
}

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
  imported: [];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const preview = ref<MonitorInput[]>([]);
const skipDuplicates = ref(true);
const loading = ref(false);
const error = ref("");
const result = ref<ImportResult | null>(null);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      reset();
    }
  },
);

function reset() {
  preview.value = [];
  error.value = "";
  result.value = null;
  loading.value = false;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

function handleClose() {
  emit("close");
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const content = event.target?.result as string;
      const parsed = JSON.parse(content);

      if (!Array.isArray(parsed)) {
        throw new Error("JSONはモニターの配列である必要があります");
      }

      preview.value = parsed.map((item: unknown) => {
        const m = item as Record<string, unknown>;
        if (!m.name || typeof m.name !== "string") {
          throw new Error("各モニターには 'name' 文字列が必要です");
        }
        if (!m.url || typeof m.url !== "string") {
          throw new Error("各モニターには 'url' 文字列が必要です");
        }
        if (!m.method || (m.method !== "GET" && m.method !== "POST")) {
          throw new Error("各モニターには 'method' (GET または POST) が必要です");
        }
        return {
          name: m.name,
          url: m.url,
          method: m.method,
          headers: typeof m.headers === "string" ? m.headers : null,
          body: typeof m.body === "string" ? m.body : null,
          timeout: typeof m.timeout === "number" ? m.timeout : 30,
          expectedStatus: typeof m.expectedStatus === "number" ? m.expectedStatus : 200,
        };
      });

      error.value = "";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "無効なJSONファイルです";
      preview.value = [];
    }
  };
  reader.readAsText(file);
}

async function handleImport() {
  if (!preview.value.length) return;

  loading.value = true;
  error.value = "";

  try {
    const res = await client.monitor.import({
      monitors: preview.value,
      skipDuplicates: skipDuplicates.value,
    });
    result.value = res;
    emit("imported");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "インポートに失敗しました";
  } finally {
    loading.value = false;
  }
}
</script>
