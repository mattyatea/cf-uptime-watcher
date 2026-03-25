<template>
  <div class="collapse collapse-arrow bg-base-200">
    <input v-model="isOpen" type="checkbox" />
    <div class="collapse-title font-medium text-sm">{{ title }}</div>
    <div class="collapse-content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    defaultOpen?: boolean;
  }>(),
  {
    defaultOpen: false,
  },
);

const isOpen = ref(props.defaultOpen);
</script>
