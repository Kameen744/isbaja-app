<script setup>
import { useMainStore } from "./../stores/main-store";
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import InputField from "../components/InputField.vue";
import InputSelect from "../components/inputSelect.vue";
import InventoryRecModel from "../components/InventoryRecModel.vue";

import "@bhplugin/vue3-datatable/dist/style.css";
import InventoryTable from "../components/InventoryTable.vue";
import InventoryTransferTable from "../components/InventoryTransferTable.vue";

const store = useMainStore();

const {
  cPage,
  cCompany,
  constVars,
  formData,
  records,
  companies,
  suppliers,
  items,
  editing,
  queryParams,
  offlineRecords,
  warehouses,
  isOnline,
} = storeToRefs(store);

const transferFormData = ref({});
const editingTransfer = ref(null);

const setTransferFormFields = () => {
  transferFormData.value = {
    company_id: cCompany.value.id,
    item_id: "",
    ware_house_from: "",
    ware_house_to: "",
    bundle_transfered: "",
  };
};
const setFormFields = () => {
  formData.value = {
    company_id: "",
    item_id: "",
    user_id: "",
    ware_house_id: "",
    bundle_added: "",
    unit_added: "",
    bundle_removed: "",
    unit_removed: "",
    weight: "",
    add_note: "",
    remove_note: "",
    supplier_id: "",
    supplier_name: "",
    supplier_phone: "",
    supplier_acc_no: "",
  };
};

const tableCols = ref([
  { field: "item", title: "Item" },
  { field: "status", title: "Add/Remove" },
  { field: "note", title: "Note" },
  { field: "warehouse_name", title: "Warehouse" },
  { field: "supplier_name", title: "Supplier" },
  { field: "created", title: "Date" },
  { field: "actions", title: "Actions", search: false },
]);

const tableTransferCols = ref([
  { field: "item", title: "Item" },
  { field: "from", title: "From Warehouse" },
  { field: "to", title: "To Warehouse" },
  { field: "bundle_transfered", title: "Quantity" },
  { field: "created", title: "Date" },
  { field: "actions", title: "Actions", search: false },
]);

const inventoryRecModalRef = ref(null);

const showLocaRecModal = (t = true) => {
  inventoryRecModalRef.value.toggleLocalRecModal(t);
};

const tableRows = ref([]);

const sectionName = "inventory";
const action = ref(null);
const loaded = ref(false);
const searchTxt = ref("");
const datatable = ref(null);

const loadTableRows = () => {
  for (let i = 0; i < records.value.data.length; i++) {
    let rec = records.value.data[i];
    let itemObj = rec.item;
    let obj = {
      id: rec.id,
      company: rec.company.name,
      item: rec.item.name,
      created: store.fmtDate(rec.created),
    };

    if (rec.add_note != "N/A") {
      obj.note = rec.add_note;
      obj.bundle = rec.bundle_added;
      obj.unit = rec.unit_added;
      obj.type = "add";
    } else {
      obj.note = rec.remove_note;
      obj.bundle = rec.bundle_removed;
      obj.unit = rec.unit_removed;
      obj.type = "remove";
    }

    let sts = `${obj.bundle} ${itemObj.bundle_measure}(s)`;
    if (obj.unit && obj.unit > 0) {
      sts = sts + ` and ${obj.unit} ${itemObj.unit_measure}(s)`;
    }
    obj.status = sts;
    tableRows.value.push(obj);
  }
};

onMounted(async () => {
  store.loading();
  await setFormFields();
  await setTransferFormFields();

  if (cCompany.value?.id) {
    formData.value.company_id = cCompany.value.id;
  } else {
    store.alert("Select Company!", "Please choose a company", "error");
    return;
  }

  offlineRecords.value = await store.getOffline(`form/post/${sectionName}`);

  queryParams.value = `col=company_id&colId=${cCompany.value.id}`;
  await store.getRecord(sectionName);
  suppliers.value = await store.req("get", "supplier");
  loadTableRows();
  loaded.value = true;
  store.loading(false);
});

