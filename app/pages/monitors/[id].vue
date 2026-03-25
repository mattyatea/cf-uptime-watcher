<template>
  <div>
    <div class="text-sm breadcrumbs mb-4">
      <ul>
        <li><NuxtLink to="/">モニター</NuxtLink></li>
        <li class="text-base-content/50">{{ monitor?.name ?? "読み込み中..." }}</li>
      </ul>
    </div>

    <div v-if="!monitor" class="space-y-4">
      <AppCard>
        <div class="animate-pulse space-y-3">
          <div class="h-6 bg-base-content/10 rounded w-1/3"></div>
          <div class="h-4 bg-base-content/10 rounded w-2/3"></div>
          <div class="grid grid-cols-4 gap-4 mt-4">
            <div v-for="i in 4" :key="i" class="h-12 bg-base-content/10 rounded"></div>
          </div>
        </div>
      </AppCard>
    </div>

    <template v-else>
      <MonitorHeader
        :monitor="monitor"
        :checking="checking"
        :is-admin="isAdmin"
        @check="checkNow"
        @delete="confirmDelete"
        @edit="showEditModal = true"
      />

      <MonitorChannelSelector
        v-if="isAdmin"
        :monitor-id="monitorId"
        :channel-ids="monitor.channelIds"
      />

      <CheckHistory :history="history" />

      <MonitorEditModal
        v-if="isAdmin"
        :open="showEditModal"
        :monitor="monitor"
        @close="showEditModal = false"
        @updated="loadMonitor"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { MonitorWithStatus, CheckResult } from "~/components/types";

const route = useRoute();
const monitorId = Number(route.params.id);

const monitor = ref<MonitorWithStatus | null>(null);
const history = ref<CheckResult[]>([]);
const checking = ref(false);
const isAdmin = ref(false);
const showEditModal = ref(false);

async function loadMonitor() {
  const data = await client.monitor.get({ id: monitorId });
  if (data) {
    monitor.value = data;
  }
}

async function loadHistory() {
  history.value = await client.monitor.history({ id: monitorId, limit: 200 });
}

async function checkNow() {
  checking.value = true;
  try {
    await client.monitor.checkNow({ id: monitorId });
    await Promise.all([loadMonitor(), loadHistory()]);
  } finally {
    checking.value = false;
  }
}

async function confirmDelete() {
  if (confirm(`「${monitor.value?.name}」を削除しますか？`)) {
    await client.monitor.delete({ id: monitorId });
    navigateTo("/");
  }
}

onMounted(async () => {
  isAdmin.value = !!localStorage.getItem("auth_token");
  await Promise.all([loadMonitor(), loadHistory()]);
});
</script>
