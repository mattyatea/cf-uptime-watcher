<template>
  <div class="card bg-base-100 shadow-sm mb-6">
    <div class="card-body">
      <h3 class="font-bold text-lg m-0 mb-3">Notification Channels</h3>

      <div v-if="allChannels.length === 0" class="text-sm text-base-content/50">
        No channels configured. Add channels from the dashboard.
      </div>

      <div class="space-y-2">
        <label
          v-for="ch in allChannels"
          :key="ch.id"
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-sm checkbox-primary"
            :checked="selectedIds.has(ch.id)"
            @change="toggle(ch.id)"
          />
          <div
            class="badge badge-sm"
            :class="ch.type === 'discord' ? 'badge-primary' : 'badge-secondary'"
          >
            {{ ch.type }}
          </div>
          <span class="text-sm">{{ ch.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { client } from "../server/client";

interface Channel {
  id: number;
  type: string;
  name: string;
  webhookUrl: string;
  template: string | null;
  active: boolean;
  createdAt: string;
}

const props = defineProps<{ monitorId: number; channelIds: number[] }>();

const allChannels = ref<Channel[]>([]);
const selectedIds = ref(new Set<number>());

watch(
  () => props.channelIds,
  (ids) => {
    selectedIds.value = new Set(ids);
  },
  { immediate: true },
);

async function toggle(channelId: number) {
  const newSet = new Set(selectedIds.value);
  if (newSet.has(channelId)) {
    newSet.delete(channelId);
  } else {
    newSet.add(channelId);
  }
  selectedIds.value = newSet;

  await client.monitor.setChannels({
    id: props.monitorId,
    channelIds: [...newSet],
  });
}

onMounted(async () => {
  allChannels.value = await client.notification.list();
});
</script>
