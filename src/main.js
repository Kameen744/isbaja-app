import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import SimpleTypeahead from "vue3-simple-typeahead";
import "./style.css";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS

import localforage from "localforage";
window.localforage = localforage;

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(SimpleTypeahead);
app.mount("#app");
