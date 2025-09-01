import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import packages from "./package.json";

export default defineConfig({
  build: {
    lib: {
      // 库的入口文件
      entry: resolve(__dirname, "src/index.ts"),
      // 库的名称
      name: packages.name,
      // 输出的文件格式，同时生成 ESM 和 CJS
      formats: ["es", "cjs", "umd"],
      // 输出文件名
      fileName: (format, entryName) => {
        switch (format) {
          case "es":
            return `${entryName}.mjs`;
          case "cjs":
            return `${entryName}.cjs`;
          case "umd":
            return `${entryName}.umd.cjs`;
          default:
            return `${entryName}.${format}.js`;
        }
      },
    },
    // 是否生成 sourcemap
    sourcemap: true,
    // 清除输出目录
    emptyOutDir: true,
    // rollup 配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["react", "react-dom", "vue"],
      output: {
        // 提供全局变量名，UMD 格式需要
        globals: {
          react: "React",
          vue: "Vue",
        },
      },
    },
  },
  // 插件配置
  plugins: [
    // 自动生成 .d.ts 类型声明文件
    dts({
      insertTypesEntry: true,
      exclude: ["**/*.test.*", "**/*.spec.*"],
    }),
  ],
});
