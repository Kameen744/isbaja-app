<script setup>
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";

const store = useMainStore();
const { cPage } = storeToRefs(store);
const props = defineProps({
  menu: {},
});
const setSection = (section) => {
  cPage.value = section;
  store.togglMainWrapper();
};
</script>
<template>
  <li class="submenu">
    <a href="" :class="store.activeMenu(menu.name)">
      <!-- <img :src="`/assets/img/icons/${menu.icon}.svg`" /> -->
      <i class="fas" :class="menu.icon"></i>
      <span> {{ menu.title }}</span>
      <span class="menu-arrow"></span
    ></a>
    <ul v-if="menu.sub">
      <li v-for="sub in menu.sub" :key="sub.name"
        ><a
          :class="store.activeLink(sub.name)"
          href=""
          @click.prevent="setSection(sub.name)"
        >
          {{ sub.title }}</a
        ></li
      >
      <!-- <li
        ><a
          :class="store.activeLink('company-list')"
          href=""
          @click.prevent="cPage = 'company-list'"
        >
          Company List</a
        ></li
      > -->
    </ul>
  </li>
</template>
