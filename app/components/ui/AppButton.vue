<template>
  <button :class="classes" :disabled="disabled || loading" v-bind="$attrs">
    <span v-if="loading" class="loading loading-spinner" :class="spinnerSize"></span>
    <slot />
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
    size?: "xs" | "sm" | "md";
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
  },
);

const variantClass = computed(() => {
  const map: Record<string, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-error",
    outline: "btn-outline",
  };
  return map[props.variant];
});

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "",
  };
  return map[props.size];
});

const spinnerSize = computed(() => {
  const map: Record<string, string> = {
    xs: "loading-xs",
    sm: "loading-xs",
    md: "loading-sm",
  };
  return map[props.size];
});

const classes = computed(() =>
  ["btn", variantClass.value, sizeClass.value].filter(Boolean).join(" "),
);
</script>
