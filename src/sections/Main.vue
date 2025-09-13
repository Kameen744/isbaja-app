<script setup>
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";
import SelectCompModel from "./../components/SelectCompModel.vue";
import exportProdTotal from "../functions/prod-total-export";
import exportRawTotal from "../functions/raw-total-export";
// InputField is imported but not used, can be removed if truly not needed.
// import InputField from "../components/InputField.vue";
import { onMounted, ref, watch } from "vue";
import Swal from "sweetalert2";

const store = useMainStore();
const {
  cPage,
  cCompany,
  appInitialized,
  totals,
  authUser,
  warehouses,
  selectedWareHouseRecords,
} = storeToRefs(store);

const selectCompanyPrompt = ref(false);
// mode is declared but not used, can be removed if not needed.
// const mode = ref("raw/prod");

// Reactive variables for filter dates and warehouse
const filterFrom = ref("");
const filterTo = ref("");
const selectedWarehouse = ref("");

onMounted(async () => {
  if (authUser.value?.company) {
    cCompany.value = authUser.value.company.company;
  } else {
    selectCompanyPrompt.value = true;
  }

  // Initial fetch of totals if a company is already selected
  if (cCompany.value) {
    await fetchTotals();
  }
});

// Watch for changes in cCompany to fetch totals
watch(cCompany, async (newCompany) => {
  if (newCompany) {
    await fetchTotals();
  }
});

/**
 * Fetches dashboard totals based on the current company and filter criteria.
 */
const fetchTotals = async () => {
  if (!cCompany.value?.id) {
    console.warn("No company selected to fetch totals.");
    return;
  }
  try {
    const url = `dashboard/totals/${cCompany.value.id}`;
    totals.value = await store.req("get", url);
  } catch (error) {
    console.error("Error fetching dashboard totals:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch dashboard totals. Please try again.",
    });
  }
};

