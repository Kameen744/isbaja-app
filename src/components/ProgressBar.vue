<script setup>
import { watch } from "vue";
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";
const store = useMainStore();
const { uploadProgress } = storeToRefs(store);

watch(uploadProgress, (newValue, oldValue) => {
  if (newValue === 100) {
    uploadProgress.value = 0;
  }
});
</script>

<template>
  <div class="progress progress-bar-animated mb-3" v-if="uploadProgress > 0">
    <div
      class="progress-bar bg-success progress-bar-striped progress-bar-animated"
      :style="`width: ${uploadProgress}%`"
    >
      {{ uploadProgress }}% - Uploaded</div
    >
  </div>
</template>
