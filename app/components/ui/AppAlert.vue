<template>
  <div class="alert" :class="variantClass" role="alert">
    <slot />
    <button v-if="dismissible" class="btn btn-sm btn-ghost btn-circle" @click="$emit('dismiss')">
      X
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant: "error" | "success" | "info";
    dismissible?: boolean;
  }>(),
  {
    dismissible: false,
  },
);

defineEmits<{ dismiss: [] }>();

const variantClass = computed(() => {
  const map: Record<string, string> = {
    error: "alert-error",
    success: "alert-success",
    info: "alert-info",
  };
  return map[props.variant];
});
</script>
