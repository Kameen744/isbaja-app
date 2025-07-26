<script setup>
import { useMainStore } from "./../stores/main-store";
import { onMounted, ref, toRaw } from "vue";
import { storeToRefs } from "pinia";
import InputField from "../components/InputField.vue";
import InputSelect from "../components/inputSelect.vue";
import ProdRecModal from "../components/ProdRecModal.vue";
import ProdTable from "../components/prodTable.vue";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const {
  cPage,
  cCompany,
  constVars,
  formData,
  records,
  companies,
  warehouses,
  items,
  editing,
  queryParams,
  offlineRecords,
  isOnline,
} = storeToRefs(store);

const setFormFields = () => {
  formData.value = {
    start_date: store.getCurrentDate(),
    end_date: store.getCurrentDate(),
    produced: [],
    used: [],
  };
};

const item_produced = ref({
  item_id: "",
  ware_house_id: "",
  bundle_added: 0,
  unit_added: 0,
  ware_house_id: "",
});

const item_used = ref({
  item_id: "",
  ware_house_id: "",
  bundle_removed: 0,
  unit_removed: 0,
  ware_house_id: "",
  weight: 0,
});

const tableCols = ref([
  { field: "produced", title: "Finished Products" },
  { field: "prod_weight", title: "Products Weight" },
  { field: "used", title: "Raw Materials Used" },
  { field: "raw_weight", title: "Materials Weight" },
  { field: "shift_start", title: "Shift Start" },
  { field: "shift_end", title: "Shift End" },
  { field: "actions", title: "Actions", search: false },
]);

const tableRows = ref([]);
const tableRowsLocal = ref([]);
const searchTxt = ref("");
const datatable = ref(null);
const datatableLocal = ref(null);
const prodRecModalRef = ref(null);

const sectionName = "production";
const action = ref(null);
const loaded = ref(false);

const showLocaRecModal = (t = true) => {
  prodRecModalRef.value.toggleLocalRecModal(t);
};

const loadTableRows = () => {
  // tableRows.value = records.value.data;
  // if (offlineRecords.value) {
  //   tableRowsLocal =
  // }
  // tableRows.value = records.value.data;
  // for (let i = 0; i < records.value.data.length; i++) {
  //   let rec = records.value.data[i];
  //   let itemObj = rec.item;
  //   let obj = {
  //     id: rec.id,
  //     start: store.fmtDate(rec.start_date),
  //     ends: store.fmtDate(rec.end_date),
  //     // created: store.fmtDate(rec.created),
  //   };
  //   // for(let j = 0; j < rec.produced.length; j++) {
  //   //     const produced = rec.produced[j];
  //   // }
  //   // for(let j = 0; j < rec.used.length; j++) {
  //   //     const used = rec.used[j];
  //   // }
  // }
};

onMounted(async () => {
  store.loading();
  await setFormFields();

  if (cCompany.value?.id) {
    formData.value.company_id = cCompany.value.id;
  } else {
    store.alert("Select Company!", "Please choose a company", "error");
    return;
  }

  offlineRecords.value = await store.getOffline(`form/post/${sectionName}`);

  queryParams.value = `col=company_id&colId=${cCompany.value.id}`;
  await store.getRecord(sectionName);
  await loadTableRows();
  loaded.value = true;
  store.loading(false);
});

// const getRequiredFields = () => {
//   let fields = ["company_id", "item_id"];
//   if (action.value == "produced") {
//     fields = [...fields, "add_note", "bundle_added"];
//   } else {
//     fields = [...fields, "remove_note", "bundle_removed"];
//   }
//   return fields;
// };

const filter_items = (type) => {
  if (type == "produced") {
    const data = items.value.data.filter(
      (item) => item.type == "Finished Product"
    );
    return data;
  } else if (type == "used") {
    const data = items.value.data.filter((item) => item.type == "Raw Material");
    return data;
  }
};

const add_to_form = async (type) => {
  if (type == "produced") {
    if (
      item_produced.value.ware_house_id === "" ||
      item_produced.value.item_id === "" ||
      item_produced.value.bundle_added === "" ||
      item_produced.value.unit_added === ""
    ) {
      store.alert("Invalid Field", "Item and bundle are required", "warning");
      return false;
    }
    await remove_from_form("produced", item_produced.value.item_id);
    item_produced.value.company_id = cCompany.value.id;
    const raw_item = toRaw(item_produced.value);
    formData.value.produced.push(raw_item);
    item_produced.value = {
      item_id: "",
      bundle_added: 0,
      unit_added: 0,
      ware_house_id: "",
    };
  } else if (type == "used") {
    if (
      item_used.value.ware_house_id === "" ||
      item_used.value.item_id === "" ||
      item_used.value.bundle_removed === "" ||
      item_used.value.unit_removed === ""
    ) {
      store.alert("Invalid Field", "Item and bundle are required", "warning");
      return false;
    }
    await remove_from_form("used", item_used.value.item_id);
    item_produced.value.company_id = cCompany.value.id;
    const raw_item = toRaw(item_used.value);
    formData.value.used.push(raw_item);
    item_used.value = {
      item_id: "",
      bundle_removed: 0,
      unit_removed: 0,
      ware_house_id: "",
    };
  }
};

