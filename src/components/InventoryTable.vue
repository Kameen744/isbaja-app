<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";
import exportInventory from "../functions/inventory-export";
import Swal from "sweetalert2";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const {
  records,
  queryParams,
  offlineRecords,
  items,
  isOnline,
  cCompany,
  authUser,
} = storeToRefs(store);
const inventoryTableRef = ref(null);
const searchTxt = ref("");
const inventoryRecords = ref(null);
const inventoryLocalRecords = ref(null);
const props = defineProps({
  tabCols: Array,
  secName: String,
  type: { default: "online" },
});

const emit = defineEmits(["edit"]);

const additionalProps = (obj, rec, itemObj) => {
  const isAddNote = rec.add_note && rec.add_note !== "N/A";
  obj.item = itemObj.name;
  obj.note = isAddNote ? rec.add_note : rec.remove_note;
  obj.bundle = isAddNote ? rec.bundle_added : rec.bundle_removed;
  obj.unit = isAddNote ? rec.unit_added : rec.unit_removed;
  obj.type = isAddNote ? "add" : "remove";
  obj.ware_house_id = rec.ware_house_id;
  obj.item_id = rec?.item_id;
  obj.supplier_id = rec.supplier_id;
  obj.weight = rec.weight;
  obj.company_id = rec?.company_id ?? "";

  let sts = `${obj.bundle} `;
  if (itemObj?.bundle_measure) {
    sts += `${itemObj.bundle_measure}(s)`;
  }

  if (itemObj?.unit_measure && obj.unit > 0) {
    sts += ` and ${obj.unit} ${itemObj.unit_measure}(s)`;
  }

  obj.status = sts;

  return obj;
};

const getInvRows = async () => {
  let recordsToMap;

  if (props.type === "local") {
    recordsToMap = offlineRecords.value;
  } else {
    recordsToMap = (await records.value.data) || [];
  }

  inventoryRecords.value = recordsToMap.map((rec) => {
    let obj = {};
    let itemObj =
      props.type === "local" ? store.getItem(rec.item_id) : rec.item;

    obj = additionalProps(obj, rec, itemObj);

    if (rec?.ware_house_id) {
      const wareObj = store.getWarehouse(rec.ware_house_id);
      obj.warehouse_name = wareObj?.name ?? " - ";
    }

    if (rec?.supplier_id) {
      const suppObj = store.getSupplier(rec.supplier_id);
      obj.supplier_name = suppObj?.name ?? " - ";
      obj.supplier_phone = suppObj?.phone ?? "";
      obj.supplier_acc_no = suppObj?.acc_no ?? "";
    } else {
      obj.supplier_name = " - ";
    }

    obj.company = itemObj?.company?.name ?? " - ";
    obj.created =
      props.type === "local" ? "0000-00-00" : store.fmtDate(rec.created);
    obj.id = rec?.id;

    return obj;
  });
};

// const additionalProps = (obj, rec, itemObj) => {
//   if (rec.add_note && rec.add_note != "N/A") {
//     obj.item = itemObj.name;
//     obj.note = rec.add_note;
//     obj.bundle = rec.bundle_added;
//     obj.unit = rec.unit_added;
//     obj.type = "add";
//   } else {
//     obj.item = itemObj.name;
//     obj.note = rec.remove_note;
//     obj.bundle = rec.bundle_removed;
//     obj.unit = rec.unit_removed;
//     obj.type = "remove";
//   }

//   let sts = `${obj.bundle} `;
//   if (itemObj?.bundle_measure && itemObj.bundle_measure != "") {
//     sts += `${itemObj.bundle_measure}(s)`;
//   }

//   if (itemObj?.unit_measure && itemObj.unit_measure != "") {
//     if (obj.unit && obj.unit > 0) {
//       sts = sts + ` and ${obj.unit} ${itemObj.unit_measure}(s)`;
//     }
//   }
//   obj.status = sts;
//   return obj;
// };

