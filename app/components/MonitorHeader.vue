<template>
  <div class="monitor-header-card bg-base-100 mb-6">
    <div class="flex items-start justify-between flex-wrap gap-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span class="header-status-dot" :class="dotClass"></span>
          <h2 class="text-xl font-bold m-0">{{ monitor.name }}</h2>
          <span class="status-label" :class="statusLabelClass">{{ statusText }}</span>
        </div>
        <div class="text-sm text-base-content/60">
          <span class="method-badge">{{ monitor.method }}</span>
          {{ monitor.url }}
        </div>
      </div>
      <div v-if="isAdmin" class="flex gap-2 flex-wrap">
        <AppButton variant="outline" size="sm" :loading="checking" @click="$emit('check')">
          今すぐチェック
        </AppButton>
        <AppButton variant="outline" size="sm" @click="$emit('duplicate')">複製</AppButton>
        <AppButton variant="outline" size="sm" @click="$emit('edit')">編集</AppButton>
        <AppButton variant="danger" size="sm" @click="$emit('delete')">削除</AppButton>
      </div>
    </div>

    <div class="stats-grid mt-5">
      <div class="stat-item bg-base-200/50">
        <div class="stat-label text-base-content/50">稼働率</div>
        <div class="stat-value" :class="uptimeColorClass">
          {{ monitor.uptimePercent !== null ? `${monitor.uptimePercent}%` : "-" }}
        </div>
      </div>
      <div class="stat-item bg-base-200/50">
        <div class="stat-label text-base-content/50">応答時間</div>
        <div class="stat-value">
          {{
            monitor.lastCheck?.responseTime != null ? `${monitor.lastCheck.responseTime}ms` : "-"
          }}
        </div>
      </div>
      <div class="stat-item bg-base-200/50">
        <div class="stat-label text-base-content/50">タイムアウト</div>
        <div class="stat-value">{{ monitor.timeout }}s</div>
      </div>
      <div class="stat-item bg-base-200/50">
        <div class="stat-label text-base-content/50">期待ステータス</div>
        <div class="stat-value">{{ monitor.expectedStatus }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MonitorWithStatus } from "./types";

const props = defineProps<{
  monitor: MonitorWithStatus;
  checking: boolean;
  isAdmin: boolean;
}>();
defineEmits<{ check: []; delete: []; edit: []; duplicate: [] }>();

const { status, uptimeColorClass, statusText } = useMonitorStatus(
  () => props.monitor.lastCheck,
  () => props.monitor.uptimePercent,
);

const dotClass = computed(() => {
  const map: Record<string, string> = {
    up: "dot-up",
    down: "dot-down",
    pending: "dot-pending",
  };
  return map[status.value];
});

const statusLabelClass = computed(() => {
  const map: Record<string, string> = {
    up: "label-up",
    down: "label-down",
    pending: "label-pending",
  };
  return map[status.value];
});
</script>

<style scoped>
.monitor-header-card {
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.header-status-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.dot-up {
  background-color: var(--status-up);
}
.dot-down {
  background-color: var(--status-down);
  animation: pulse-slow 2s ease-in-out infinite;
}
.dot-pending {
  background-color: var(--color-base-content, gray);
  opacity: 0.3;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
}

.label-up {
  background-color: var(--status-up-bg);
  color: var(--status-up-fg);
}
.label-down {
  background-color: var(--status-down-bg);
  color: var(--status-down-fg);
}
.label-pending {
  background-color: var(--color-base-200);
  color: var(--color-base-content, gray);
  opacity: 0.7;
}

.method-badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  background: var(--bar-empty);
  font-family: ui-monospace, monospace;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.stat-label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: ui-monospace, monospace;
}
</style>