const getRequiredFields = () => {
  let fields = ["company_id", "item_id"];

  if (action.value == "Add") {
    fields = [...fields, "add_note", "bundle_added"];
  } else {
    fields = [...fields, "remove_note", "bundle_removed"];
  }

  return fields;
};
const create = async () => {
  // await store.offlineCheck();
  store.loading();
  let requiredFiels = getRequiredFields();
  if (store.validateForm(requiredFiels)) {
    const save = await store.createRecord(sectionName);
    if (save?.code == 200) {
      setFormFields();
    }
  }
  store.loading(false);
};

const update = async () => {
  // await store.offlineCheck();
  store.loading();
  let requiredFiels = getRequiredFields();
  if (store.validateForm(requiredFiels)) {
    // store.createRecord(sectionName);
    const update = await store.updateRecord(sectionName);
    if (update?.code == 200) {
      setFormFields();
    }
  }
  store.loading(false);
};

const edit = (item) => {
  if (item.type == "add") {
    action.value = "Add";
  } else {
    action.value = "Remove";
  }

  editing.value = item;
  formData.value = {
    company_id: item.company_id,
    item_id: item.item_id,
    ware_house_id: item.ware_house_id,
    bundle_added: item.bundle,
    unit_added: item.unit,
    bundle_removed: "",
    unit_removed: "",
    weight: item.weight,
    add_note: item.note,
    remove_note: "",
    supplier_id: item.supplier_id,
    supplier_name: item.supplier_name,
    supplier_phone: item.supplier_phone,
    supplier_acc_no: item.supplier_acc_no,
  };
  cPage.value = sectionName;

  // store.editRecord(sectionName, item);
};

const cancelEditing = () => {
  setFormFields();
  cPage.value = sectionName + "-list";
  editing.value = null;
};

const selectSupplierEvent = (val) => {
  formData.value.supplier_id = val.id;
  formData.value.supplier_acc_no = val.acc_no;
  formData.value.supplier_phone = val.phone;
  formData.value.supplier_name = "";
};

const onSupplierInput = (event) => {
  formData.value.supplier_id = "";
  formData.value.supplier_acc_no = "";
  formData.value.supplier_phone = "";
  formData.value.supplier_name = event.input;
};

const itemTransferKey = ref("transfKey");
const createTransfer = async () => {
  store.loading();
  let name = "inventory-transfer";
  const title = store.capitalizeFirstLetter(name);

  if (
    Number(transferFormData.value.bundle_transfered) > 0 &&
    transferFormData.value.item_id != "" &&
    transferFormData.value.ware_house_from != "" &&
    transferFormData.value.ware_house_to != "" &&
    isOnline
  ) {
    const res = await store.req("post", name, transferFormData.value);
    if (res?.code === 200) {
      // await store.getRecord(name);
      itemTransferKey.value = itemTransferKey + Math.random();
      store.loading(false);
      store.alert(title, "Created Success");
      setTransferFormFields();
    } else if (res?.code == 401 || res?.code == 500) {
      store.loading(false);
      store.alert(title, res.status, "warning");
    } else if (res?.errors) {
      store.loading(false);
      store.alert(title, res.message, "warning");
    }
  } else {
    store.alert(title, "Uncompleted Form", "warning");
    store.loading(false);
  }
};

const editTransfer = (rec) => {
  let name = "inventory-transfer";
  // check and set a foreign key id
  Object.keys(rec).forEach((key) => {
    // checks if value is an object
    if (typeof rec[key] == "object") {
      // checks if the object has `id`
      if (rec[key]?.id) {
        // create a new field name with the value of key
        const key_id = key + "_id";
        // set newly created field value to the id value of the object
        rec[key_id] = rec[key].id;
      }
    }
  });

  editingTransfer.value = rec;
  formData.value = rec;
  cPage.value = name;
};

