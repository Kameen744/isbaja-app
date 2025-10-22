<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";
import exportSaleDispatchLog from "../functions/sale-dispatch-log-export";
import printSaleOrder from "../functions/sale-order-print";
import DispatchModal from "./DispatchModal.vue";
import Swal from "sweetalert2";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const {
  records,
  offlineRecords,
  cCompany,
  customers,
  isOnline,
  constVars,
  authUser,
  queryParams,
} = storeToRefs(store);
const saleTableRef = ref(null);
const searchTxt = ref("");
const showStatusOptionsId = ref(null);

const props = defineProps({
  tabCols: Array,
  secName: String,
  type: { default: "online" },
});

const emit = defineEmits(["edit:rec", "downloadReceift"]);

const donwnloadRec = (data) => {
  emit("downloadReceift", data);
};

const showOptions = (id) => {
  if (showStatusOptionsId.value == null) {
    showStatusOptionsId.value = id;
  } else {
    showStatusOptionsId.value = null;
  }
};

const changeStatus = async (data, stat) => {
  showStatusOptionsId.value = null;

  let strq = await store.req("POST", `/sale-order-status/${data.id}`, {
    stat: stat,
    updated_by_id: authUser.value.id,
  });

  if (strq.code == 200) {
    store.getRecord("sale");
  }
};

const filteredData = ref(null);

const getProdRows = async () => {
  queryParams.value = `col=company_id&colId=${cCompany.value.id}`;
  const data = await store.req("get", `${props.secName}?${queryParams.value}`);
  filteredData.value = data.data;
};

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
      filter?model=dispatch&from=${val[0]}&to=${val[1]}&compId=${cCompany.value.id}
      `;
      let data = await store.req("GET", url.trim());
      // console.log(data);
      filteredData.value = data.data;
    }
  });
};

const dispatchOrderModalRef = ref(null);
const showDispatchOrderModal = (data, t = true) => {
  dispatchOrderModalRef.value.toggleDispatchModal(data, t);
};
onMounted(() => {
  getProdRows();
});
</script>

<template>
  <div>
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
        <!-- <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="
            exportSaleOrder('csv', saleTableRef, filteredData, tabCols, type)
          "
        >
          <i class="fas fa-file-csv"></i> CSV
        </button> -->
        <div class="m-1"></div>
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="
            exportSaleDispatchLog(
              'print',
              saleTableRef,
              filteredData,
              tabCols,
              type
            )
          "
        >
          <i class="fas fa-file-pdf"></i> PRINT
        </button>
      </div>
    </div>

    <vue3-datatable
      ref="saleTableRef"
      :rows="filteredData"
      :columns="tabCols"
      :sortable="true"
      :sortColumn="tabCols.created"
      sortDirection="desc"
      :search="searchTxt"
      :hasCheckbox="true"
      :selectRowOnClick="false"
      :stickyHeader="true"
      class="alt-pagination"
      skin="bh-table-hover"
    >
      <!-- <template #product="data">
        <div
          class="alert alert-success p-0 m-0 mb-1 text-center"
          v-for="item in data.value.items"
          :key="item.id"
        >
          {{ item.item.name }} &ThickSpace;
          <strong>{{ store.fmtNum(item.bundle_removed) }} </strong>
          &ThickSpace;
          <span v-if="item?.item?.bundle_measure">
            {{ item.item.bundle_measure }}(s)</span
          >
        </div>
      </template> -->

      <!-- <template #created="data">
        <span v-if="!data.value?.created">{{
          store.fmtDate(data.value.local_date)
        }}</span>
        <span v-else>{{ store.fmtDate(data.value.created) }}</span>
      </template> -->

      <!-- <template #actions="data">
        <div class="flex gap-4">
          <button
            class="btn text-success btn-sm"
            @click="showDispatchOrderModal(data.value)"
          >
            <i class="fas fa-eye fa-lg"></i>
          </button>
          <button
            class="btn text-primary btn-sm"
            :class="store.allowAction(type) ? '' : 'disabled'"
            @click.prevent="store.editSaleOrder(secName, data.value)"
            :disabled="!authUser.permissions.includes('sales:edit')"
          >
            <i class="fas fa-edit fa-lg"></i>
          </button>
          <button
            class="btn text-danger btn-sm"
            :class="store.allowAction(type) ? '' : 'disabled'"
            @click.prevent="store.delRecord(secName, data.value)"
            :disabled="!authUser.permissions.includes('sales:delete')"
          >
            <i class="fas fa-trash-alt fa-lg"></i>
          </button>
        </div>
      </template> -->
    </vue3-datatable>
    <!-- <DispatchModal
      ref="dispatchOrderModalRef"
      @dispatchModalDownloadReceift="donwnloadRec"
    /> -->
  </div>
</template>
<style></style>
