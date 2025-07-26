<script setup>
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";

const store = useMainStore();
const { isOnline } = storeToRefs(store);
</script>

<template>
  <div class="pt-2">
    <i
      class="h1 fas fa-wifi"
      :class="isOnline ? 'text-success' : 'text-danger'"
      aria-hidden="true"
    ></i>
  </div>
</template>
