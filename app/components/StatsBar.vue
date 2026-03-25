<template>
  <div class="overall-status-banner" :class="bannerClass">
    <div class="flex items-center justify-center gap-3">
      <span class="status-icon">{{ icon }}</span>
      <span class="text-lg font-semibold">{{ message }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ total: number; up: number; down: number }>();

const bannerClass = computed(() => {
  if (props.total === 0) return "banner-neutral bg-base-200 text-base-content/50";
  if (props.down === 0) return "banner-operational";
  if (props.down === props.total) return "banner-major";
  return "banner-partial";
});

const icon = computed(() => {
  if (props.total === 0) return "~";
  if (props.down === 0) return "\u2713";
  return "!";
});

const message = computed(() => {
  if (props.total === 0) return "モニターがありません";
  if (props.down === 0) return "全システム稼働中";
  if (props.down === props.total) return "全システム停止中";
  return `${props.down}件のシステムに問題が発生しています`;
});
</script>

<style scoped>
.overall-status-banner {
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  font-weight: bold;
  font-size: 0.875rem;
}

.banner-operational {
  background-color: var(--status-up-bg);
  color: var(--status-up-fg);
}

.banner-operational .status-icon {
  background-color: var(--status-up);
  color: white;
}

.banner-partial {
  background-color: var(--status-warn-bg);
  color: var(--status-warn-fg);
}

.banner-partial .status-icon {
  background-color: var(--status-warn);
  color: white;
}

.banner-major {
  background-color: var(--status-down-bg);
  color: var(--status-down-fg);
}

.banner-major .status-icon {
  background-color: var(--status-down);
  color: white;
}
</style>
