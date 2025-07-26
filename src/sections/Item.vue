<script setup>
import { useMainStore } from "./../stores/main-store";
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import InputField from "../components/InputField.vue";
import InputSelect from "../components/inputSelect.vue";

const store = useMainStore();

const {
  cPage,
  cCompany,
  formData,
  constVars,
  isOnline,
  companies,
  records,
  editing,
} = storeToRefs(store);

const formFields = {
  name: "",
  company_id: "",
  type: "Finished Product",
  bundle_measure: "",
  unit_measure: "",
  unit_per_bundle: "",
  bundle_weight_measure: "",
  bundle_weight: "",
  unit_price: "",
  bundle_price: "",
};

// const companies = ref(null);
const loaded = ref(false);
const sectionName = "item";
// const itemTypes = ["Finished Product", "Raw Material"];
// const bundleMeasures = ["Bag", "Carton", "Sack"];
// const unitMeasures = ["Piece", "Unit"];
// const weightMeasures = ["Gram (g)", "Kilogram (kg)", "Tonne (t)"];

onMounted(async () => {
  store.loading();
  formData.value = formFields;
  if (cCompany.value?.id) {
    formData.value.company_id = cCompany.value.id;
  } else {
    store.alert("Select Company!", "Please choose a company", "error");
  }
  await store.getRecord(sectionName);
  loaded.value = true;
  store.loading(false);
  // getCompanies();
});

// const getCompanies = async () => {
//   let res = await store.req("get", "company");
//   if (res.code === 200) {
//     companies.value = res.data;
//   } else {
//     store.alert("Item", req.status, "warning");
//   }
// };

// const create = async () => {
//   store.loading();
//   await store.createRecord(sectionName);
//   store.loading(false);
// };

// const edit = async (item) => {
//   await store.editRecord(sectionName, item);
// };

const cancelEditing = () => {
  formData.value = formFields;
  cPage.value = sectionName + "-list";
  editing.value = null;
};

// const update = async () => {
//   store.loading();
//   await store.updateRecord(sectionName);
//   await store.getRecord(sectionName);
//   store.loading(false);
// };
</script>
<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="page-title">
          <h4>Item Add</h4>
          <h6>Add/update Item</h6>
        </div>
      </div>
      <!-- form -->
      <div class="card" v-if="cPage == 'item' && loaded">
        <div class="card-body">
          <div class="row">
            <InputField v-model="formData.name" label="Item Name" />

            <InputSelect
              v-if="companies"
              v-model="formData.company_id"
              label="Choose Company"
              :options="companies.data"
            />

            <!-- <InputSelect
              v-model="formData.type"
              label="Item Type"
              :options="constVars?.data.itemTypes"
            /> -->

            <InputSelect
              v-model="formData.bundle_measure"
              label="Bundle Measure"
              :options="constVars?.data.bundleMeasures"
            />

            <InputSelect
              v-model="formData.unit_measure"
              label="Pieces/Unit Measure"
              :options="constVars?.data.unitMeasures"
            />

            <InputSelect
              v-model="formData.bundle_weight_measure"
              label="Weight Measure"
              :options="constVars?.data.weightMeasures"
            />

            <InputField
              v-model="formData.bundle_weight"
              label="Item Weight"
              type="number"
            />

            <InputField
              v-model="formData.bundle_price"
              label="Bundle price"
              type="number"
            />

            <InputField
              v-model="formData.unit_per_bundle"
              label="Pieces/units per bundle"
              type="number"
            />

            <InputField
              v-model="formData.unit_price"
              label="Pieces/Unit price"
              type="number"
            />

            <div class="col-lg-12" v-if="isOnline">
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="store.updateRecord(sectionName)"
                v-if="editing"
                >Update</a
              >
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="store.createRecord(sectionName)"
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
      <!-- table -->
      <div class="card" v-if="cPage == 'item-list' && loaded">
        <div class="card-body">
          <div class="table-responsive">
            <table
              class="table table-striped mb-0"
              :key="`prods-${records.length}`"
            >
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Item Type</th>
                  <th>Company</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in store.filterItemType('Finished Product')"
                  :key="item.id"
                >
                  <td>{{ item.name }}</td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.company?.name }}</td>
                  <td>
                    <a
                      class="me-3"
                      href=""
                      @click.prevent="store.editRecord(sectionName, item)"
                    >
                      <i class="fas fa-edit fa-lg"></i>
                    </a>
                    <a
                      class="me-3 confirm-text"
                      href=""
                      @click.prevent="store.delRecord(sectionName, item)"
                    >
                      <i class="fas fa-trash-alt fa-lg text-danger"></i>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
