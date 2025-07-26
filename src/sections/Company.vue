<script setup>
import { useMainStore } from "./../stores/main-store";
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

const store = useMainStore();
const { cPage, formData, formErrors, records, editing } = storeToRefs(store);

const formFields = {
  name: "",
  address: "",
  rc_no: "",
};

onMounted(async () => {
  store.loading();
  formData.value = formFields;
  await store.getRecord("company");
  store.loading(false);
});

const cancelEditing = () => {
  formData.value = formFields;
  cPage.value = "company-list";
  editing.value = null;
};
</script>
<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="page-title">
          <h4>Company Add</h4>
          <h6>Add/update Company</h6>
        </div>
      </div>
      <!-- form -->
      <div class="card" v-if="cPage == 'company' && formData">
        <div class="card-body">
          <div class="row">
            <div class="col-lg-4 col-sm-4 col-12">
              <div class="form-group">
                <label>Company Name </label>
                <input
                  class="form-control"
                  type="text"
                  placeholder="Company name"
                  v-model="formData.name"
                />
              </div>
            </div>

            <div class="col-lg-4 col-sm-4 col-12">
              <div class="form-group">
                <label>Address</label>
                <input
                  class="form-control"
                  type="text"
                  placeholder="Company Address"
                  v-model="formData.address"
                />
              </div>
            </div>

            <div class="col-lg-4 col-sm-4 col-12">
              <div class="form-group">
                <label>RC No.</label>
                <input
                  class="form-control"
                  type="text"
                  placeholder="Company RC No."
                  v-model="formData.rc_no"
                />
              </div>
            </div>

            <div class="col-lg-12">
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="store.updateRecord('company')"
                v-if="editing"
                >Update</a
              >
              <a
                href=""
                class="btn btn-submit me-2"
                @click.prevent="store.createRecord('company')"
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
      <div class="card" v-if="cPage == 'company-list' && records?.data">
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
                <tr v-for="company in records.data" :key="company.id">
                  <td>{{ company.name }}</td>
                  <td>{{ company.address }}</td>
                  <td>
                    <a
                      class="me-3"
                      href=""
                      @click.prevent="store.editRecord('company', company)"
                    >
                      <i class="fas fa-edit fa-lg"></i>
                    </a>
                    <a
                      class="me-3 confirm-text"
                      href=""
                      @click.prevent="store.delRecord('company', company)"
                    >
                      <i class="fas fa-trash-alt fa-lg text-danger"></i>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- <Pagination :record="list" @getRecord="getRec"></Pagination> -->
            <!-- <nav aria-label="Page navigation">
              <ul class="pagination">
                <li
                  class="page-item"
                  :class="{ disabled: !list.prev_page_url }"
                >
                  <a
                    class="page-link"
                    @click.prevent="fetchData(list.prev_page_url)"
                    href="#"
                    aria-label="Previous"
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li
                  class="page-item"
                  v-for="link in list.links"
                  :key="link.label"
                  :class="{ active: link.active }"
                >
                  <a
                    class="page-link"
                    @click.prevent="fetchData(link.url)"
                    v-if="link.url"
                    href="#"
                    >{{ link.label }}</a
                  >
                  <span class="page-link" v-else>{{ link.label }}</span>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: !list.next_page_url }"
                >
                  <a
                    class="page-link"
                    @click.prevent="fetchData(list.next_page_url)"
                    href="#"
                    aria-label="Next"
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
