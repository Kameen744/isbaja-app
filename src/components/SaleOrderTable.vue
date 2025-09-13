<script setup>
import { onMounted, ref, nextTick } from "vue";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";
import exportSaleOrder from "../functions/sale-order-export";
import printSaleOrder from "../functions/sale-order-print";
import DispatchModal from "./DispatchModal.vue";
import Swal from "sweetalert2";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const {
  records,
  offlineRecords,
  queryParams,
  cCompany,
  customers,
  isOnline,
  constVars,
  authUser,
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
const totalRows = ref(null);
const currentPage = ref(1);
const pageSize = ref(20);
const sortBy = ref("created_at");
const sortDir = ref("desc");
const tabLoading = ref(false);
const tableKey = ref(0);

const getProdRows = async () => {
  if (props.type === "local") {
    if (offlineRecords.value) {
      filteredData.value = offlineRecords.value.map(async (item) => {
        item.create = item.local_date;
        item.status = "Pending";

        item.created_by = authUser.name ?? "local data";
        item.updated_by = authUser.name ?? "local data";

        item.customer = await store.getObj(
          customers.value.data,
          item.customer_id
        );

        item.customer_name = item.customer.name;
        for (let i = 0; i < item.items.length; i++) {
          item.items[i].item = store.getItem(item.items[i].item_id);
        }

        return item;
      });
    } else {
      filteredData.value = offlineRecords.value;
    }
  } else {
    const params = new URLSearchParams(queryParams.value);
    params.set("size", pageSize.value);
    let data = await store.req("GET", `sale?${params.toString()}`);

    totalRows.value = data.data.total;
    currentPage.value = data.data.current_page;
    pageSize.value = data.data.per_page;

    filteredData.value = data.data.data.map((item) => {
      item.customer_name = item?.customer?.name;
      return item;
    });

    tableKey.value += 1;
    tabLoading.value = false;
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
        <input type="date" class="form-control" id="saleFrom" />
      </div>
      <div class="form-group col-md-6">
        <label for="">To</label>
        <input type="date" class="form-control" id="saleTo" />
      </div>
      <div class="form-group col-md-6">
        <label for="">Customer</label>
        <input type="text" class="form-control" id="slOcustm" placeholder="Customer" />
      </div>
      <div class="form-group col-md-6">
        <label for="">Item Sold</label>
        <input type="text" class="form-control" id="slOitem" placeholder="Item Sold" />
      </div>
    </div>
   `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("saleFrom").value,
        document.getElementById("saleTo").value,
        document.getElementById("slOcustm").value,
        document.getElementById("slOitem").value,
      ];
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      let val = result.value;
      let url = `filter?model=sale&customer=${val[2]}&item=${val[3]}&from=${val[0]}&to=${val[1]}&compId=${cCompany.value.id}`;
      let data = await store.req("GET", url);
      store.records = data;
      getProdRows();
    }
  });
};

const dispatchOrderModalRef = ref(null);
// const dispatchData = ref(null);
const showDispatchOrderModal = (data, t = true, allData) => {
  // dispatchData.value = data;
  dispatchOrderModalRef.value.toggleDispatchModal(data, t);
};

onMounted(() => {
  getProdRows();
});

const onTableChange = async (pagination) => {
  tabLoading.value = true;
  currentPage.value = pagination.current_page;
  pageSize.value = pagination.pagesize;
  sortBy.value = pagination.sort_column;
  sortDir.value = pagination.sort_direction;

  const params = new URLSearchParams(queryParams.value);
  params.set("page", currentPage.value);
  params.set("size", pageSize.value);
  params.set("sort_column", sortBy.value);
  params.set("sort_direction", sortDir.value);
  if (searchTxt.value) {
    params.set("search", searchTxt.value);
  }

  let data = await store.req("GET", `sale?${params.toString()}`);

  filteredData.value = data.data.data.map((item) => {
    item.customer_name = item?.customer?.name;
    return item;
  });

  tableKey.value += 1;
  tabLoading.value = false;
};
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
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="
            exportSaleOrder('csv', saleTableRef, filteredData, tabCols, type)
          "
        >
          <i class="fas fa-file-csv"></i> CSV
        </button>
        <div class="m-1"></div>
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="
            exportSaleOrder('print', saleTableRef, filteredData, tabCols, type)
          "
        >
          <i class="fas fa-file-pdf"></i> PRINT
        </button>
      </div>
    </div>

    <!-- ref="saleTableRef"
      :rows="filteredData"
      :columns="tabCols"
      :totalRows="totalRows"
      :isServerSide="true"
      :loading="tabLoading"
      :page="currentPage"
      :pageSize="pageSize"
      @change="onTableChange" -->

    <!-- :rows="filteredData"
      :columns="tabCols"
      :sortable="true"
      :totalRows="totalRows"
      :page="currentPage"
      :isServerMode="true"
      :sortColumn="tabCols.created"
      sortDirection="desc"
      :search="searchTxt"
      :hasCheckbox="true"
      :selectRowOnClick="false"
      :stickyHeader="true"
      class="alt-pagination"
      skin="bh-table-hover"
      @change="onTableChange" -->

    <vue3-datatable
      ref="saleTableRef"
      :key="tableKey"
      :loading="tabLoading"
      :rows="filteredData"
      :columns="tabCols"
      :sortable="true"
      :totalRows="totalRows"
      :page="currentPage"
      :isServerMode="true"
      :sortColumn="tabCols.created"
      sortDirection="desc"
      :search="searchTxt"
      :hasCheckbox="true"
      :selectRowOnClick="false"
      :stickyHeader="true"
      :pageSize="pageSize"
      class="alt-pagination"
      skin="bh-table-hover"
      @change="onTableChange"
    >
      <template #product="data">
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
      </template>

      <template #created="data">
        <span v-if="!data.value?.created">{{
          store.fmtDate(data.value.local_date)
        }}</span>
        <span v-else>{{ store.fmtDate(data.value.created) }}</span>
      </template>

      <template #actions="data">
        <div class="flex gap-4">
          <button
            class="btn text-success btn-sm"
            @click="showDispatchOrderModal(data.value, true, filteredData)"
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
      </template>
    </vue3-datatable>
    <DispatchModal
      ref="dispatchOrderModalRef"
      @dispatchModalDownloadReceift="donwnloadRec"
    />
  </div>
</template>
<style></style>
