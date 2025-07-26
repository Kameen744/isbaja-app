<script setup>
import { useMainStore } from "./../stores/main-store";
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import InputField from "../components/InputField.vue";
import CustomerModal from "../components/CustomerModal.vue";
import CustomerTable from "../components/CustomerTable.vue";

const store = useMainStore();

const {
  cPage,
  authUser,
  cCompany,
  constVars,
  formData,
  records,
  companies,
  items,
  editing,
  queryParams,
  offlineRecords,
  isOnline,
} = storeToRefs(store);

const setFormFields = () => {
  formData.value = {
    user_id: authUser.value.id,
    name: "",
    phone: "",
    email: "",
    address: "",
  };
};

const tableCols = ref([
  { field: "name", title: "Name" },
  { field: "phone", title: "Phone Number" },
  { field: "email", title: "Email" },
  { field: "address", title: "Address" },
  { field: "actions", title: "Actions", search: false },
]);

const customerRecModalRef = ref(null);

const showLocaRecModal = (t = true) => {
  customerRecModalRef.value.toggleLocalRecModal(t);
};

const sectionName = "customer";
const action = ref(null);
const loaded = ref(false);

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

  loaded.value = true;
  store.loading(false);
});

const getRequiredFields = () => {
  let fields = ["company_id", "user_id", "name", "phone"];
  if (!formData.value.company_id) {
    formData.value.company_id = cCompany.value.id;
  }
  if (!formData.value.user_id) {
    formData.value.user_id = authUser.value.id;
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
      await store.getRecord(sectionName);
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
      await store.getRecord(sectionName);
    }
  }
  store.loading(false);
};

const edit = (item) => {
  store.editRecord(sectionName, item);
};

const cancelEditing = () => {
  setFormFields();
  cPage.value = sectionName + "-list";
  editing.value = null;
};
</script>
<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="page-title">
          <h4>Customer Add</h4>
          <h6
            >Add/update Customer(s) for <strong>{{ cCompany.name }}</strong></h6
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
      <div class="card" v-if="cPage == sectionName && loaded">
        <div class="card-body">
          <div class="row">
            <InputField v-model="formData.name" label="Name" col="4" />

            <InputField
              v-model="formData.phone"
              label="Phone Number"
              type="number"
              col="4"
            />

            <InputField
              v-model="formData.email"
              label="Email (optional)"
              col="4"
            />

            <InputField
              v-model="formData.address"
              label="Address (optional)"
              col="12"
            />

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
      <!-- table -->
      <div class="card" v-if="cPage == sectionName + '-list' && loaded">
        <div class="card-body">
          <CustomerTable
            :tabCols="tableCols"
            :secName="sectionName"
            :key="records?.length ?? 1 + Math.random()"
            @edit="edit"
          />
        </div>
      </div>
      <CustomerModal
        ref="customerRecModalRef"
        :tabCols="tableCols"
        :secName="sectionName"
        v-if="loaded"
      />
    </div>
  </div>
</template>
