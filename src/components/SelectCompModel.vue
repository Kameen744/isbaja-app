<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";

const store = useMainStore();
const { companies, cCompany } = storeToRefs(store);
const modalRef = ref(null);
let scCompanyModal = null;

const selectCompany = (event) => {
  store.setCurrentCompany(event);
  scCompanyModal.hide();
};

const props = defineProps({
  cComp: null,
});

onMounted(() => {
  if (!props.cComp) {
    scCompanyModal = new bootstrap.Modal(modalRef.value);
    scCompanyModal.show();
  }
});
</script>

<template>
  <div
    ref="modalRef"
    class="modal fade"
    data-backdrop="static"
    data-keyboard="false"
    v-if="!cComp"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Select Company</h5>
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
          <div class="form-group" v-if="companies">
            <select class="form-control" @change="selectCompany">
              <option value="" disabled="" selected="" :key="cCompany?.name">
                {{ cCompany ? cCompany.name : "Select Company" }}
              </option>
              <template v-for="com in companies.data" :key="com.id">
                <option :value="com.id" v-if="com.id != cCompany?.id">
                  {{ com.name }}
                </option>
              </template>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
