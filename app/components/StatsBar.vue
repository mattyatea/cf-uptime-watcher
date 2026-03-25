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
  if (props.total === 0) return "banner-neutral";
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
  background-color: #d1fae5;
  color: #065f46;
}

.banner-operational .status-icon {
  background-color: #10b981;
  color: white;
}

.banner-partial {
  background-color: #fef3c7;
  color: #92400e;
}

.banner-partial .status-icon {
  background-color: #f59e0b;
  color: white;
}

.banner-major {
  background-color: #fee2e2;
  color: #991b1b;
}

.banner-major .status-icon {
  background-color: #ef4444;
  color: white;
}

.banner-neutral {
  background-color: oklch(var(--b2, 0.93 0 0));
  color: oklch(var(--bc, 0.2 0 0) / 0.5);
}

.banner-neutral .status-icon {
  background-color: oklch(var(--bc, 0.2 0 0) / 0.3);
  color: white;
}

@media (prefers-color-scheme: dark) {
  .banner-operational {
    background-color: #064e3b;
    color: #a7f3d0;
  }

  .banner-partial {
    background-color: #78350f;
    color: #fde68a;
  }

  .banner-major {
    background-color: #7f1d1d;
    color: #fecaca;
  }
}
</style>
