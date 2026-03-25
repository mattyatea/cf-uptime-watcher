<template>
  <span class="inline-block w-2.5 h-2.5 rounded-full shrink-0" :class="dotClass"></span>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  status: "up" | "down" | "pending";
}>();

const dotClass = computed(() => {
  const map: Record<string, string> = {
    up: "bg-success",
    down: "bg-error pulse-slow",
    pending: "bg-base-content/30",
  };
  return map[props.status];
});
</script>
