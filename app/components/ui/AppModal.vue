<template>
  <dialog :open="open" class="modal modal-bottom sm:modal-middle" @close="$emit('close')">
    <div class="modal-box" :class="maxWidthClass">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="$emit('close')"
      >
        X
      </button>
      <h3 v-if="title" class="font-bold text-lg mb-4">{{ title }}</h3>

      <slot />

      <div v-if="$slots.footer" class="modal-action">
        <slot name="footer" />
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="$emit('close')">close</button>
    </form>
  </dialog>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    maxWidth?: "sm" | "md" | "lg";
  }>(),
  {
    title: "",
    maxWidth: "md",
  },
);

defineEmits<{ close: [] }>();

const maxWidthClass = computed(() => {
  const map: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };
  return map[props.maxWidth];
});
</script>
