<template>
  <label class="label cursor-pointer gap-3">
    <span class="label-text">{{ label }}</span>
    <input v-model="model" type="checkbox" class="toggle toggle-success" />
  </label>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>();

defineProps<{
  label: string;
}>();
</script>
