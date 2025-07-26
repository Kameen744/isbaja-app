<script setup>
import { useMainStore } from "./../stores/main-store";
import { onMounted, ref, toRaw } from "vue";
import { storeToRefs } from "pinia";
import InputField from "../components/InputField.vue";
import InputSelect from "../components/inputSelect.vue";
import SaleOrderModal from "../components/SaleOrderModal.vue";
import SaleOrderTable from "../components/SaleOrderTable.vue";
import SaleOrderDispatchTable from "../components/SaleOrderDispatchTable.vue";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import SaleOrderReceiptHTML from "../functions/sale-order-html";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import * as dialog from "@tauri-apps/plugin-dialog";
import { downloadDir } from "@tauri-apps/api/path";

// import * as dialog from "@tauri-apps/plugin-dialog";
// import { writeFile } from "@tauri-apps/plugin-fs";
// import { convertFileSrc } from "@tauri-apps/api/tauri";

// import { invoke } from "@tauri-apps/api";

// import { save } from "@tauri-apps/api/dialog";
// import { writeBinaryFile } from "@tauri-apps/api/fs";
// import { convertFileSrc } from "@tauri-apps/api/tauri";

const store = useMainStore();

// const invoke = window.__TAURI_INTERNALS__.invoke;
// const { download } = window.__TAURI__.upload;
const {
  authUser,
  cPage,
  cCompany,
  companies,
  formData,
  records,
  customers,
  items,
  editing,
  queryParams,
  offlineRecords,
  warehouses,
  isApp,
} = storeToRefs(store);

const setFormFields = () => {
  formData.value = {
    name: "",
    customer_id: "",
    company_id: cCompany.value.id,
    ware_house_id: "",
    order_date: store.getCurrentDate(),
    phone: "",
    vehicle_no: "",
    tp: "",
    items: [],
  };
};

const item_sold = ref({
  item_id: "",
  bundle_removed: 0,
  unit_removed: 0,
});

const tableCols = ref([
  { field: "customer_name", title: "Customer" },
  { field: "product", title: "Products" },
  // { field: "status", title: "Status" },
  { field: "order_no", title: "Order No." },
  { field: "tp", title: "T.P" },
  { field: "created_by", title: "Created By" },
  // { field: "updated_by", title: "Completed By" },
  { field: "created", title: "Date", search: false },
  { field: "actions", title: "Actions", search: false },
]);

const tableDispatchCols = ref([
  { field: "order_date", title: "Order Date", search: false },
  { field: "created", title: "Dispatch Date", search: false },
  { field: "customer_name", title: "Customer" },
  { field: "order_no", title: "Order No." },
  { field: "product", title: "Product", search: false },
  { field: "dispatched", title: "Dispatch Qtty", search: false },
]);

const SaleOrderModalRef = ref(null);

const sectionName = "sale";
const sectionDispatchName = "dispatch-log";
const loaded = ref(false);
// const customers = ref(null);

const showLocaRecModal = (t = true) => {
  SaleOrderModalRef.value.toggleLocalRecModal(t);
};

const loadFormData = () => {
  for (let i = 0; i < items.value.data.length; i++) {
    const item = items.value.data[i];
    if (item.type == "Finished Product") {
      formData.value.items.push({
        item_id: item.id,
        bundle_removed: 0,
        price: item.bundle_price,
      });
    }
  }
};
onMounted(async () => {
  store.loading();
  await setFormFields();

  loadFormData();

  if (cCompany.value?.id) {
    formData.value.company_id = cCompany.value.id;
  } else {
    store.alert("Select Company!", "Please choose a company", "error");
    return;
  }

  offlineRecords.value = await store.getOffline(`form/post/${sectionName}`);

  queryParams.value = `col=company_id&colId=${cCompany.value.id}`;
  // await store.getRecord(sectionName);
  customers.value = await store.req("get", "customer");
  loaded.value = true;
  store.loading(false);
});

const filter_items = (type = null) => {
  const data = items.value.data.filter(
    (item) => item.type == "Finished Product"
  );
  return data;
};

const remove_from_form = (item_id) => {
  formData.value.items = formData.value.items.filter(
    (item) => item.item_id !== item_id
  );
};

const validateForm = async () => {
  // await add_to_form();
  if (
    (formData.value.ware_house_id && formData.value.ware_house_id != "") ||
    (formData.value.customer_id && formData.value.customer_id != "") ||
    (formData.value.name &&
      formData.value.name != "" &&
      formData.value.order_date &&
      formData.value.order_date != "" &&
      formData.value.phone &&
      formData.value.phone != "" &&
      formData.value.items &&
      formData.value.items != [])
  ) {
    return true;
  } else {
    store.alert("sale Form!", "Required fields are empty", "warning");
    return false;
  }
};

const setAdditionalIds = () => {
  if (!formData.value?.company_id) {
    formData.value.company_id = cCompany.value.id;
  }
  if (!formData.value?.user_id) {
    formData.value.user_id = authUser.value.id;
  }
};

