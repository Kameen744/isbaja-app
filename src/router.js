// import { createRouter, createWebHashHistory } from "vue-router";
import { createMemoryHistory, createRouter } from "vue-router";
import Login from "./Login.vue";
import Home from "./Home.vue";
import localforage from "localforage";

const routes = [
  {
    path: "/",
    name: "login",
    component: Login,
  },
  {
    path: "/app",
    name: "home",
    component: Home,
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// const router = createRouter({
//   history: createWebHashHistory(),
//   routes,
// });

router.beforeEach(async (to, from, next) => {
  const authUser = await localforage.getItem("authUser");
  if (to.name !== "login" && !authUser) {
    next({ name: login });
  } else {
    if (to.name == "login" && authUser != null) {
      next("/app");
    } else {
      next();
    }
  }
});

export default router;
