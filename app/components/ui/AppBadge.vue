<template>
  <span class="badge" :class="classes">
    <slot />
  </span>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "success" | "error" | "warning" | "ghost" | "primary" | "secondary";
    size?: "xs" | "sm";
  }>(),
  {
    variant: "ghost",
    size: "sm",
  },
);

const variantClass = computed(() => {
  const map: Record<string, string> = {
    success: "badge-success",
    error: "badge-error",
    warning: "badge-warning",
    ghost: "badge-ghost",
    primary: "badge-primary",
    secondary: "badge-secondary",
  };
  return map[props.variant];
});

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: "badge-xs",
    sm: "badge-sm",
  };
  return map[props.size];
});

const classes = computed(() => [variantClass.value, sizeClass.value].filter(Boolean).join(" "));
</script>