const shareBlob = async (canvas) => {
  // Convert canvas to a Blob
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  // Create a file for sharing
  const file = new File([blob], "image.png", { type: "image/png" });
  const fileUrl = URL.createObjectURL(file);
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(fileUrl)}`;
  window.open(whatsappShareUrl, "_blank");
};

const saveImage = async (canvas, filename) => {
  let dwdir = await downloadDir();
  const filePath = await dialog.save({
    defaultPath: dwdir + "/" + filename,
  });
  canvas.toBlob(async function (blob) {
    if (blob) {
      const arrayBuffer = await blob.arrayBuffer(); // Convert Blob to ArrayBuffer if nee
      const uint8Array = new Uint8Array(arrayBuffer); // Convert to Uint8Array
      await writeFile(filePath, uint8Array, {
        baseDir: BaseDirectory.AppConfig,
      });
    }
  }, "image/png");
};

const downloadReceipt = async (data) => {
  let elm = await document.createElement("div");
  let elmId = "sale-reciept-id";
  elm.id = elmId;
  elm.innerHTML = await SaleOrderReceiptHTML(data);
  document.body.appendChild(elm);
  let htmlDoc = document.getElementById(elmId);
  await html2canvas(htmlDoc, { width: 400 }).then(function (canvas) {
    const filename = `${data?.customer?.name}-${store.getCurrentDate()}.png`;
    if (isApp.value) {
      saveImage(canvas, filename);
    } else {
      let dataUrl = canvas.toDataURL();
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.target = "_blank";
      link.click();
    }
    htmlDoc.remove();
  });
};

const create = async () => {
  const valid = await validateForm();
  if (valid) {
    setAdditionalIds();
    const save = await store.createRecord(sectionName);
    if (save?.code == 200) {
      downloadReceipt(save.data);
      setFormFields();
      loadFormData();
    }
  }
};

const update = async () => {
  const valid = await validateForm();
  if (valid) {
    setAdditionalIds();
    const update = await store.updateRecord(sectionName);
    if (update?.code == 200) {
      setFormFields();
    }
  }
};

const cancelEditing = () => {
  setFormFields();
  cPage.value = sectionName + "-list";
  editing.value = null;
};

const selectCustomerEvent = (val) => {
  formData.value.phone = val.phone;
  formData.value.customer_id = val.id;
  formData.value.name = "";
};

const onCustomerInput = (event) => {
  formData.value.phone = "";
  formData.value.name = event.input;
};

// const onInputFocus = (event) => {
//   if (event.target.value == 0) {
//     event.target.value = "";
//   }
// };

// const onInputFocusOut = (event) => {
//   if (event.target.value == "" || event.target.value <= 0) {
//     event.target.value = 0;
//   }
// };
</script>
<template>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="page-title">
          <h4>Sale Order</h4>
          <h6
            >Add/update sale for <strong>{{ cCompany.name }}</strong></h6
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

      <div class="card" v-if="cPage == sectionName && loaded">
        <div class="card-body">
          <div class="row">
            <InputSelect
              v-model="formData.company_id"
              label="Company"
              :options="store.filter_companies()"
              col="2"
            />

            <div class="col-12 col-lg-2 col-sm-2" v-if="!editing">
              <div class="form-group">
                <label>Customer Name</label>
                <vue3-simple-typeahead
                  :items="customers.data"
                  placeholder="Customer name"
                  @selectItem="selectCustomerEvent"
                  @onInput="onCustomerInput"
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
              v-else
              v-model="formData.name"
              label="Customer"
              col="2"
            />

            <InputField
              v-model="formData.phone"
              label="Phone Number"
              type="number"
              col="2"
            />

            <InputSelect
              v-model="formData.ware_house_id"
              label="Select Warehouse"
              :options="store.filter_warehouses('product')"
              col="2"
            />

            <!-- {{ filter_warehouses() }} -->

            <InputField
              v-model="formData.vehicle_no"
              label="Vehcl No."
              col="2"
            />

            <InputField v-model="formData.tp" label="T.P" col="2" />

            <!-- items sold -->

            <table class="table">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>QTY</th>
                  <th>PRICE</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(item, k) in formData.items">
                  <tr>
                    <td>{{ store.getItem(item.item_id)?.name }}</td>
                    <td class="p-0">
                      <input
                        type="number"
                        class="form-control"
                        v-model="formData.items[k].bundle_removed"
                        @focusin="store.onNumInputFocus"
                        @focusout="store.onNumInputFocusOut"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        class="form-control"
                        v-model="formData.items[k].price"
                        @focusin="store.onNumInputFocus"
                        @focusout="store.onNumInputFocusOut"
                      />
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>

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
                >Save sale Order</a
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
          <SaleOrderTable
            :tabCols="tableCols"
            :secName="sectionName"
            @downloadReceift="downloadReceipt"
          />
        </div>
      </div>
      <div
        class="card"
        v-if="cPage == sectionName + '-dispatch-list' && loaded"
      >
        <div class="card-body">
          <SaleOrderDispatchTable
            :tabCols="tableDispatchCols"
            :secName="sectionDispatchName"
            @downloadReceift="downloadReceipt"
          />
        </div>
      </div>
      <SaleOrderModal
        ref="SaleOrderModalRef"
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
</style>