const remove_from_form = (type, item_id, delFrmOnline = false) => {
  if (type == "produced") {
    if (formData.value.produced) {
      formData.value.produced = formData.value.produced.filter(
        (item) => item.item_id !== item_id
      );
    }
  } else if (type == "used") {
    if (formData.value.used) {
      formData.value.used = formData.value.used.filter(
        (item) => item.item_id !== item_id
      );
    }
  }

  // if (isOnline && delFrmOnline) {
  //   store.req("delete", `inventory/${item_id}`);
  // }
};

const validateForm = async () => {
  if (item_produced.value.item_id != "") {
    await add_to_form("produced");
  }

  if (item_used.value.item_id != "") {
    await add_to_form("used");
  }

  if (
    formData.value.start_date &&
    formData.value.start_date != "" &&
    formData.value.end_date &&
    formData.value.end_date != "" &&
    formData.value.produced &&
    formData.value.produced != [] &&
    formData.value.used &&
    formData.value.used != []
  ) {
    return true;
  } else {
    store.alert("Production Form!", "Required fields are empty", "warning");
    return false;
  }
};

const create = async () => {
  const valid = await validateForm();
  if (valid) {
    if (!formData.value?.company_id) {
      formData.value.company_id = cCompany.value.id;
    }
    const save = await store.createRecord(sectionName);
    if (save?.code == 200) {
      setFormFields();
    }
  }
};

const update = async () => {
  const valid = await validateForm();
  if (valid) {
    if (!formData.value?.company_id) {
      formData.value.company_id = cCompany.value.id;
    }

    const update = await store.updateRecord(sectionName);
    if (update?.code == 200) {
      setFormFields();
    }
  }
};

// const edit = (item) => {
//   console.log(item.value);
//   // if (item.add_note) {
//   //   action.value = "produced";
//   // } else {
//   //   action.value = "used";
//   // }

//   store.editRecord(sectionName, item.value);
// };

