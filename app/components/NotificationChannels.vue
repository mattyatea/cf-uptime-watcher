<template>
  <AppCard>
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-lg m-0">通知</h3>
      <AppButton variant="outline" size="sm" @click="showAdd = true">+ Webhook追加</AppButton>
    </div>

    <div v-if="channels.length === 0" class="text-center py-4 text-base-content/50 text-sm">
      通知チャンネルがありません。
    </div>

    <div class="space-y-2">
      <div
        v-for="ch in channels"
        :key="ch.id"
        class="flex items-center gap-3 p-3 rounded-lg bg-base-200"
      >
        <AppBadge :variant="ch.type === 'discord' ? 'primary' : 'secondary'" size="sm">
          {{ ch.type }}
        </AppBadge>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">{{ ch.name }}</div>
          <div class="text-xs text-base-content/50 truncate">
            {{ ch.template ? "カスタムテンプレート" : "デフォルトテンプレート" }}
          </div>
        </div>
        <AppButton variant="ghost" size="xs" :loading="testingId === ch.id" @click="testSend(ch)">
          テスト
        </AppButton>
        <AppButton variant="ghost" size="xs" @click="openEdit(ch)">編集</AppButton>
        <AppToggle v-model="ch.active" label="" @update:model-value="toggleActive(ch)" />
        <AppButton variant="ghost" size="xs" class="text-error" @click="remove(ch)">X</AppButton>
      </div>
    </div>

    <!-- Add dialog -->
    <AppModal :open="showAdd" title="通知チャンネル追加" @close="showAdd = false">
      <form @submit.prevent="handleCreate">
        <div class="mb-4">
          <AppInput v-model="form.name" label="名前" placeholder="本番アラート" required />
        </div>

        <div class="mb-4">
          <AppSelect v-model="form.type" label="タイプ" :options="typeOptions" />
        </div>

        <div class="mb-4">
          <AppInput
            v-model="form.webhookUrl"
            label="Webhook URL"
            type="url"
            placeholder="https://discord.com/api/webhooks/..."
            required
          />
        </div>

        <div class="mb-4">
          <AppCollapsible title="メッセージテンプレート">
            <AppTextarea
              v-model="form.template"
              label="テンプレート"
              :rows="5"
              :placeholder="defaultTemplate"
              monospace
            />
            <TemplateHelp />
          </AppCollapsible>
        </div>

        <AppAlert v-if="error" variant="error" class="text-sm mb-4">{{ error }}</AppAlert>

        <div class="modal-action">
          <AppButton variant="ghost" @click="showAdd = false">キャンセル</AppButton>
          <AppButton type="submit" variant="primary" :loading="loading">追加</AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Edit dialog -->
    <AppModal :open="showEdit" title="チャンネル編集" @close="showEdit = false">
      <form @submit.prevent="handleUpdate">
        <div class="mb-4">
          <AppInput v-model="editForm.name" label="名前" required />
        </div>

        <div class="mb-4">
          <AppInput v-model="editForm.webhookUrl" label="Webhook URL" type="url" required />
        </div>

        <div class="mb-4">
          <AppTextarea
            v-model="editForm.template"
            label="メッセージテンプレート"
            :rows="5"
            :placeholder="defaultTemplate"
            monospace
          />
          <TemplateHelp />
        </div>

        <AppAlert v-if="editError" variant="error" class="text-sm mb-4">{{ editError }}</AppAlert>

        <div class="modal-action">
          <AppButton variant="ghost" @click="showEdit = false">キャンセル</AppButton>
          <AppButton type="submit" variant="primary" :loading="editLoading">保存</AppButton>
        </div>
      </form>
    </AppModal>
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

const defaultTemplate =
  "[{{status}}] {{monitor.name}}\nURL: {{monitor.url}}\nステータス: {{statusCode}} | 応答: {{responseTime}}\n{{error}}";

const channels = ref<Channel[]>([]);
const showAdd = ref(false);
const showEdit = ref(false);
const loading = ref(false);
const editLoading = ref(false);
const testingId = ref<number | null>(null);
const error = ref("");
const editError = ref("");

const form = ref({
  name: "",
  type: "discord",
  webhookUrl: "",
  template: "",
});

const editForm = ref({ id: 0, name: "", webhookUrl: "", template: "" });

const typeOptions = [
  { value: "discord", label: "Discord" },
  { value: "slack", label: "Slack" },
];

async function load() {
  channels.value = await client.notification.list();
}

async function handleCreate() {
  error.value = "";
  loading.value = true;
  try {
    await client.notification.create({
      name: form.value.name,
      type: form.value.type as "discord" | "slack",
      webhookUrl: form.value.webhookUrl,
      template: form.value.template || null,
    });
    form.value = { name: "", type: "discord", webhookUrl: "", template: "" };
    showAdd.value = false;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "チャンネルの追加に失敗しました";
  } finally {
    loading.value = false;
  }
}

function openEdit(ch: Channel) {
  editForm.value = {
    id: ch.id,
    name: ch.name,
    webhookUrl: ch.webhookUrl,
    template: ch.template ?? "",
  };
  editError.value = "";
  showEdit.value = true;
}

async function handleUpdate() {
  editError.value = "";
  editLoading.value = true;
  try {
    await client.notification.update({
      id: editForm.value.id,
      name: editForm.value.name,
      webhookUrl: editForm.value.webhookUrl,
      template: editForm.value.template || null,
    });
    showEdit.value = false;
    await load();
  } catch (e) {
    editError.value = e instanceof Error ? e.message : "更新に失敗しました";
  } finally {
    editLoading.value = false;
  }
}

async function toggleActive(ch: Channel) {
  await client.notification.update({ id: ch.id, active: !ch.active });
  await load();
}

async function testSend(ch: Channel) {
  testingId.value = ch.id;
  try {
    await client.notification.test({ id: ch.id });
    alert(`テスト通知を「${ch.name}」に送信しました`);
  } catch (e) {
    alert(`失敗: ${e instanceof Error ? e.message : "不明なエラー"}`);
  } finally {
    testingId.value = null;
  }
}

async function remove(ch: Channel) {
  if (confirm(`「${ch.name}」を削除しますか？`)) {
    await client.notification.delete({ id: ch.id });
    await load();
  }
}

onMounted(load);
</script>
