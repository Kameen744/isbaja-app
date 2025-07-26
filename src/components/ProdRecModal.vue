<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";
import ProdTable from "./ProdTable.vue";
import ProgressBar from "./ProgressBar.vue";

const store = useMainStore();
const { isOnline, offlineRecords } = storeToRefs(store);
const modalRef = ref(null);
let locaRecModal = null;

const toggleLocalRecModal = (t = false) => {
  if (t) {
    locaRecModal.show();
  } else {
    locaRecModal.hide();
  }
};

const props = defineProps({
  tabCols: Array,
  secName: String,
});

const emit = defineEmits(["update:rec", "del:rec"]);
onMounted(() => {
  locaRecModal = new bootstrap.Modal(modalRef.value);
});

defineExpose({ toggleLocalRecModal });
</script>

<template>
  <div
    ref="modalRef"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel"
            >Production Order | Local Records</h5
          >
          <button
            type="button"
            class="btn-close"
            @click="toggleLocalRecModal(false)"
            aria-label="Close"
          >
            <i class="fas fa-times-circle"></i>
          </button>
        </div>
        <div class="modal-body">
          <ProgressBar />
          <ProdTable
            :tabCols="tabCols"
            :secName="secName"
            :key="offlineRecords?.length ?? 1 + Math.random()"
            type="local"
            v-if="offlineRecords"
          />
        </div>
        <div class="modal-footer py-2">
          <button
            type="button"
            class="btn btn-dark btn-sm"
            @click="toggleLocalRecModal(false)"
            >Close</button
          >
          <button
            type="button"
            class="btn btn-primary btn-sm"
            v-if="isOnline"
            @click="store.uploadRecords(secName)"
            >Upload Records</button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.modal-body {
  max-height: 70vh;
  overflow: hidden;
  overflow-y: auto;
}
</style>
