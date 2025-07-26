<script setup>
import { useMainStore } from "./../stores/main-store";
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import InputField from "../components/InputField.vue";
import InputSelect from "../components/inputSelect.vue";
// import UserModal from "../components/UserModal.vue";
import UserTable from "../components/UserTable.vue";

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
const updatedPermission = ref("updated-permission-false");

const setFormFields = () => {
  formData.value = {
    user_id: authUser.value.id,
    name: "",
    email: "",
    password: "",
    user_company: "",
    permissions: [],
  };
  updatedPermission.value = "update-" + Math.random();
};

const tableCols = ref([
  { field: "name", title: "Name" },
  { field: "email", title: "Email" },
]);

const UserRecModalRef = ref(null);
const permissions = ref([]);

const showLocaRecModal = (t = true) => {
  UserRecModalRef.value.toggleLocalRecModal(t);
};

const sectionName = "user-access";
const action = ref(null);
const loaded = ref(false);

onMounted(async () => {
  store.loading();
  // permissions.value = authUser.value.permissions;
  let subPrm = [];
  for (let i = 0; i < authUser.value.permissions.length; i++) {
    let prm = authUser.value.permissions[i];
    subPrm.push(prm);

    if (i % 4 == 3) {
      permissions.value.push(subPrm);
      subPrm = [];
    }
  }

  await setFormFields();

  if (cCompany.value?.id) {
    formData.value.company_id = cCompany.value.id;
  } else {
    store.alert("Select Company!", "Please choose a company", "error");
    return;
  }

  offlineRecords.value = await store.getOffline(`form/post/${sectionName}`);
  // queryParams.value = `col=company_id&colId=${cCompany.value.id}`;s
  await store.getRecord(sectionName);

  loaded.value = true;
  store.loading(false);
});

const getRequiredFields = () => {
  let fields = ["company_id", "user_id", "name", "email", "password"];
  if (editing.value) {
    fields = ["company_id", "user_id", "name", "email"];
  }
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

const cancelEditing = () => {
  setFormFields();
  cPage.value = sectionName + "-list";
  editing.value = null;
};

const addRemovePermission = (pm) => {
  let pmInd = formData.value.permissions.indexOf(pm);
  if (pmInd >= 0) {
    formData.value.permissions.splice(pmInd, 1);
  } else {
    formData.value.permissions.push(pm);
  }
};
</script>
<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="page-title">
          <h4>User Add</h4>
          <h6
            >Add/update User(s) for <strong>{{ cCompany.name }}</strong></h6
          >
        </div>
        <!-- 
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
        </div> -->
      </div>

      <!-- form -->
      <div class="card" v-if="cPage == sectionName && loaded">
        <div class="card-body">
          <div class="row">
            <InputSelect
              v-if="companies"
              v-model="formData.user_company"
              label="Company"
              :options="companies.data"
              col="3"
            />
            <InputField v-model="formData.name" label="Name" col="3" />
            <InputField v-model="formData.email" label="Email" col="3" />
            <InputField v-model="formData.password" label="Password" col="3" />

            <div
              class="col-lg-12 mb-3"
              :key="updatedPermission"
              v-if="!editing"
            >
              <h4>Permissions</h4>

              <hr />
              <div class="row justify-content-start">
                <div class="col-auto" v-for="perm in permissions">
                  <div class="form-check" v-for="(pm, i) in perm">
                    <label class="form-check-label">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        :checked="false"
                        @change="addRemovePermission(pm)"
                      />
                      <strong>{{ pm.split(":")[0] }}</strong>
                      {{ pm.split(":")[1] }}
                    </label>
                  </div>
                  <hr />
                </div>
              </div>
              <hr />
            </div>

            <div class="col-lg-12 mb-3" :key="updatedPermission" v-if="editing">
              <h4>Permissions</h4>

              <hr />
              <div class="row justify-content-start">
                <div class="col-auto" v-for="perm in permissions">
                  <div class="form-check" v-for="(pm, i) in perm">
                    <label class="form-check-label">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        :checked="editing.permissions.includes(pm)"
                        @change="addRemovePermission(pm)"
                      />
                      <strong>{{ pm.split(":")[0] }}</strong>
                      {{ pm.split(":")[1] }}
                    </label>
                  </div>
                  <hr />
                </div>
              </div>
              <hr />
            </div>

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
      <!-- <div class="card" v-if="cPage == sectionName + '-list' && loaded">
        <div class="card-body">
          <UserTable
            :tabCols="tableCols"
            :secName="sectionName"
            :key="records?.length ?? 1 + Math.random()"
            @edit="edit"
          />
        </div>
      </div>
      <UserModal
        ref="UserRecModalRef"
        :tabCols="tableCols"
        :secName="sectionName"
        v-if="loaded"
      /> -->

      <div class="card" v-if="cPage == sectionName + '-list' && records?.data">
        <!-- <div class="card-header m-0 pb-0">
          <h5 class="card-title p-0">Company List</h5>
        </div> -->
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in records.data" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <a
                      class="me-3"
                      href=""
                      @click.prevent="store.editRecord(sectionName, user)"
                    >
                      <i class="fas fa-edit fa-lg"></i>
                    </a>
                    <a
                      class="me-3 confirm-text"
                      href=""
                      @click.prevent="store.delRecord(sectionName, user)"
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
