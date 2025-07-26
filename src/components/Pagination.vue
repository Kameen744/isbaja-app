<script setup>
import { onMounted, ref } from "vue";

const emit = defineEmits();
const pageStats = ref(null);
const props = defineProps({
  record: Object,
});

const get = (url) => {
  emit("getRecord", url);
};

const getStats = (rec) => {
  if (props.record) {
    const cp = Number(props.record.current_page);
    const pp = Number(props.record.per_page);
    const total = Number(props.record.total);
    const start = (cp - 1) * pp + 1;
    const end = Math.min(start + pp - 1, total);
    pageStats.value = { start: start, end: end, total: total };
    return `Showing ${start} to ${end} of ${total} results`;
  }
  return "";
};
</script>

<template>
  <div
    class="flex-sm-fill d-sm-flex align-items-sm-center justify-content-sm-between mt-4"
  >
    <div v-if="record">
      <small>{{ getStats(record) }}</small>
    </div>

    <div>
      <ul class="pagination">
        <li
          class="page-item"
          v-for="link in record.links"
          :key="link.label"
          :class="{ active: link.active }"
        >
          <a
            class="page-link"
            @click.prevent="get(link.url)"
            v-if="link.url != null"
            href=""
            v-html="link.label"
          ></a>
        </li>
      </ul>
    </div>
  </div>

  <!-- <nav aria-label="Page navigation">
    
  </nav> -->
</template>