const filter = async () => {
  // Reset values before opening the filter modal
  filterFrom.value = "";
  filterTo.value = "";
  selectedWarehouse.value = "";

  const { value: formValues } = await Swal.fire({
    title: "Filter Data",
    showCancelButton: true,
    cancelButtonColor: "#d33",
    allowOutsideClick: false,
    width: "500px",
    html: `
      <div class="row">
        <div class="form-group col-md-6">
          <label for="filterFrom">From</label>
          <input type="date" class="form-control" id="filterFrom" value="${
            filterFrom.value
          }" />
        </div>
        <div class="form-group col-md-6">
          <label for="filterTo">To</label>
          <input type="date" class="form-control" id="filterTo" value="${
            filterTo.value
          }" />
        </div>
        <div class="form-group col-md-12">
          <label for="wareHouse">Warehouse</label>
          <select class="form-control" id="wareHouse">
            <option value="">Filter by Warehouse</option>
            ${warehouses.value?.data
              ?.map(
                (item) =>
                  `<option value="${item.id}" ${
                    selectedWarehouse.value === item.id ? "selected" : ""
                  }>${item.name}</option>`
              )
              .join("")}
          </select>
        </div>
      </div>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const from = document.getElementById("filterFrom").value;
      const to = document.getElementById("filterTo").value;
      const warehouse = document.getElementById("wareHouse").value;

      return [from, to, warehouse];
    },
  });

  if (formValues) {
    const [from, to, warehouse] = formValues;
    filterFrom.value = from;
    filterTo.value = to;
    selectedWarehouse.value = warehouse;

    try {
      let url = `filter?model=total&from=${from}&to=${to}&compId=${
        cCompany.value.id
      }&warehouse=${warehouse || ""}`;
      const data = await store.req("GET", url.trim());
      store.totals = data; // Directly update the store's totals
    } catch (error) {
      console.error("Error filtering data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to filter data. Please try again.",
      });
    }
  }
};

const prodTotalCols = [
  { title: "Warehouse" },
  { title: "Item" },
  { title: "Qty Added" },
  { title: "Qty Sold" },
  { title: "Qty Dsptch" },
  { title: "Amount Sold" },
  { title: "Amount Dsptch" },
  { title: "Qty in Stock" },
];

const rawTotalCols = [
  { title: "Warehouse" },
  { title: "Item" },
  { title: "Qty Added" },
  { title: "Qty Removed" },
  { title: "Qty in Stock" },
];

const handleWarehouseTabClick = (warehouse) => {
  // selectedWarehouseTab.value = warehouse;
  selectedWareHouseRecords.value = warehouse;
  cPage.value = "ware-house-records";
  // console.log(warehouse);
};
</script>

<template>
  <div class="page-wrapper">
    <SelectCompModel
      v-if="appInitialized && selectCompanyPrompt"
      :cComp="cCompany"
    />

    <div class="content">
      <div class="row" v-if="totals">
        <div
          class="col-lg-3 col-sm-6 col-12 d-flex btn"
          @click="cPage = 'customer-list'"
        >
          <div class="dash-count das1">
            <div class="dash-counts">
              <h4>{{ totals?.data?.total_customers ?? 0 }}</h4>
              <h5>Customers</h5>
            </div>
            <div class="dash-imgs">
              <i class="fas fa-users fa-lg"></i>
            </div>
          </div>
        </div>
        <div
          class="col-lg-3 col-sm-6 col-12 d-flex btn"
          @click="cPage = 'pending-orders'"
        >
          <div class="dash-count">
            <div class="dash-counts">
              <h4>{{ totals?.data?.pending_orders ?? 0 }}</h4>
              <h5>Pending Orders</h5>
            </div>
            <div class="dash-imgs">
              <i class="fas fa-cart-plus fa-lg"></i>
            </div>
          </div>
        </div>
        <div
          class="col-lg-3 col-sm-6 col-12 d-flex btn"
          @click="cPage = 'completed-orders'"
        >
          <div class="dash-count das3">
            <div class="dash-counts">
              <h4>{{ totals?.data?.completed_orders ?? 0 }}</h4>
              <h5>Completed Orders</h5>
            </div>
            <div class="dash-imgs">
              <i class="fas fa-circle-notch"></i>
            </div>
          </div>
        </div>
        <div
          class="col-lg-3 col-sm-6 col-12 d-flex btn"
          @click="cPage = 'production-list'"
        >
          <div class="dash-count das2">
            <div class="dash-counts">
              <h4>{{ totals?.data?.production_orders ?? 0 }}</h4>
              <h5>Production Shift(s)</h5>
            </div>
            <div class="dash-imgs">
              <i class="fas fa-clock"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Warehouse Tabs -->
      <div
        v-if="warehouses?.data?.length && cCompany"
        class="d-flex flex-wrap justify-content-center gap-2 my-3"
      >
        <div v-for="wh in warehouses.data" :key="wh.id" class="nav-item">
          <button
            v-if="wh.company.id === cCompany?.id"
            class="btn btn-sm btn-outline-primary"
            @click="handleWarehouseTabClick(wh)"
          >
            {{ wh.name }}
          </button>
        </div>
      </div>

      <hr />

      <!-- Filter Button -->
      <div class="mb-3 text-center text-md-start">
        <button type="button" class="btn btn-primary btn-sm" @click="filter">
          Report Filter
        </button>
      </div>

      <!-- Raw Materials Report -->
      <div class="card mb-3">
        <div class="card-body">
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3"
          >
            <h4 class="card-title mb-0">Raw Materials</h4>
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              @click="
                exportRawTotal(
                  'print',
                  totals?.data?.all_raw_data,
                  rawTotalCols,
                  'Raw Material Report',
                  totals?.data?.from,
                  totals?.data?.to
                )
              "
            >
              <i class="fas fa-file-pdf"></i> PRINT
            </button>
          </div>

          <div
            class="table-responsive dataview"
            v-if="totals?.data?.all_raw_data"
          >
            <table class="table table-bordered table-hover table-sm datatable">
              <thead class="table-light text-nowrap">
                <tr>
                  <th>Warehouse</th>
                  <th>Item Name</th>
                  <th>Qty Added</th>
                  <th>Qty Removed</th>
                  <th>Qty in Stock</th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(val, i) in totals?.data?.all_raw_data"
                  :key="i"
                >
                  <template v-for="(item, ii, key) in val" :key="ii">
                    <tr>
                      <td v-if="key === 0" :rowspan="Object.keys(val).length">{{
                        i
                      }}</td>
                      <td>{{ ii }}</td>
                      <td>
                        {{
                          store.fmtNum(
                            Number(item.total_raw_bundle_added ?? 0) +
                              Number(item.total_transfer_in ?? 0)
                          )
                        }}
                      </td>
                      <td>
                        {{
                          store.fmtNum(
                            Number(item.total_raw_bundle_removed ?? 0) +
                              Number(item.total_transfer_out ?? 0)
                          )
                        }}
                      </td>
                      <td>
                        {{
                          store.fmtNum(
                            Number(item.total_raw_bundle_added ?? 0) +
                              Number(item.total_transfer_in ?? 0) -
                              (Number(item.total_raw_bundle_removed ?? 0) +
                                Number(item.total_transfer_out ?? 0))
                          )
                        }}
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-info text-center">
            No raw material data available.
          </div>
        </div>
      </div>

      <!-- Finished Products Report -->
      <div class="card mb-3">
        <div class="card-body">
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3"
          >
            <h4 class="card-title mb-0">
              Finished Products Report
              <span v-if="totals?.data?.from"
                >from {{ totals?.data?.from }}</span
              >
              <span v-if="totals?.data?.to"> to {{ totals?.data?.to }}</span>
            </h4>
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              @click="
                exportProdTotal(
                  'print',
                  totals?.data?.all_prod_data,
                  prodTotalCols,
                  'Products Report',
                  totals?.data?.from,
                  totals?.data?.to
                )
              "
            >
              <i class="fas fa-file-pdf"></i> PRINT
            </button>
          </div>

          <div
            class="table-responsive dataview mt-3"
            v-if="totals?.data?.all_prod_data"
          >
            <table class="table table-bordered table-hover table-sm">
              <thead class="table-light text-nowrap">
                <tr>
                  <th>Warehouse</th>
                  <th>Item</th>
                  <th>Qty Added</th>
                  <th>Qty Sold</th>
                  <th>Qty Dsptch</th>
                  <th>Amount Sold</th>
                  <th>Amount Dsptch</th>
                  <th>Qty in Stock</th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(warehouse, warehouseName) in totals?.data
                    ?.all_prod_data"
                  :key="warehouseName"
                >
                  <template
                    v-for="(item, itemName, index) in warehouse"
                    :key="itemName"
                  >
                    <tr>
                      <td
                        v-if="index === 0"
                        :rowspan="Object.keys(warehouse).length"
                        >{{ warehouseName }}</td
                      >
                      <td>{{ itemName }}</td>
                      <td>
                        {{
                          store.fmtNum(
                            Number(item.total_prod_bundle_added ?? 0) +
                              Number(item.total_transfer_in ?? 0)
                          )
                        }}
                      </td>
                      <td>
                        {{
                          store.fmtNum(
                            Number(item.total_prod_bundle_removed ?? 0) +
                              Number(item.total_transfer_out ?? 0)
                          )
                        }}
                      </td>
                      <td>{{
                        store.fmtNum(
                          Number(item.total_prod_bundle_dispatched ?? 0)
                        )
                      }}</td>
                      <td
                        >₦{{
                          store.fmtNum(Number(item.total_prod_amount_sold ?? 0))
                        }}</td
                      >
                      <td
                        >₦{{
                          store.fmtNum(
                            Number(item.total_prod_amount_dispatched ?? 0)
                          )
                        }}</td
                      >
                      <td>
                        <!-- {{
                          store.fmtNum(
                            Number(item.total_prod_bundle_added) +
                              Number(item.total_transfer_in) -
                              (Number(item.total_prod_bundle_dispatched) +
                                Number(item.total_transfer_out))
                          )
                        }} -->
                        {{
                          store.fmtNum(
                            Number(item.total_prod_bundle_added ?? 0) +
                              Number(item.total_transfer_in ?? 0) -
                              (Number(item.total_prod_bundle_removed ?? 0) +
                                Number(item.total_transfer_out ?? 0))
                          )
                        }}
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-info text-center">
            No finished product data available.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
