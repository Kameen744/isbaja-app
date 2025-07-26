<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";
// import exportinventoryTransfer from "../functions/inventoryTransfer-export";
import Swal from "sweetalert2";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const { offlineRecords, items, isOnline, cCompany, authUser } =
  storeToRefs(store);
const inventoryTransferTableRef = ref(null);
const searchTxt = ref("");
const inventoryTransferRecords = ref(null);
const inventoryTransferLocalRecords = ref(null);

const props = defineProps({
  tabCols: Array,
  secName: String,
  type: { default: "online" },
});

const emit = defineEmits(["edit"]);

const getInvRows = async (records) => {
  let recordsToMap;

  if (props.type === "local") {
    recordsToMap = offlineRecords.value;
  } else {
    recordsToMap = (await records.data) || [];
  }

  inventoryTransferRecords.value = recordsToMap.map((rec) => {
    let obj = {};
    let itemObj =
      props.type === "local" ? store.getItem(rec.item_id) : rec.item;

    obj.item = itemObj.name;
    obj.bundle_transfered = rec.bundle_transfered;

    if (rec?.ware_house_from) {
      const wareObj = store.getWarehouse(rec.ware_house_from);
      obj.from = wareObj?.name ?? " - ";
    }

    if (rec?.ware_house_to) {
      const wareObj = store.getWarehouse(rec.ware_house_to);
      obj.to = wareObj?.name ?? " - ";
    }

    obj.company = itemObj?.company?.name ?? " - ";
    obj.created =
      props.type === "local" ? "0000-00-00" : store.fmtDate(rec.created);
    obj.id = rec?.id;
    return obj;
  });
};

onMounted(async () => {
  // getInvRows(records);
  // inventory-transfer
  let params = `col=company_id&colId=${cCompany.value.id}`;
  let recs = await store.req("get", "inventory-transfer?" + params);
  if (recs.code == 200) {
    getInvRows(recs);
  }
});

const filter = () => {
  let slItmHtml = `
    <div class="form-group col-md-12">
    <label for="">Prod/Raw material</label>
    <select class="form-control" id="invItem">
    <option value="">Prod/Raw Materials</option>
  `;

  for (let i = 0; i < items.value.data.length; i++) {
    const item = items.value.data[i];
    slItmHtml += `<option value="${item.id}">${item.name}</option>`;
  }

  slItmHtml += "</select></div>";

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
        <input type="date" class="form-control" id="invFrom" />
      </div>
      <div class="form-group col-md-6">
        <label for="">To</label>
        <input type="date" class="form-control" id="invTo" />
      </div>
      ${slItmHtml}
    </div>
   `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("invFrom").value,
        document.getElementById("invTo").value,
        document.getElementById("invItem").value,
      ];
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      let val = result.value;
      let url = `filter?model=ItemTransfer&from=${val[0]}&to=${val[1]}&compId=${cCompany.value.id}&item=${val[2]}`;
      let data = await store.req("GET", url);
      getInvRows(data);
    }
  });
};
</script>

<template>
  <div v-if="inventoryTransferRecords">
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
      </div>
    </div>

    <vue3-datatable
      ref="inventoryTransferTableRef"
      :rows="inventoryTransferRecords"
      :columns="tabCols"
      :sortable="true"
      :search="searchTxt"
      :hasCheckbox="true"
      :selectRowOnClick="true"
      :stickyHeader="true"
      sortColumn="created"
      sortDirection="asc"
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
            class="btn text-danger btn-sm"
            :class="
              store.allowAction(type)
                ? ''
                : data.value.note == 'inventoryTransfer Top-up'
                ? 'disabled'
                : 'disabled'
            "
            @click.prevent="store.delRecord(secName, data.value)"
            :disabled="!authUser.permissions.includes('inventories:delete')"
          >
            <i class="fas fa-trash fa-lg"></i>
          </button>
        </div>
      </template>
    </vue3-datatable>
  </div>
</template>
