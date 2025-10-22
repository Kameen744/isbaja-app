<template>
  <div class="page-wrapper">
    <div class="content">
      <hr />

      <!-- Filter Button -->
      <div class="mb-3 text-center text-md-start">
        <button type="button" class="btn btn-primary btn-sm" @click="filter">
          Report Filter
        </button>
      </div>

      <!-- Raw Materials Report -->
      <div class="card mb-3">
        <div class="card-body"> row mater </div>
      </div>

      <!-- Finished Products Report -->
      <div class="card mb-3">
        <div class="card-body"> Finish prod </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";

const store = useMainStore();
const {
  cPage,
  cCompany,
  appInitialized,
  totals,
  authUser,
  warehouses,
  selectedWareHouseRecords,
} = storeToRefs(store);
</script>
