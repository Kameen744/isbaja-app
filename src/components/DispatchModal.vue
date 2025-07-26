<script setup>
import { onMounted, ref } from "vue";
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";
import printSaleOrder from "../functions/sale-order-print";

const store = useMainStore();
const { isOnline, offlineRecords } = storeToRefs(store);
const modalRef = ref(null);
let DispatchOrderModal = null;
let dispatchDatar = ref(null);
let dispatchFormData = ref({
  Sale_order_id: "",
  items: [],
});

const toggleDispatchModal = (data = null, t = false) => {
  if (data) {
    dispatchDatar.value = data;
    dispatchFormData.value.Sale_order_id = data.id;
    dispatchFormData.value.items = data.items;
    for (let i = 0; i < dispatchFormData.value.items.length; i++) {
      dispatchFormData.value.items[i]["dispatch"] = 0;
    }
  }

  if (t) {
    DispatchOrderModal.show();
  } else {
    DispatchOrderModal.hide();
  }
};

const updateDispatchQuantity = async () => {
  store.loading();
  for (let i = 0; i < dispatchFormData.value.items.length; i++) {
    const el = dispatchFormData.value.items[i];
    const ttDisp = Number(el.sale_order_dispatched) + Number(el.dispatch);
    if (ttDisp > el.bundle_removed) {
      store.alert(
        "Dispatch Order",
        `Dispatched quantity is too high for: ${el.item.name}`,
        "error"
      );
      return;
    }
  }

  const data = await store.req("POST", "sale/dispatch", dispatchFormData.value);

  if (data?.code == 200) {
    dispatchFormData.value.Sale_order_id = data.data.id;
    dispatchFormData.value.items = data.data.items;
    for (let i = 0; i < dispatchFormData.value.items.length; i++) {
      dispatchFormData.value.items[i]["dispatch"] = 0;
    }
  } else {
    store.alert("Dispatch Order", "Dispatch Error", "error");
  }

  store.loading(false);
};

// const props = defineProps({
//   recData: Object,
// });

// const emit = defineEmits(["update:rec", "del:rec"]);

const emit = defineEmits(["edit:rec", "dispatchModalDownloadReceift"]);

const donwnloadRec = (data) => {
  emit("dispatchModalDownloadReceift", data);
};

onMounted(() => {
  DispatchOrderModal = new bootstrap.Modal(modalRef.value);
});

defineExpose({ toggleDispatchModal });
</script>

<template>
  <div
    ref="modalRef"
    class="modal fade"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel"
            >Dispatch Sale Order</h5
          >
          <button
            type="button"
            class="btn-close"
            @click="toggleDispatchModal(false)"
            aria-label="Close"
          >
            <i class="fas fa-times-circle"></i>
          </button>
        </div>
        <div class="modal-body">
          <table class="table table-striped table-responsive">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty Ordered</th>
                <th>TT Dispatched</th>
                <th>Dispatch</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <!-- {{ dispatchDatar?.items }} -->
              <tr v-for="(item, i) in dispatchFormData?.items">
                <td>{{ item.item.name }}</td>
                <td>{{ item.bundle_removed }}</td>
                <td>{{ dispatchFormData.items[i].sale_order_dispatched }}</td>
                <td>
                  <input
                    class="form-control sm-form-cont"
                    type="number"
                    v-model="dispatchFormData.items[i].dispatch"
                    :disabled="
                      item.bundle_removed == item.sale_order_dispatched
                    "
                    @focusin="store.onNumInputFocus"
                    @focusout="store.onNumInputFocusOut"
                  />
                </td>
                <td>
                  <span
                    v-if="item.bundle_removed == item.sale_order_dispatched"
                  >
                    Completed
                  </span>
                  <span v-else>
                    Dsp: ({{ item.sale_order_dispatched }}) Rem: ({{
                      Number(item.bundle_removed) -
                      Number(item.sale_order_dispatched)
                    }})
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer py-2 d-flex justify-content-between">
          <div class="">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              v-if="isOnline"
              @click="updateDispatchQuantity"
              >Dispatch
            </button>

            <button
              type="button"
              class="btn btn-dark btn-sm mx-3"
              @click="toggleDispatchModal(false)"
              >Cancel / Close
            </button>
          </div>
          <div class="">
            <button
              class="btn btn-success btn-sm mx-3"
              @click.prevent="donwnloadRec(dispatchDatar)"
            >
              Download <i class="fas fa-download fa-lg"></i>
            </button>
            <button
              class="btn btn-info btn-sm"
              @click.prevent="printSaleOrder(dispatchDatar)"
            >
              Print PDF <i class="fas fa-file-pdf fa-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.modal-body {
  max-height: 70vh;
  overflow: hidden;
  overflow-y: auto;
}
.sm-form-cont {
  max-width: 100px;
}
</style>
