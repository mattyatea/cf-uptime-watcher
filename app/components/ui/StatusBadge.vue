<template>
  <AppBadge :variant="badgeVariant" size="sm">
    {{ label }}
  </AppBadge>
</template>

<script lang="ts" setup>
const props = defineProps<{
  status: "up" | "down" | "pending";
}>();

const badgeVariant = computed<"success" | "error" | "ghost">(() => {
  const map: Record<string, "success" | "error" | "ghost"> = {
    up: "success",
    down: "error",
    pending: "ghost",
  };
  return map[props.status] ?? "ghost";
});

const label = computed(() => {
  const map: Record<string, string> = {
    up: "稼働中",
    down: "停止",
    pending: "待機中",
  };
  return map[props.status];
});
</script>
