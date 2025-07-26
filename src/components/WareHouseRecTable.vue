<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";
import exportWareHouseRec from "../functions/warehouse-rec-export";
// import Vue3Datatable from "@bhplugin/vue3-datatable";
// import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const { bUrl, warehouses, cPage, cCompany, selectedWareHouseRecords } =
  storeToRefs(store);

const wareHouseData = ref(null);
const loading = ref(false);
const currentPage = ref(1);

const fetchwareHouseData = async (page = 1) => {
  loading.value = true;
  try {
    const res = await axios.get(
      `${bUrl.value}/api/ware-house-rec/${selectedWareHouseRecords.value.id}?page=${page}`
    );
    wareHouseData.value = res.data.data;
  } catch (e) {
    console.log("fetch error: ", e);
    wareHouseData.value = null;
  }
  loading.value = false;
};

const expCols = [
  { field: "created", title: "Date" },
  { field: "name", title: "Item" },
  { field: "bundle_added", title: "Bundle Added" },
  { field: "bundle_removed", title: "Bundle Removed" },
  { field: "unit_added", title: "Unit Added" },
  { field: "unit_removed", title: "Unit Removed" },
  { field: "weight", title: "Weight (kg)" },
  { field: "price", title: "Price" },
  { field: "sale_order_dispatched", title: "Dispatched" },
  { field: "add_note", title: "Add Note" },
  { field: "remove_note", title: "Remove Note" },
];

const dateFrom = ref("");
const dateTo = ref("");

const goToPage = (page) => {
  if (!wareHouseData.value) return;
  if (page < 1 || page > wareHouseData.value.last_page) return;
  currentPage.value = page;
  fetchwareHouseData(page);
};

const getDispatchedCount = (order) => {
  if (!order.items) return 0;
  return order.items.reduce(
    (sum, item) => sum + (Number(item.sale_order_dispatched) || 0),
    0
  );
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
        <input type="date" class="form-control" id="dateFrom" />
      </div>
      <div class="form-group col-md-6">
        <label for="">To</label>
        <input type="date" class="form-control" id="dateTo" />
      </div>
    </div>
   `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("dateFrom").value,
        document.getElementById("dateTo").value,
      ];
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      let val = result.value;
      wareHouseData.value = null;
      loading.value = true;
      try {
        dateFrom.value = val[0];
        dateTo.value = val[1];
        let url = `${bUrl.value}/api/ware-house-rec-by-date/${selectedWareHouseRecords.value.id}`;

        if (dateFrom.value) {
          url += `/${dateFrom.value}`;
        }

        if (dateTo.value) {
          url += `/${dateTo.value}`;
        }

        const res = await axios.get(url);

        wareHouseData.value = res.data;
        loading.value = false;
      } catch (e) {
        wareHouseData.value = null;
        loading.value = false;
      }
    }
  });
};
const changeWareHouse = (wh) => {
  selectedWareHouseRecords.value = wh;
  fetchwareHouseData();
};
onMounted(() => {
  fetchwareHouseData();
});
</script>

<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="card mb-3">
        <div class="card-body">
          <!-- Header Controls -->
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-3"
          >
            <button
              class="btn btn-primary btn-sm w-100 w-md-auto"
              @click="cPage = 'main'"
            >
              <i class="fas fa-arrow-circle-left"></i> Back to Dashboard
            </button>

            <div class="dropdown w-100 w-md-auto">
              <button
                class="btn btn-secondary btn-sm dropdown-toggle w-100 text-start"
                type="button"
                id="dropdownMenu2"
                data-bs-toggle="dropdown"
                aria-expanded="true"
              >
                {{ selectedWareHouseRecords?.name ?? "Warehouse" }}
              </button>
              <ul class="dropdown-menu w-100" aria-labelledby="dropdownMenu2">
                <li v-for="wh in warehouses.data" :key="wh.id">
                  <button
                    v-if="wh.company.id === cCompany.id"
                    class="dropdown-item"
                    type="button"
                    @click="changeWareHouse(wh)"
                  >
                    {{ wh.name }}
                  </button>
                </li>
              </ul>
            </div>

            <button
              type="button"
              class="btn btn-primary btn-sm w-100 w-md-auto"
              @click="filter"
            >
              Filter by date
            </button>

            <button
              type="button"
              class="btn btn-sm btn-secondary w-100 w-md-auto"
              @click="
                exportWareHouseRec(
                  'print',
                  wareHouseData.data,
                  expCols,
                  selectedWareHouseRecords.name,
                  dateFrom,
                  dateTo
                )
              "
            >
              <i class="fas fa-file-pdf"></i> PRINT
            </button>
          </div>

          <!-- Title (separate to reduce wrap issue) -->
          <div class="mb-3 text-center text-md-start">
            <h4 class="card-title mb-0">{{ selectedWareHouseRecords.name }}</h4>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center">Loading...</div>

          <!-- Table Content -->
          <div v-else>
            <div v-if="wareHouseData && wareHouseData?.data?.length">
              <div class="table-responsive dataview">
                <table
                  class="table table-bordered table-hover table-sm datatable"
                >
                  <thead class="table-light text-nowrap">
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Bundle Added</th>
                      <th>Bundle Removed</th>
                      <th>Unit Added</th>
                      <th>Unit Removed</th>
                      <th>Weight (kg)</th>
                      <th>Price</th>
                      <th>Dispatched</th>
                      <th>Add Note</th>
                      <th>Remove Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="rec in wareHouseData.data" :key="rec.id">
                      <td>{{ rec.created }}</td>
                      <td>{{ rec.item?.name }}</td>
                      <td>{{ rec.bundle_added }}</td>
                      <td>{{ rec.bundle_removed }}</td>
                      <td>{{ rec.unit_added }}</td>
                      <td>{{ rec.unit_removed }}</td>
                      <td>{{ rec.weight }}</td>
                      <td>{{
                        store.fmtNum ? store.fmtNum(rec.price) : rec.price
                      }}</td>
                      <td>{{ rec.sale_order_dispatched }}</td>
                      <td>{{ rec.add_note }}</td>
                      <td>{{ rec.remove_note }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav v-if="wareHouseData?.links" class="mt-3">
                <ul class="pagination justify-content-center flex-wrap">
                  <li
                    v-for="link in wareHouseData.links"
                    :key="link.label"
                    class="page-item"
                    :class="{ active: link.active, disabled: !link.url }"
                  >
                    <button
                      class="page-link"
                      @click="link.url && goToPage(Number(link.label))"
                      v-html="link.label"
                    ></button>
                  </li>
                </ul>
              </nav>
            </div>
            <div v-else class="alert alert-info text-center">
              No records available.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style></style>
