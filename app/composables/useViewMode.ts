const STORAGE_KEY = "cf-hc-view-mode";

type ViewMode = "list" | "grid";

const viewMode = ref<ViewMode>("list");

export function useViewMode() {
  function init() {
    const stored = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (stored) {
      viewMode.value = stored;
    }
  }

  function set(mode: ViewMode) {
    viewMode.value = mode;
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function toggle() {
    set(viewMode.value === "list" ? "grid" : "list");
  }

  return { viewMode, init, set, toggle };
}