// const getInvRows = async () => {
//   if (props.type === "local") {
//     inventoryRecords.value = offlineRecords.value;
//     inventoryRecords.value = inventoryRecords.value.map((rec) => {
//       let itemObj = store.getItem(rec.item_id);
//       let obj = {};
//       obj = additionalProps(obj, rec, itemObj);
//       if (rec?.ware_house_id != "") {
//         let suppObj = store.getWarehouse(rec.ware_house_id);
//         obj.warehouse_name = suppObj?.name;
//       }
//       if (rec?.supplier_id != "") {
//         let suppObj = store.getSupplier(rec.supplier_id);
//         obj.supplier_name = suppObj?.data?.name;
//       } else {
//         obj.supplier_name = "";
//       }
//       obj.company = itemObj?.company?.name;
//       obj.created = "0000-00-00";
//       obj.id = rec?.id;
//       return obj;
//     });
//   } else {
//     inventoryRecords.value = await records.value.data;
//     inventoryRecords.value = inventoryRecords.value.map((rec) => {
//       let obj = {};
//       let wareObj = store.getWarehouse(rec.ware_house_id);
//       rec.item_id = rec?.item?.id;
//       rec.company_id = rec?.company?.id ?? rec.item.company.id;
//       rec.company = rec?.company?.name ?? rec.item.company.name;
//       obj = additionalProps(obj, rec, rec.item);
//       obj.supplier_name = rec?.supplier?.name ?? " - ";
//       obj.warehouse_name = wareObj?.name ?? " - ";
//       obj.created = store.fmtDate(rec.created);
//       obj.id = rec?.id;
//       return obj;
//     });
//   }
// };

onMounted(async () => {
  // queryParams.value = `col=company_id&colId=${cCompany.value.id}`;
  // await store.getRecord(props.secName);
  getInvRows();
});

const filter = () => {
  let slItmHtml = `<div class="form-group col-md-6">
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
       
      <div class="form-group col-md-6">
        <label for="">Note</label>
        <select class="form-control" id="invNote">
          <option value="">Note</option>
          <option value="Inventory Top-up">Inventory Top-up</option>
          <option value="Added from Production">Added from Production</option>
          <option value="Removed for Production">Removed for Production</option>
          <option value="Returned Product">Returned Product</option>
          <option value="Damaged Product">Damaged Product</option>
          <option value="Donated">Donated</option>
          <option value="Expired Product">Expired Product</option>
          <option value="Sales Order">Sales Order</option>
        </select>
      </div>
      ${slItmHtml}
    </div>
   `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("invFrom").value,
        document.getElementById("invTo").value,
        document.getElementById("invNote").value,
        document.getElementById("invItem").value,
      ];
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      let val = result.value;
      let url = `filter?model=inventory&note=${val[2]}&from=${val[0]}&to=${val[1]}&compId=${cCompany.value.id}&item=${val[3]}`;
      let data = await store.req("GET", url);
      store.records = data;
      getInvRows();
    }
  });
};
</script>

<template>
  <div v-if="inventoryRecords">
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
            exportInventory(
              'csv',
              inventoryTableRef,
              inventoryRecords,
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
            exportInventory(
              'print',
              inventoryTableRef,
              inventoryRecords,
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
      ref="inventoryTableRef"
      :rows="inventoryRecords"
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
            class="btn text-primary btn-sm"
            :class="
              store.allowAction(type)
                ? ''
                : data.value.note == 'Inventory Top-up'
                ? 'disabled'
                : 'disabled'
            "
            @click.prevent="emit('edit', data.value)"
            :disabled="
              !authUser.permissions.includes('inventories:edit')
                ? true
                : data.value.note != 'Inventory Top-up'
                ? true
                : false
            "
          >
            <i class="fas fa-edit fa-lg"></i>
          </button>

          <button
            class="btn text-danger btn-sm"
            :class="
              store.allowAction(type)
                ? ''
                : data.value.note == 'Inventory Top-up'
                ? 'disabled'
                : 'disabled'
            "
            @click.prevent="store.delRecord(secName, data.value)"
            :disabled="
              !authUser.permissions.includes('inventories:delete')
                ? true
                : data.value.note != 'Inventory Top-up'
                ? true
                : false
            "
          >
            <i class="fas fa-trash fa-lg"></i>
          </button>
        </div>
      </template>
    </vue3-datatable>
  </div>
</template>
