<script setup>
import { useMainStore } from "./../stores/main-store";
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

const store = useMainStore();
const {
  cPage,
  formData,
  formErrors,
  isOnline,
  records,
  editing,
  cCompany,
  queryParams,
} = storeToRefs(store);

const formFields = {
  name: "",
  location: "",
  company_id: "",
};

onMounted(async () => {
  store.loading();
  formData.value = formFields;
  if (cCompany.value?.id) {
    formData.value.company_id = cCompany.value.id;
    queryParams.value = `col=company_id&colId=${cCompany.value.id}`;
  } else {
    store.alert("Select Company!", "Please choose a company", "error");
  }
  await store.getRecord("warehouse");
  store.loading(false);
});

const cancelEditing = () => {
  formData.value = formFields;
  cPage.value = "warehouse-list";
  editing.value = null;
};

const addCompanyId = () => {
  if (
    !formData.value.company_id ||
    formData.value.company_id === "" ||
    formData.value.company_id === null
  ) {
    formData.value.company_id = cCompany.value.id;
  }
};

const updateRec = () => {
  addCompanyId();
  const upd = store.updateRecord("warehouse");
  if (upd?.code == 200) {
    cancelEditing();
  }
};

const createRec = () => {
  addCompanyId();
  store.createRecord("warehouse");
};
</script>
<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="page-title">
          <h4>Warehouse Add</h4>
          <h6>Add/update Warehouse</h6>
        </div>
      </div>
      <!-- form -->
      <div class="card" v-if="cPage == 'warehouse' && formData">
        <div class="card-body">
          <div class="row">
            <div class="col-lg-6 col-sm-6 col-12">
              <div class="form-group">
                <label>Warehouse Name</label>
                <input
                  class="form-control"
                  type="text"
                  placeholder="Warehouse name"
                  v-model="formData.name"
                />
              </div>
            </div>

            <div class="col-lg-6 col-sm-6 col-12">
              <div class="form-group">
                <label>Warehouse Location</label>
                <input
                  class="form-control"
                  type="text"
                  placeholder="Warehouse location"
                  v-model="formData.location"
                />
              </div>
            </div>

            <div class="col-lg-12" v-if="isOnline">
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="updateRec"
                v-if="editing"
                >Update</a
              >
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="createRec"
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
      <div class="card" v-if="cPage == 'warehouse-list' && records?.data">
        <!-- <div class="card-header m-0 pb-0">
          <h5 class="card-title p-0">warehouse List</h5>
        </div> -->
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Warehouse Name</th>
                  <th>Location</th>
                  <!-- <th>Company</th> -->
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="warehouse in records.data" :key="warehouse.id">
                  <td>{{ warehouse.name }}</td>
                  <td>{{ warehouse.location }}</td>
                  <!-- <td>{{ warehouse?.company?.name ?? " - " }}</td> -->
                  <td>
                    <a
                      class="me-3"
                      href=""
                      @click.prevent="store.editRecord('warehouse', warehouse)"
                    >
                      <i class="fas fa-edit fa-lg"></i>
                    </a>
                    <a
                      class="me-3 confirm-text"
                      href=""
                      @click.prevent="store.delRecord('warehouse', warehouse)"
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
