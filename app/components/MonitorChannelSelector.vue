<template>
  <AppCard class="mb-6">
    <h3 class="font-bold text-lg m-0 mb-3">通知チャンネル</h3>

    <div v-if="allChannels.length === 0" class="text-sm text-base-content/50">
      チャンネルが未設定です。ダッシュボードから追加してください。
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
        <AppBadge :variant="ch.type === 'discord' ? 'primary' : 'secondary'" size="sm">
          {{ ch.type }}
        </AppBadge>
        <span class="text-sm">{{ ch.name }}</span>
      </label>
    </div>
  </AppCard>
</template>

<script lang="ts" setup>
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