const updateTransfer = () => {};
const cancelEditingTransfer = () => {
  setTransferFormFields();
  cPage.value = "inventory-transfer";
  editingTransfer.value = null;
};
</script>
<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="page-title">
          <h4>Inventory Add</h4>
          <h6
            >Add/update Inventory for <strong>{{ cCompany.name }}</strong></h6
          >
        </div>

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
      <div
        class="card"
        :class="action == 'Remove' ? 'removal-bg' : ''"
        v-if="cPage == sectionName && loaded"
      >
        <div class="card-body">
          <div class="row">
            <InputSelect
              v-model="action"
              label="Select Action"
              :options="constVars?.data.actions"
            />

            <InputSelect
              v-model="formData.ware_house_id"
              label="Select Warehouse"
              :options="store.filter_warehouses_by_company()"
            />

            <InputSelect
              v-if="items"
              v-model="formData.item_id"
              label="Select Item"
              :options="items.data"
            />

            <template v-if="action == 'Add'">
              <InputField
                v-model="formData.bundle_added"
                label="Bundle(s) quantity"
                type="number"
              />

              <!-- <InputField
                v-model="formData.unit_added"
                label="Unit(s) to Add"
                type="number"
              /> -->

              <InputField
                v-model="formData.weight"
                label="Weight in (KG)"
                type="number"
              />

              <InputSelect
                v-model="formData.add_note"
                label="Add Note"
                :options="constVars?.data.addNote"
              />

              <div class="col-12 col-lg-4 col-sm-4" v-if="!editing">
                <div class="form-group">
                  <label>Suplier Name</label>
                  <vue3-simple-typeahead
                    :items="suppliers.data"
                    placeholder="Supplier name"
                    @selectItem="selectSupplierEvent"
                    @onInput="onSupplierInput"
                    :minInputLength="1"
                    :itemProjection="
                      (item) => {
                        return item.name;
                      }
                    "
                  />
                </div>
              </div>
              <InputField
                v-model="formData.supplier_phone"
                label="Supplier's Phone"
                type="number"
                col="4"
              />

              <InputField
                v-model="formData.supplier_acc_no"
                label="Supplier's Account No."
                type="number"
                col="4"
              />
            </template>
            <template v-else-if="action == 'Remove'">
              <InputField
                v-if="!formData.bundle_added && !formData.unit_added"
                v-model="formData.bundle_removed"
                label="Bundle(s) quantity"
                type="number"
              />

              <InputSelect
                v-if="!formData.bundle_added && !formData.unit_added"
                v-model="formData.remove_note"
                label="Removal Note"
                :options="constVars?.data.removeNote"
              />
            </template>

            <div class="col-lg-12">
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
                >Create</a
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
      <div class="card" v-if="cPage == sectionName + '-transfer' && loaded">
        <div class="card-body">
          <div class="row">
            <InputSelect
              v-if="items"
              v-model="transferFormData.item_id"
              label="Item to transfer"
              :options="items.data"
              col="3"
            />
            <InputSelect
              v-model="transferFormData.ware_house_from"
              label="Warehouse to take from"
              :options="store.filter_warehouses_by_company()"
              col="3"
            />
            <InputSelect
              v-model="transferFormData.ware_house_to"
              label="Warehouse to tranfer"
              :options="store.filter_warehouses_by_company()"
              col="3"
            />
            <InputField
              v-model="transferFormData.bundle_transfered"
              label="Bundle Quantity"
              type="number"
              col="3"
            />
            <div class="col-lg-12">
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="updateTransfer"
                v-if="editingTransfer"
                >Update</a
              >
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="createTransfer"
                v-else
                >Create</a
              >
              <a
                href=""
                class="btn btn-cancel"
                v-if="editingTransfer"
                @click.prevent="cancelEditingTransfer"
                >Cancel</a
              >
            </div>
          </div>
        </div>
      </div>
      <div
        class="card"
        v-if="cPage == sectionName + '-transfer-list' && loaded"
      >
        <div class="card-body">
          <InventoryTransferTable
            :tabCols="tableTransferCols"
            secName="inventory-transfer"
            :key="itemTransferKey"
            @edit="editTransfer"
          />
        </div>
      </div>
      <!-- table -->
      <div class="card" v-if="cPage == sectionName + '-list' && loaded">
        <div class="card-body">
          <InventoryTable
            :tabCols="tableCols"
            :secName="sectionName"
            :key="records?.length ?? 1 + Math.random()"
            @edit="edit"
          />
        </div>
      </div>
      <InventoryRecModel
        ref="inventoryRecModalRef"
        :tabCols="tableCols"
        :secName="sectionName"
        v-if="loaded"
      />
    </div>
  </div>
</template>

<style>
.removal-bg {
  background: rgba(255, 0, 0, 0.05);
}
.offline-bg {
  background-color: rgba(50, 0, 50, 0.1);
}
</style>
