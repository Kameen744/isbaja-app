// vite.config.js
import { defineConfig } from "file:///C:/Sydani/isbaja/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Sydani/isbaja/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vitePluginRequire from "file:///C:/Sydani/isbaja/node_modules/vite-plugin-require/dist/index.js";
var host = process.env.TAURI_DEV_HOST;
var vite_config_default = defineConfig(async () => ({
  plugins: [vue(), vitePluginRequire.default()],
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? {
      protocol: "ws",
      host,
      port: 1421
    } : void 0,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"]
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxTeWRhbmlcXFxcaXNiYWphXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxTeWRhbmlcXFxcaXNiYWphXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9TeWRhbmkvaXNiYWphL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XHJcbmltcG9ydCB2aXRlUGx1Z2luUmVxdWlyZSBmcm9tIFwidml0ZS1wbHVnaW4tcmVxdWlyZVwiO1xyXG5cclxuY29uc3QgaG9zdCA9IHByb2Nlc3MuZW52LlRBVVJJX0RFVl9IT1NUO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+ICh7XHJcbiAgcGx1Z2luczogW3Z1ZSgpLCB2aXRlUGx1Z2luUmVxdWlyZS5kZWZhdWx0KCldLFxyXG5cclxuICAvLyBWaXRlIG9wdGlvbnMgdGFpbG9yZWQgZm9yIFRhdXJpIGRldmVsb3BtZW50IGFuZCBvbmx5IGFwcGxpZWQgaW4gYHRhdXJpIGRldmAgb3IgYHRhdXJpIGJ1aWxkYFxyXG4gIC8vXHJcbiAgLy8gMS4gcHJldmVudCB2aXRlIGZyb20gb2JzY3VyaW5nIHJ1c3QgZXJyb3JzXHJcbiAgY2xlYXJTY3JlZW46IGZhbHNlLFxyXG4gIC8vIDIuIHRhdXJpIGV4cGVjdHMgYSBmaXhlZCBwb3J0LCBmYWlsIGlmIHRoYXQgcG9ydCBpcyBub3QgYXZhaWxhYmxlXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiAxNDIwLFxyXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgIGhvc3Q6IGhvc3QgfHwgZmFsc2UsXHJcbiAgICBobXI6IGhvc3RcclxuICAgICAgPyB7XHJcbiAgICAgICAgICBwcm90b2NvbDogXCJ3c1wiLFxyXG4gICAgICAgICAgaG9zdCxcclxuICAgICAgICAgIHBvcnQ6IDE0MjEsXHJcbiAgICAgICAgfVxyXG4gICAgICA6IHVuZGVmaW5lZCxcclxuICAgIHdhdGNoOiB7XHJcbiAgICAgIC8vIDMuIHRlbGwgdml0ZSB0byBpZ25vcmUgd2F0Y2hpbmcgYHNyYy10YXVyaWBcclxuICAgICAgaWdub3JlZDogW1wiKiovc3JjLXRhdXJpLyoqXCJdLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd08sU0FBUyxvQkFBb0I7QUFDclEsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sdUJBQXVCO0FBRTlCLElBQU0sT0FBTyxRQUFRLElBQUk7QUFHekIsSUFBTyxzQkFBUSxhQUFhLGFBQWE7QUFBQSxFQUN2QyxTQUFTLENBQUMsSUFBSSxHQUFHLGtCQUFrQixRQUFRLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUs1QyxhQUFhO0FBQUE7QUFBQSxFQUViLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLE1BQU0sUUFBUTtBQUFBLElBQ2QsS0FBSyxPQUNEO0FBQUEsTUFDRSxVQUFVO0FBQUEsTUFDVjtBQUFBLE1BQ0EsTUFBTTtBQUFBLElBQ1IsSUFDQTtBQUFBLElBQ0osT0FBTztBQUFBO0FBQUEsTUFFTCxTQUFTLENBQUMsaUJBQWlCO0FBQUEsSUFDN0I7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
