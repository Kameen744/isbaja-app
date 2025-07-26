<script setup>
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";
import SubMenu from "../components/SubMenu.vue";
import { onMounted, ref } from "vue";
import localforage from "localforage";

const store = useMainStore();
const { cPage, cCompany, companies, miniNav } = storeToRefs(store);
const menus = ref([]);

const reload = async () => {
  await localforage.setItem("cPageH", cPage.value);
  window.location.reload();
};

const addMenu = (permName, menuObj) => {
  // let permited = menuObj;
  // let subCreate = menuObj.sub[0];
  // let subList = menuObj.sub[1];
  let sub = menuObj.sub;
  menuObj.sub = [];

  if (store.can(permName + ":create")) {
    menuObj.sub.push(sub[0]);
  }

  if (store.can(permName + ":view")) {
    if (permName == "inventories") {
      menuObj.sub.push(sub[1]);
      menuObj.sub.push(sub[2]);
      menuObj.sub.push(sub[3]);
    } else if (permName == "sales") {
      menuObj.sub.push(sub[1]);
      menuObj.sub.push(sub[2]);
    } else {
      menuObj.sub.push(sub[1]);
    }
    menus.value.push(menuObj);
  }
};

onMounted(async () => {
  addMenu("warehouse", {
    title: "Warehouse",
    name: "warehouse",
    icon: "fa-building",
    sub: [
      { name: "warehouse", title: "New Warehouse" },
      { name: "warehouse-list", title: "Warehouses" },
    ],
  });

  addMenu("item", {
    title: "Raw Items",
    name: "raw-material",
    icon: "fa-sitemap",
    sub: [
      { name: "raw-material", title: "New Item" },
      { name: "raw-material-list", title: "Item List" },
    ],
  });

  addMenu("item", {
    title: "Products",
    name: "item",
    icon: "fa-truck-pickup",
    sub: [
      { name: "item", title: "New Item" },
      { name: "item-list", title: "Item List" },
    ],
  });

  // addMenu("customers", {
  //   title: "Customers",
  //   name: "customer",
  //   icon: "fa-people-carry",
  //   sub: [
  //     { name: "customer", title: "New Customer" },
  //     { name: "customer-list", title: "Customer List" },
  //   ],
  // });

  // addMenu("supplier", {
  //   title: "Suppliers",
  //   name: "supplier",
  //   icon: "fa-people-carry",
  //   sub: [
  //     { name: "supplier", title: "New Supplier" },
  //     { name: "supplier-list", title: "Suppliers" },
  //   ],
  // });

  addMenu("inventories", {
    title: "Inventory",
    name: "inventory",
    icon: "fa-truck-loading",
    sub: [
      { name: "inventory", title: "Add/Remove Item(s)" },
      { name: "inventory-transfer", title: "Transfer Item(s)" },
      { name: "inventory-list", title: "Inventory Log" },
      { name: "inventory-transfer-list", title: "Transfer Log" },
    ],
  });

  addMenu("productions", {
    title: "Production",
    name: "production",
    icon: "fa-dolly-flatbed",
    sub: [
      { name: "production", title: "Production Order" },
      { name: "production-list", title: "Production List" },
    ],
  });

  addMenu("sales", {
    title: "Sale",
    name: "sale",
    icon: "fa-cart-plus",
    sub: [
      { name: "sale", title: "Sale Order" },
      { name: "sale-list", title: "Sale List" },
      { name: "sale-dispatch-list", title: "Dispatch Log" },
    ],
  });

  addMenu("users", {
    title: "Users",
    name: "user-access",
    icon: "fas fa-users",
    sub: [
      { name: "user-access", title: "New User" },
      { name: "user-access-list", title: "User(s) List" },
    ],
  });
});
</script>
<template>
  <div class="sidebar" id="sidebar">
    <div class="sidebar-inner slimscroll" id="slimscrollElmId">
      <div class="form-group" v-if="companies">
        <select class="form-control" @change="store.setCurrentCompany">
          <option value="" disabled="" selected="" :key="cCompany?.name">
            {{ cCompany ? cCompany.name : "Select Company" }}
          </option>
          <template v-for="com in companies.data" :key="com.id">
            <option :value="com.id" v-if="com.id != cCompany?.id">
              {{ com.name }}
            </option>
          </template>
        </select>
      </div>

      <div id="sidebar-menu" class="sidebar-menu">
        <ul>
          <li>
            <button
              type="button"
              class="btn btn-primary btn-block"
              @click="reload"
            >
              <i class="fas fa-circle"></i>
              <span v-if="!miniNav"> Refresh</span>
            </button>
          </li>
          <li :class="store.activeMenu('main')">
            <a href="" @click.prevent="cPage = 'main'">
              <i class="fas fa-tachometer-alt"></i>
              <span> Dashboard</span>
            </a>
          </li>
          <!-- Company -->
          <SubMenu v-for="menu in menus" :key="menu.name" :menu="menu" />
        </ul>
      </div>
    </div>
  </div>
</template>