const cancelEditing = () => {
  setFormFields();
  cPage.value = sectionName + "-list";
  editing.value = null;
};
</script>
<template>
  <div class="page-wrapper">
    <div class="content">
      <!-- <button @click="showLocaRecModal(true)">show modal</button> -->

      <div class="page-header">
        <div class="page-title">
          <h4>production Add</h4>
          <h6
            >Add/update production for <strong>{{ cCompany.name }}</strong></h6
          >
        </div>
        <!-- view offline records button -->
        <div
          class="p-2 d-flex justify-content-between mb-1"
          v-if="offlineRecords && offlineRecords.length > 0"
        >
          <div>
            <button
              class="btn btn-warning btn-sm"
              @click="showLocaRecModal(true)"
            >
              <strong>({{ offlineRecords?.length }})</strong> Local Records
              <i class="fas fa-upload" aria-hidden="true"></i
            ></button>
          </div>
        </div>
      </div>
      <!-- form -->
      <div class="card" v-if="cPage == sectionName && loaded">
        <div class="card-body">
          <div class="row">
            <InputField
              v-model="formData.start_date"
              label="Production Start Date"
              type="datetime-local"
              col="6"
            />

            <InputField
              v-model="formData.end_date"
              label="Production End Date"
              type="datetime-local"
              col="6"
            />
            <!-- items produced -->
            <div class="col-12 pt-2 pb-2 mb-3 add-bg shadow-sm">
              <h6 class="text-center m-0">Add Finished Products</h6>
              <hr />
              <div class="row">
                <InputSelect
                  v-model="item_produced.ware_house_id"
                  label="Select Warehouse"
                  :options="store.filter_warehouses('product')"
                  col="3"
                />
                <InputSelect
                  v-if="items"
                  v-model="item_produced.item_id"
                  label="Select Item"
                  :options="filter_items('produced')"
                  col="3"
                />
                <InputField
                  v-model="item_produced.bundle_added"
                  label="Bundle(s) Produced"
                  type="number"
                  col="3"
                  @focusin="store.onNumInputFocus"
                  @focusout="store.onNumInputFocusOut"
                />
                <InputField
                  v-model="item_produced.unit_added"
                  label="Piece(s) Produced"
                  type="number"
                  col="3"
                  @focusin="store.onNumInputFocus"
                  @focusout="store.onNumInputFocusOut"
                />
                <div class="col ml-auto d-flex justify-content-end">
                  <div class="align-center">
                    <button
                      class="btn btn-success mt-1"
                      @click="add_to_form('produced')"
                    >
                      <i class="fas fa-plus"></i>
                      | Add
                    </button>
                  </div>
                </div>
              </div>
              <div class="row">
                <table class="table">
                  <tbody>
                    <tr v-for="item in formData.produced" :key="item.item_id">
                      <td>
                        {{
                          store.getObj(warehouses.data, item.ware_house_id)
                            ?.name
                        }}
                      </td>
                      <td>{{
                        store.getObj(items.data, item.item_id)?.name
                      }}</td>
                      <td class="mxw-50">{{ item.bundle_added }} Bundle(s)</td>
                      <td class="mxw-50">{{ item.unit_added }} Unit(s)</td>
                      <td>
                        <button
                          class="btn btn-sm btn-danger m-0 px-1 py-1"
                          @click="
                            remove_from_form('produced', item.item_id, true)
                          "
                        >
                          <i class="fas fa-times-circle fa-lg align-center"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- items used -->
            <div class="col-12 pt-2 pb-2 mb-3 remove-bg shadow-sm">
              <h6 class="text-center m-0">Add Raw Materials Used</h6>
              <hr />
              <div class="row">
                <InputSelect
                  v-model="item_used.ware_house_id"
                  label="Select Warehouse"
                  :options="store.filter_warehouses('material')"
                  col="3"
                />
                <InputSelect
                  v-if="items"
                  v-model="item_used.item_id"
                  label="Select Item"
                  :options="filter_items('used')"
                  col="3"
                />
                <InputField
                  v-model="item_used.bundle_removed"
                  label="Bundle(s) Used"
                  type="number"
                  col="3"
                  @focusin="store.onNumInputFocus"
                  @focusout="store.onNumInputFocusOut"
                />
                <InputField
                  v-model="item_used.weight"
                  label="Weight in (KG)"
                  type="number"
                  col="3"
                  @focusin="store.onNumInputFocus"
                  @focusout="store.onNumInputFocusOut"
                />
                <!-- <InputField
                  v-model="item_used.unit_removed"
                  label="Unit(s) Used"
                  type="number"
                  col="2"
                /> -->

                <div class="col ml-auto d-flex justify-content-end">
                  <div class="align-center">
                    <button
                      class="btn btn-warning mt-1"
                      @click="add_to_form('used')"
                    >
                      <i class="fas fa-plus"></i>
                      | Add
                    </button>
                  </div>
                </div>
              </div>
              <div class="row">
                <table class="table">
                  <tbody>
                    <tr v-for="item in formData.used" :key="item.item_id">
                      <td>
                        {{
                          store.getObj(warehouses.data, item.ware_house_id)
                            ?.name
                        }}
                      </td>
                      <td>{{
                        store.getObj(items.data, item.item_id)?.name
                      }}</td>
                      <td class="mxw-50"
                        >{{ item.bundle_removed }} Bundle(s)</td
                      >
                      <td class="mxw-50">{{ item.unit_removed }} Unit(s)</td>
                      <td>
                        <button
                          class="btn btn-sm btn-danger m-0 px-1 py-1"
                          @click="remove_from_form('used', item.item_id, true)"
                        >
                          <i class="fas fa-times-circle fa-lg align-center"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="col-lg-12">
              <hr />
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="update"
                v-if="editing"
                >Update</a
              >
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="create"
                v-else
                >Save Production Order</a
              >
              <a
                href=""
                class="btn btn-cancel"
                v-if="editing"
                @click.prevent="cancelEditing"
                >Cancel</a
              >
            </div>
          </div>
        </div>
      </div>
      <!-- table -->
      <div class="card" v-if="cPage == sectionName + '-list' && loaded">
        <div class="card-body">
          <ProdTable
            :tabCols="tableCols"
            :secName="sectionName"
            :key="records?.length ?? 1 + Math.random()"
          />
        </div>
      </div>
      <ProdRecModal
        ref="prodRecModalRef"
        :tabCols="tableCols"
        :secName="sectionName"
        v-if="loaded"
      />
    </div>
  </div>
</template>

<style>
.remove-bg {
  background: rgba(255, 0, 0, 0.05);
}
.add-bg {
  background: rgba(0, 255, 0, 0.05);
}
.offline-bg {
  background-color: rgba(50, 0, 50, 0.1);
}
.mxw-50 {
  max-width: 50px;
}
</style>
