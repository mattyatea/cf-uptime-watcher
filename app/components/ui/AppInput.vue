<template>
  <label class="floating-label w-full">
    <span>{{ label }}</span>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      class="input input-bordered w-full"
      :class="{ 'input-error': error }"
      v-bind="$attrs"
    />
  </label>
  <p v-if="error" class="text-error text-xs mt-1 ml-1">{{ error }}</p>
</template>

<script lang="ts" setup>
const model = defineModel<string>();

withDefaults(
  defineProps<{
    label: string;
    placeholder?: string;
    type?: string;
    error?: string;
    required?: boolean;
  }>(),
  {
    placeholder: "",
    type: "text",
    error: "",
    required: false,
  },
);
</script>
