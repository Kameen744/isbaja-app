<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "./stores/main-store";
import { storeToRefs } from "pinia";

import Navbar from "./sections/Navbar.vue";
import Sidebar from "./sections/Sidebar.vue";
import Main from "./sections/Main.vue";
import Company from "./sections/Company.vue";
import WareHouse from "./sections/WareHouse.vue";
import Item from "./sections/Item.vue";
import RawMaterial from "./sections/RawMaterial.vue";
import Inventory from "./sections/Inventory.vue";
import Customer from "./sections/Customer.vue";
import Production from "./sections/Production.vue";
import SaleOrder from "./sections/SaleOrder.vue";
import User from "./sections/User.vue";
import Supplier from "./sections/Supplier.vue";
import PendingOrderTable from "./components/PendingOrderTable.vue";
import CompletedOrderTable from "./components/CompletedOrderTable.vue";
import WareHouseRecTable from "./components/WareHouseRecTable.vue";

const store = useMainStore();
const { cPage, loader, cCompany, appInitialized } = storeToRefs(store);

onMounted(async () => {
  await store.setAuthUser();
  await store.initialize();
  if (appInitialized.value) {
    setTimeout(async () => await loadScript("/assets/js/script.js"), 100);
  }
  // let myuuid = crypto.randomUUID();

  // $("#global-loader").show();
  // loader.value;
});

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true; // Load the script asynchronously

    script.onload = () => {
      // console.log(`${src} loaded successfully`);
      resolve(); // The script has loaded and run
    };

    script.onerror = () => {
      reject(new Error(`Could not load script ${src}`));
    };

    document.head.appendChild(script); // This starts loading the script
  });
};
</script>

<template>
  <div id="global-loader">
    <div class="whirly-loader"> </div>
  </div>
  <Navbar />
  <Sidebar v-if="appInitialized" />
  <Main v-if="cPage == 'main' && appInitialized" />
  <Company v-if="cPage.includes('company') && appInitialized" />
  <WareHouse v-if="cPage.includes('warehouse') && appInitialized" />
  <Item v-if="cPage.includes('item') && appInitialized" />
  <RawMaterial v-if="cPage.includes('raw-material') && appInitialized" />
  <Inventory v-if="cPage.includes('inventory') && appInitialized" />
  <Production v-if="cPage.includes('production') && appInitialized" />
  <Customer v-if="cPage.includes('customer') && appInitialized" />
  <Supplier v-if="cPage.includes('supplier') && appInitialized" />
  <SaleOrder v-if="cPage.includes('sale') && appInitialized" />
  <User v-if="cPage.includes('user-access') && appInitialized" />
  <!-- for dashboard items -->
  <PendingOrderTable v-if="cPage.includes('pending-order') && appInitialized" />
  <CompletedOrderTable
    v-if="cPage.includes('completed-order') && appInitialized"
  />
  <WareHouseRecTable
    v-if="cPage.includes('ware-house-records') && appInitialized"
  />
</template>

<style>
#global-loader {
  background-color: rgba(255, 255, 255, 0.6) !important;
}
</style>
