<template>
  <div class="monitor-header-card mb-6">
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
        <AppButton variant="outline" size="sm" @click="$emit('edit')">編集</AppButton>
        <AppButton variant="danger" size="sm" @click="$emit('delete')">削除</AppButton>
      </div>
    </div>

    <div class="stats-grid mt-5">
      <div class="stat-item">
        <div class="stat-label">稼働率</div>
        <div class="stat-value" :class="uptimeColorClass">
          {{ monitor.uptimePercent !== null ? `${monitor.uptimePercent}%` : "-" }}
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">応答時間</div>
        <div class="stat-value">
          {{
            monitor.lastCheck?.responseTime != null ? `${monitor.lastCheck.responseTime}ms` : "-"
          }}
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-label">タイムアウト</div>
        <div class="stat-value">{{ monitor.timeout }}s</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">期待ステータス</div>
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
defineEmits<{ check: []; delete: []; edit: [] }>();

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
  background: oklch(var(--b1, 1 0 0));
  border: 1px solid oklch(var(--bc, 0.2 0 0) / 0.08);
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
  background-color: #10b981;
}
.dot-down {
  background-color: #ef4444;
  animation: pulse-slow 2s ease-in-out infinite;
}
.dot-pending {
  background-color: oklch(var(--bc, 0.2 0 0) / 0.3);
}

.status-label {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
}

.label-up {
  background-color: #d1fae5;
  color: #065f46;
}
.label-down {
  background-color: #fee2e2;
  color: #991b1b;
}
.label-pending {
  background-color: oklch(var(--b2, 0.93 0 0));
  color: oklch(var(--bc, 0.2 0 0) / 0.5);
}

@media (prefers-color-scheme: dark) {
  .label-up {
    background-color: #064e3b;
    color: #a7f3d0;
  }
  .label-down {
    background-color: #7f1d1d;
    color: #fecaca;
  }
}

.method-badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  background: oklch(var(--bc, 0.2 0 0) / 0.08);
  color: oklch(var(--bc, 0.2 0 0) / 0.6);
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
  background: oklch(var(--bc, 0.2 0 0) / 0.03);
  border-radius: 0.5rem;
}

.stat-label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: oklch(var(--bc, 0.2 0 0) / 0.5);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  font-family: ui-monospace, monospace;
}
</style>
