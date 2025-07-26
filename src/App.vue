<script setup>
import { onMounted, onUnmounted, watch } from "vue";
import { useMainStore } from "./stores/main-store";
import { storeToRefs } from "pinia";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import localforage from "localforage";

let inactivityTimer = null;
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 10 minutes

// Store event handlers so we can properly remove them
let visibilityChangeHandler = null;
let beforeUnloadHandler = null;
let unloadHandler = null;

const store = useMainStore();
const { cPage, isLoggedIn } = storeToRefs(store);

// Watch for login state changes
watch(isLoggedIn, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    setupInactivityListeners();
    resetInactivityTimer();
  } else if (!newValue && oldValue) {
    removeInactivityListeners();
  }
});

function updateLastActivity() {
  localforage.setItem("lastActivity", Date.now());
}

function resetInactivityTimer() {
  // Only start timer if user is logged in
  if (!store.isLoggedIn) {
    return;
  }

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  inactivityTimer = setTimeout(() => {
    store.logout();
  }, INACTIVITY_LIMIT);
  updateLastActivity();
}

async function checkInactivityOnResume() {
  // Only check inactivity if user is logged in
  if (!store.isLoggedIn) {
    return true;
  }

  const last = await localforage.getItem("lastActivity");
  const timeDiff = Date.now() - (last || 0);

  if (last && timeDiff > INACTIVITY_LIMIT) {
    await store.logout();
    return false;
  } else {
    resetInactivityTimer();
    return true;
  }
}

// Function to handle app going to background/minimized
function handleAppHide() {
  updateLastActivity();
  // Don't clear the timer - let it continue running
}

// Function to handle app coming to foreground
async function handleAppShow() {
  await checkInactivityOnResume();
}

function setupInactivityListeners() {
  ["mousemove", "keydown", "mousedown", "touchstart"].forEach((event) => {
    window.addEventListener(event, resetInactivityTimer);
  });

  window.addEventListener("focus", handleAppShow);

  // Store the handler so we can remove it later
  visibilityChangeHandler = async () => {
    if (document.visibilityState === "visible") {
      await handleAppShow();
    } else {
      handleAppHide();
    }
  };

  document.addEventListener("visibilitychange", visibilityChangeHandler);

  // Store handlers for proper cleanup
  beforeUnloadHandler = updateLastActivity;
  unloadHandler = updateLastActivity;

  window.addEventListener("beforeunload", beforeUnloadHandler);
  window.addEventListener("unload", unloadHandler);
}

function removeInactivityListeners() {
  ["mousemove", "keydown", "mousedown", "touchstart"].forEach((event) => {
    window.removeEventListener(event, resetInactivityTimer);
  });

  window.removeEventListener("focus", handleAppShow);

  // Remove the correct visibility change handler
  if (visibilityChangeHandler) {
    document.removeEventListener("visibilitychange", visibilityChangeHandler);
    visibilityChangeHandler = null;
  }

  if (beforeUnloadHandler) {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
    beforeUnloadHandler = null;
  }

  if (unloadHandler) {
    window.removeEventListener("unload", unloadHandler);
    unloadHandler = null;
  }

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

onMounted(async () => {
  let cUser = await localforage.getItem("authUser");
  if (cUser) {
    isLoggedIn.value = true;
  }
  // Only check inactivity if user is logged in
  if (!store.isLoggedIn) {
    return;
  }

  // Check if user should be logged out on app start
  const last = await localforage.getItem("lastActivity");
  if (last && Date.now() - last > INACTIVITY_LIMIT) {
    await store.logout();
    return;
  }

  setupInactivityListeners();

  // Check if we're in Tauri environment (v2)
  if (window.__TAURI_INTERNALS__) {
    try {
      const currentWindow = getCurrentWindow();

      // Use window focus/blur events as primary method
      await currentWindow.onFocusChanged(({ payload: focused }) => {
        if (focused) {
          handleAppShow();
        } else {
          handleAppHide();
        }
      });

      // Try to listen for app-level events if available
      try {
        await listen("tauri://focus", async () => {
          await handleAppShow();
        });

        await listen("tauri://blur", () => {
          handleAppHide();
        });
      } catch (eventError) {
        console.log("App-level events not available, using window events only");
      }
    } catch (error) {
      console.log("Tauri window events not available:", error);
    }
  }

  const savedPage = await localforage.getItem("cPageH");
  if (savedPage) {
    cPage.value = savedPage;
    await localforage.removeItem("cPageH");
  }

  resetInactivityTimer();
});

onUnmounted(() => {
  updateLastActivity();
  removeInactivityListeners();
});
</script>

<template>
  <div class="main-wrapper">
    <router-view></router-view>
  </div>
</template>
