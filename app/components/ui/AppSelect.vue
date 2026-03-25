<template>
  <label class="floating-label w-full">
    <span>{{ label }}</span>
    <select
      v-model="model"
      class="select select-bordered w-full"
      :required="required"
      v-bind="$attrs"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </label>
</template>

<script lang="ts" setup>
const model = defineModel<string>();

withDefaults(
  defineProps<{
    label: string;
    options: Array<{ value: string; label: string }>;
    required?: boolean;
  }>(),
  {
    required: false,
  },
);
</script>
