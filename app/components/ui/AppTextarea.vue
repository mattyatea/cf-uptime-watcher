<template>
  <label class="floating-label w-full">
    <span>{{ label }}</span>
    <textarea
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      class="textarea textarea-bordered w-full"
      :class="{ 'font-mono text-sm': monospace }"
      v-bind="$attrs"
    ></textarea>
  </label>
</template>

<script lang="ts" setup>
const model = defineModel<string>();

withDefaults(
  defineProps<{
    label: string;
    rows?: number;
    placeholder?: string;
    monospace?: boolean;
  }>(),
  {
    rows: 4,
    placeholder: "",
    monospace: false,
  },
);
</script>
