<template>
  <div>
    <StatsBar :total="monitors.length" :up="upCount" :down="downCount" />

    <div v-if="isAdmin" class="flex justify-end gap-2 mb-4">
      <AppButton variant="outline" size="sm" @click="showImportModal = true">
        インポート
      </AppButton>
      <AppButton variant="primary" size="sm" @click="showCreateModal = true">
        + モニター追加
      </AppButton>
    </div>

    <div v-if="monitors.length === 0" class="text-center py-16">
      <div class="text-4xl mb-3 opacity-20">📡</div>
      <p class="text-base-content/50 m-0">モニターがまだありません。</p>
      <p v-if="isAdmin" class="text-base-content/40 text-sm mt-1 mb-0">
        「+ モニター追加」ボタンから追加してください。
      </p>
    </div>
    <div class="space-y-3 mb-8">
      <MonitorCard
        v-for="monitor in monitors"
        :key="monitor.id"
        :monitor="monitor"
        @click="navigateTo(`/monitors/${monitor.id}`)"
      />
    </div>

    <div v-if="isAdmin" class="mt-10">
      <NotificationChannels />
    </div>

    <CreateMonitorModal
      v-if="isAdmin"
      :open="showCreateModal"
      @close="showCreateModal = false"
      @created="loadMonitors"
    />
    <ImportMonitorsModal
      v-if="isAdmin"
      :open="showImportModal"
      @close="showImportModal = false"
      @imported="loadMonitors"
    />
  </div>
</template>

<script lang="ts" setup>
import type { MonitorWithStatus } from "~/components/types";

const monitors = ref<MonitorWithStatus[]>([]);
const showCreateModal = ref(false);
const showImportModal = ref(false);
const isAdmin = ref(false);

const upCount = computed(() => monitors.value.filter((m) => m.lastCheck?.isUp).length);
const downCount = computed(
  () => monitors.value.filter((m) => m.lastCheck && !m.lastCheck.isUp).length,
);

async function loadMonitors() {
  monitors.value = await client.monitor.list();
}

onMounted(() => {
  isAdmin.value = !!localStorage.getItem("auth_token");
  loadMonitors();
});
</script>
