<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";
import exportCustomer from "../functions/customer-export";
import Swal from "sweetalert2";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const { records, offlineRecords, isOnline, cCompany } = storeToRefs(store);
const customerTableRef = ref(null);
const searchTxt = ref("");
const customerRecords = ref(null);
const props = defineProps({
  tabCols: Array,
  secName: String,
  type: { default: "online" },
});

const emit = defineEmits(["edit"]);

const getInvRows = () => {
  if (props.type === "local") {
    customerRecords.value = offlineRecords.value;
    customerRecords.value = customerRecords.value.map((rec) => {
      // let itemObj = store.getItem(rec.item_id);
      // let obj = {};
      // obj.company = itemObj?.company?.name;
      // obj.created = "0000-00-00";
      return rec;
    });
  } else {
    customerRecords.value = records.value.data;
    customerRecords.value = customerRecords.value.map((rec) => {
      // let obj = {};
      // rec.item_id = rec?.item?.id;
      // rec.company_id = rec?.company?.id;
      // rec.company = rec.company.name;
      // obj = additionalProps(obj, rec, rec.item);
      // obj.created = store.fmtDate(rec.created);
      return rec;
    });
  }
};

onMounted(() => {
  getInvRows();
});

const filter = () => {
  Swal.fire({
    title: "Filter Data",
    showCancelButton: true,
    cancelButtonColor: "#d33",
    allowOutsideClick: false,
    width: "500px",
    html: `
    <div class="row">
      <div class="form-group col-md-6">
        <label for="">From</label>
        <input type="date" class="form-control" id="cutomerFrom" />
      </div>
      <div class="form-group col-md-6">
        <label for="">To</label>
        <input type="date" class="form-control" id="cutomerTo" />
      </div>  
    </div>
   `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("cutomerFrom").value,
        document.getElementById("cutomerTo").value,
      ];
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      let val = result.value;
      let url = `
      filter?model=customer&from=${val[0]}&to=${val[1]}&compId=${cCompany.value.id}
      `;
      let data = await store.req("GET", url.trim());
      store.records = data;
    }
  });
};
</script>

<template>
  <div v-if="customerRecords">
    <div class="d-flex justify-content-between">
      <div class="form-group">
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="search"
          v-model="searchTxt"
        />
      </div>

      <div class="items-center align-center">
        <button
          type="button"
          class="btn btn-primary btn-sm mx-2"
          @click="filter"
          >Filter</button
        >
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="
            exportCustomer(
              'csv',
              customerTableRef,
              customerRecords,
              tabCols,
              type
            )
          "
        >
          <i class="fas fa-file-csv"></i> CSV
        </button>
        <div class="m-1"></div>
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="
            exportCustomer(
              'print',
              customerTableRef,
              customerRecords,
              tabCols,
              type
            )
          "
        >
          <i class="fas fa-print"></i> PRINT
        </button>
      </div>
    </div>

    <vue3-datatable
      ref="customerTableRef"
      :rows="customerRecords"
      :columns="tabCols"
      :sortable="true"
      :search="searchTxt"
      :hasCheckbox="true"
      :selectRowOnClick="true"
      :stickyHeader="true"
      class="alt-pagination"
      skin="bh-table-hover"
    >
      <template #note="data">
        <button
          class="btn-sm"
          :class="data.value.type == 'add' ? 'btn-success' : 'btn-primary'"
        >
          {{ data.value.note }}
        </button>
      </template>
      <template #actions="data">
        <div class="flex">
          <button
            class="btn text-primary btn-sm"
            :class="store.allowAction(type) ? '' : 'disabled'"
            @click.prevent="emit('edit', data.value)"
          >
            <i class="fas fa-edit fa-lg"></i>
          </button>

          <!-- <button
            class="btn text-danger btn-sm"
            :class="store.allowAction(type) ? '' : 'disabled'"
            @click.prevent="store.delRecord(secName, data.value)"
          >
            <i class="fas fa-trash fa-lg"></i>
          </button> -->
        </div>
      </template>
    </vue3-datatable>
  </div>
</template>
