<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "../stores/main-store";
import { storeToRefs } from "pinia";
// import exportUser from "../functions/User-export";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";

const store = useMainStore();
const { records, offlineRecords, isOnline, authUser } = storeToRefs(store);
const UserTableRef = ref(null);
const searchTxt = ref("");
const UserRecords = ref(null);
const props = defineProps({
  tabCols: Array,
  secName: String,
  type: { default: "online" },
});

const emit = defineEmits(["edit"]);

const getInvRows = () => {
  if (props.type === "local") {
    UserRecords.value = offlineRecords.value;
    UserRecords.value = UserRecords.value.map((rec) => {
      // let itemObj = store.getItem(rec.item_id);
      // let obj = {};
      // obj.company = itemObj?.company?.name;
      // obj.created = "0000-00-00";
      return rec;
    });
  } else {
    UserRecords.value = records.value.data;
    UserRecords.value = UserRecords.value.map((rec) => {
      // let obj = {};
      // rec.item_id = rec?.item?.id;
      // rec.company_id = rec?.company?.id;
      // rec.company = rec.company.name;
      // obj = additionalProps(obj, rec, rec.item);
      // obj.created = store.fmtDate(rec.created);
      return rec;
    });
  }
};

onMounted(() => {
  getInvRows();
});
</script>

<template>
  <div v-if="UserRecords">
    <!-- <div class="d-flex justify-content-between">
      <div class="form-group">
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="search"
          v-model="searchTxt"
        />
      </div>

      <div class="items-center align-center">
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="exportUser('csv', UserTableRef, UserRecords, tabCols, type)"
        >
          <i class="fas fa-file-csv"></i> CSV
        </button>
        <div class="m-1"></div>
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="exportUser('print', UserTableRef, UserRecords, tabCols, type)"
        >
          <i class="fas fa-print"></i> PRINT
        </button>
      </div>
    </div> -->

    <vue3-datatable
      ref="UserTableRef"
      :rows="UserRecords"
      :columns="tabCols"
      :sortable="true"
      :search="searchTxt"
      :hasCheckbox="true"
      :selectRowOnClick="true"
      :stickyHeader="true"
      class="alt-pagination"
      skin="bh-table-hover"
    >
      <template #note="data">
        <button
          class="btn-sm"
          :class="data.value.type == 'add' ? 'btn-success' : 'btn-primary'"
        >
          {{ data.value.note }}
        </button>
      </template>
      <template #actions="data">
        <div class="flex">
          <button
            class="btn text-primary btn-sm"
            :class="store.allowAction(type) ? '' : 'disabled'"
            @click.prevent="emit('edit', data.value)"
            :disabled="!authUser.permissions.includes('users:edit')"
          >
            <i class="fas fa-edit fa-lg"></i>
          </button>

          <button
            class="btn text-danger btn-sm"
            :class="store.allowAction(type) ? '' : 'disabled'"
            @click.prevent="store.delRecord(secName, data.value)"
            :disabled="!authUser.permissions.includes('users:delete')"
          >
            <i class="fas fa-trash fa-lg"></i>
          </button>
        </div>
      </template>
    </vue3-datatable>
  </div>
</template>
