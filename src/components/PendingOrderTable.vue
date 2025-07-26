<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";

const store = useMainStore();
const { bUrl, cPage, cCompany } = storeToRefs(store);

const pendingOrders = ref(null);
const loading = ref(false);
const currentPage = ref(1);

const fetchPendingOrders = async (page = 1) => {
  loading.value = true;
  try {
    const res = await axios.get(
      `${bUrl.value}/api/pending-orders?page=${page}`
    );
    pendingOrders.value = res.data.data;
  } catch (e) {
    pendingOrders.value = null;
  }
  loading.value = false;
};

const goToPage = (page) => {
  if (!pendingOrders.value) return;
  if (page < 1 || page > pendingOrders.value.last_page) return;
  currentPage.value = page;
  fetchPendingOrders(page);
};

const getDispatchedCount = (order) => {
  if (!order.items) return 0;
  return order.items.reduce(
    (sum, item) => sum + (Number(item.sale_order_dispatched) || 0),
    0
  );
};

onMounted(() => {
  fetchPendingOrders();
});
</script>

<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <button class="btn btn-primary btn-sm mb-3" @click="cPage = 'main'">
              <i class="fas fa-arrow-circle-left"></i> Back to Dashboard
            </button>
            <h4 class="card-title">Pending Orders</h4>
          </div>
          <div v-if="loading" class="text-center">Loading...</div>
          <div v-else>
            <div v-if="pendingOrders && pendingOrders.data.length">
              <div class="table-responsive dataview">
                <table class="table datatable">
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Company</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Dispatched</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template
                      v-for="order in pendingOrders.data"
                      :key="order.id"
                    >
                      <template
                        v-for="(item, idx) in order.items"
                        :key="item.id"
                      >
                        <tr>
                          <td v-if="idx === 0" :rowspan="order.items.length">{{
                            order.order_no
                          }}</td>
                          <td v-if="idx === 0" :rowspan="order.items.length">{{
                            order.order_date
                          }}</td>
                          <td v-if="idx === 0" :rowspan="order.items.length">{{
                            order.customer?.name
                          }}</td>
                          <td v-if="idx === 0" :rowspan="order.items.length">{{
                            order.customer?.company
                          }}</td>
                          <template
                            v-if="
                              item.bundle_removed > item.sale_order_dispatched
                            "
                          >
                            <td>{{ item.item?.name }}</td>
                            <td>{{ item.bundle_removed }}</td>
                            <td>
                              {{ item.sale_order_dispatched }}
                            </td>
                            <td>{{
                              store.fmtNum
                                ? store.fmtNum(item.price)
                                : item.price
                            }}</td>
                          </template>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                </table>
              </div>

              <!-- Pagination Controls -->
              <nav>
                <ul class="pagination justify-content-center mt-2">
                  <!-- <li
                    class="page-item"
                    :class="{ disabled: pendingOrders.current_page === 1 }"
                  >
                    <button
                      class="page-link"
                      @click="goToPage(pendingOrders.current_page - 1)"
                    >
                      Previous
                    </button>
                  </li> -->
                  <li
                    v-for="link in pendingOrders.links"
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
                  <li
                    class="page-item"
                    :class="{
                      disabled:
                        pendingOrders.current_page === pendingOrders.last_page,
                    }"
                  >
                    <!-- <button
                      class="page-link"
                      @click="goToPage(pendingOrders.current_page + 1)"
                    >
                      Next
                    </button> -->
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
