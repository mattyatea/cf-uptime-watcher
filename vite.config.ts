import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    plugins: ["eslint", "typescript", "unicorn", "oxc", "vue"],
    jsPlugins: [],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
