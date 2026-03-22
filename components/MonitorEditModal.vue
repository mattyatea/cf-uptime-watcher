<template>
  <dialog :open="open" class="modal modal-bottom sm:modal-middle" @close="$emit('close')">
    <div class="modal-box w-11/12 max-w-lg">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        @click="$emit('close')"
      >
        X
      </button>
      <h3 class="font-bold text-lg mb-4">Edit Monitor</h3>
      <form @submit.prevent="handleSubmit">
        <label class="floating-label mb-4">
          <span>Name</span>
          <input v-model="form.name" type="text" class="input input-bordered w-full" required />
        </label>

        <label class="floating-label mb-4">
          <span>URL</span>
          <input
            v-model="form.url"
            type="url"
            class="input input-bordered w-full"
            placeholder="https://example.com"
            required
          />
        </label>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <label class="floating-label">
            <span>Method</span>
            <select v-model="form.method" class="select select-bordered w-full">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </label>

          <label class="floating-label">
            <span>Timeout (sec)</span>
            <input
              v-model.number="form.timeout"
              type="number"
              min="1"
              max="120"
              class="input input-bordered w-full"
              required
            />
          </label>
        </div>

        <label class="floating-label mb-4">
          <span>Expected Status</span>
          <input
            v-model.number="form.expectedStatus"
            type="number"
            min="100"
            max="599"
            class="input input-bordered w-full"
          />
        </label>

        <div v-if="form.method === 'POST'">
          <label class="floating-label mb-4">
            <span>Content-Type</span>
            <select
              :value="selectedContentType"
              class="select select-bordered w-full"
              @change="handleContentTypeChange"
            >
              <option value="">None</option>
              <option value="application/json">application/json</option>
              <option value="application/x-www-form-urlencoded">
                application/x-www-form-urlencoded
              </option>
              <option value="text/plain">text/plain</option>
              <option value="custom">Custom / keep header JSON</option>
            </select>
          </label>

          <div class="collapse collapse-arrow bg-base-200 mb-4">
            <input type="checkbox" />
            <div class="collapse-title font-medium text-sm">Request Body</div>
            <div class="collapse-content">
              <textarea
                v-model="form.body"
                class="textarea textarea-bordered w-full font-mono text-sm"
                rows="4"
                placeholder='{"key": "value"}'
              ></textarea>
            </div>
          </div>
        </div>

        <div class="collapse collapse-arrow bg-base-200 mb-4">
          <input type="checkbox" />
          <div class="collapse-title font-medium text-sm">Custom Headers</div>
          <div class="collapse-content">
            <textarea
              v-model="form.headers"
              class="textarea textarea-bordered w-full font-mono text-sm"
              rows="3"
              placeholder='{"Authorization": "Bearer token"}'
            ></textarea>
          </div>
        </div>

        <div class="form-control mb-4">
          <label class="label cursor-pointer">
            <span class="label-text">Active</span>
            <input v-model="form.active" type="checkbox" class="toggle toggle-success" />
          </label>
        </div>

        <div v-if="error" class="alert alert-error text-sm mb-4">{{ error }}</div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            Save
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="$emit('close')">close</button>
    </form>
  </dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { client } from "../server/client";
import type { MonitorWithStatus } from "./types";

const props = defineProps<{ open: boolean; monitor: MonitorWithStatus | null }>();
const emit = defineEmits<{ close: []; updated: [] }>();

const form = ref({
  name: "",
  url: "",
  method: "GET" as "GET" | "POST",
  timeout: 30,
  expectedStatus: 200,
  headers: "",
  body: "",
  active: true,
});

const loading = ref(false);
const error = ref("");

const CONTENT_TYPE_HEADER = "Content-Type";

const selectedContentType = computed(() => {
  if (form.value.method !== "POST") return "";

  const headers = tryParseHeaders(form.value.headers);
  const contentType = headers?.[CONTENT_TYPE_HEADER];
  if (!contentType) return "";

  return CONTENT_TYPE_OPTIONS.includes(contentType) ? contentType : "custom";
});

const CONTENT_TYPE_OPTIONS = [
  "application/json",
  "application/x-www-form-urlencoded",
  "text/plain",
];

function parseHeaders(headersText: string) {
  if (!headersText.trim()) return {};

  const parsed = JSON.parse(headersText) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Custom Headers must be a JSON object");
  }

  return Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [key, value == null ? "" : String(value)]),
  );
}

function tryParseHeaders(headersText: string) {
  try {
    return parseHeaders(headersText);
  } catch {
    return {};
  }
}

function stringifyHeaders(headers: Record<string, string>) {
  const entries = Object.entries(headers).filter(([, value]) => value.trim() !== "");
  return entries.length > 0 ? JSON.stringify(Object.fromEntries(entries), null, 2) : "";
}

function handleContentTypeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  const headers = tryParseHeaders(form.value.headers);

  if (value === "custom") return;

  if (value) {
    headers[CONTENT_TYPE_HEADER] = value;
  } else {
    delete headers[CONTENT_TYPE_HEADER];
  }

  form.value.headers = stringifyHeaders(headers);
}

watch(
  () => props.monitor,
  (m) => {
    if (m) {
      form.value = {
        name: m.name,
        url: m.url,
        method: m.method as "GET" | "POST",
        timeout: m.timeout,
        expectedStatus: m.expectedStatus,
        headers: m.headers ?? "",
        body: m.body ?? "",
        active: m.active,
      };
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  if (!props.monitor) return;
  error.value = "";
  loading.value = true;
  try {
    parseHeaders(form.value.headers);

    await client.monitor.update({
      id: props.monitor.id,
      name: form.value.name,
      url: form.value.url,
      method: form.value.method,
      timeout: form.value.timeout,
      expectedStatus: form.value.expectedStatus,
      headers: form.value.headers || null,
      body: form.value.method === "POST" ? form.value.body || null : null,
      active: form.value.active,
    });
    emit("updated");
    emit("close");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to update";
  } finally {
    loading.value = false;
  }
}
</script>
