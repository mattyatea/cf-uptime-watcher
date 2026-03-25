<template>
  <div class="card bg-base-100 shadow-sm">
    <div v-if="$slots.header" class="px-4 py-3 border-b border-base-300">
      <slot name="header" />
    </div>
    <div :class="bodyPaddingClass">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    padding?: "none" | "sm" | "md";
  }>(),
  {
    padding: "md",
  },
);

const bodyPaddingClass = computed(() => {
  const map: Record<string, string> = {
    none: "",
    sm: "p-3",
    md: "p-4",
  };
  return map[props.padding];
});
</script>
