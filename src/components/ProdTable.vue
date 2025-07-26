<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";
import exportProduction from "../functions/production-export";
import Swal from "sweetalert2";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const { records, offlineRecords, isOnline, cCompany, authUser } =
  storeToRefs(store);
const productionTableRef = ref(null);
const searchTxt = ref("");

const props = defineProps({
  tabCols: Array,
  secName: String,
  type: { default: "online" },
});

const filteredData = ref(null);
const emit = defineEmits(["edit:rec"]);

const getProdRows = () => {
  if (props.type === "local") {
    if (offlineRecords.value) {
      filteredData.value = offlineRecords.value.map((item) => {
        item.shift_start = store.fmtDateT(item.start_date);
        item.shift_end = store.fmtDateT(item.end_date);
        item.prod_weight = 0;
        item.raw_weight = 0;

        for (let i = 0; i < item.produced.length; i++) {
          item.produced[i].item = store.getItem(item.produced[i].item_id);
          item.prod_weight +=
            Number(item.produced[i].item.bundle_weight) *
            Number(item.produced[i].bundle_added);
        }

        for (let i = 0; i < item.used.length; i++) {
          item.used[i].item = store.getItem(item.used[i].item_id);
          item.raw_weight += item.used[i].weight;
        }

        item.prod_weight = `${item.prod_weight} KG(s)`;
        item.raw_weight = `${item.raw_weight} KG(s)`;
        return item;
      });
    } else {
      filteredData.value = offlineRecords.value;
    }
  } else {
    filteredData.value = records.value.data.map((item) => {
      item.shift_start = store.fmtDateT(item.start_date);
      item.shift_end = store.fmtDateT(item.end_date);
      item.prod_weight = 0;
      item.raw_weight = 0;

      for (let i = 0; i < item.produced.length; i++) {
        item.prod_weight +=
          Number(item.produced[i].item.bundle_weight) *
          Number(item.produced[i].bundle_added);
      }

      for (let i = 0; i < item.used.length; i++) {
        item.raw_weight += Number(item.used[i].weight);
      }

      item.prod_weight = `${item.prod_weight} KG(s)`;
      item.raw_weight = `${item.raw_weight} KG(s)`;
      return item;
    });
  }
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
        <input type="date" class="form-control" id="prodFrom" />
      </div>
      <div class="form-group col-md-6">
        <label for="">To</label>
        <input type="date" class="form-control" id="prodTo" />
      </div>
      <div class="form-group col-md-6">
        <label for="">Product</label>
        <input type="text" class="form-control" id="PrPro" placeholder="Product" />
      </div>
      <div class="form-group col-md-6">
        <label for="">Raw Material</label>
        <input type="text" class="form-control" id="PrRaw" placeholder="Raw material" />
      </div>
    </div>
   `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("prodFrom").value,
        document.getElementById("prodTo").value,
        document.getElementById("PrPro").value,
        document.getElementById("PrRaw").value,
      ];
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      let val = result.value;
      let url = `filter?model=production&prod=${val[2]}&raw=${val[3]}&from=${val[0]}&to=${val[1]}&compId=${cCompany.value.id}`;
      let data = await store.req("GET", url);
      store.records = data;
      getProdRows();
    }
  });
};

onMounted(() => {
  getProdRows();
});
</script>

<template>
  <div v-if="filteredData">
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
            exportProduction(
              'csv',
              productionTableRef,
              filteredData,
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
            exportProduction(
              'print',
              productionTableRef,
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
      ref="productionTableRef"
      :rows="filteredData"
      :columns="tabCols"
      :sortable="true"
      :sortColumn="tabCols.created"
      sortDirection="desc"
      :search="searchTxt"
      :hasCheckbox="true"
      :selectRowOnClick="true"
      :stickyHeader="true"
      class="alt-pagination"
      skin="bh-table-hover"
    >
      <template #produced="data">
        <div
          class="alert alert-success p-0 m-0 mb-1 text-center"
          v-for="item in data.value.produced"
          :key="item.id"
        >
          {{ item.item.name }} &ThickSpace;
          <strong>{{ store.fmtNum(item.bundle_added) }} </strong>
          &ThickSpace;
          <span v-if="item?.item?.bundle_measure">
            {{ item.item.bundle_measure }}(s)</span
          >
        </div>
      </template>
      <template #used="data">
        <div
          class="alert alert-danger p-0 m-0 mb-1 text-center"
          v-for="item in data.value.used"
          :key="item.id"
        >
          {{ item.item.name }} &ThickSpace;
          <strong>{{ store.fmtNum(item.bundle_removed) }} </strong>
          &ThickSpace;
          <span v-if="item?.item?.bundle_measure">
            {{ item.item.bundle_measure }}(s)</span
          >
        </div>
      </template>
      <!-- <template #created="data">
        <span v-if="!data.value?.created">0000-00-00</span>
        <span v-else>{{ store.fmtDate(data.value.created) }}</span>
      </template> -->
      <!-- <template #end_date="data">
        {{ store.fmtDate(data.value.end_date) }}
      </template> -->
      <template #actions="data">
        <div class="flex gap-4">
          <button
            class="btn text-primary btn-sm"
            :class="store.allowAction(type) ? '' : 'disabled'"
            @click.prevent="store.editProductionOrder(secName, data.value)"
            :disabled="!authUser.permissions.includes('productions:edit')"
          >
            <i class="fas fa-edit fa-lg"></i>
          </button>
          <button
            class="btn text-danger btn-sm"
            :class="store.allowAction(type) ? '' : 'disabled'"
            @click.prevent="store.delRecord(secName, data.value)"
            :disabled="!authUser.permissions.includes('productions:delete')"
          >
            <i class="fas fa-trash-alt fa-lg"></i>
          </button>
        </div>
      </template>
    </vue3-datatable>
  </div>
</template>
