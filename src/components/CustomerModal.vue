<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";
import CustomerTable from "./CustomerTable.vue";
import ProgressBar from "./ProgressBar.vue";

const store = useMainStore();
const { isOnline, offlineRecords } = storeToRefs(store);
const modalRef = ref(null);
let customerLocaRecModal = null;

const toggleLocalRecModal = (t = false) => {
  if (t) {
    customerLocaRecModal.show();
  } else {
    customerLocaRecModal.hide();
  }
};

const props = defineProps({
  tabCols: Array,
  secName: String,
});

const emit = defineEmits(["update:rec", "del:rec"]);

onMounted(() => {
  customerLocaRecModal = new bootstrap.Modal(modalRef.value);
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
            >Customer | Local Records</h5
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
          <CustomerTable
            :tabCols="tabCols"
            :secName="secName"
            :key="`customer-local-${offlineRecords?.length}`"
            type="local"
            v-if="offlineRecords"
          />
        </div>
        <div class="modal-footer py-2">
          <button
            type="button"
            class="btn btn-dark btn-sm"
            @click="toggleLocalRecModal(false)"
            >Close
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            v-if="isOnline"
            @click="store.uploadRecords(secName)"
            >Upload Records
          </button>
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
