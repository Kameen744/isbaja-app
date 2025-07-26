<script setup>
import localforage from "localforage";
import { useMainStore } from "./../stores/main-store";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import AppStatus from "../components/AppStatus.vue";
import { ref } from "vue";

const router = useRouter();
const store = useMainStore();
const { authUser, miniNav, isDarkMode, constVars } = storeToRefs(store);
const searchText = ref(null);
const searchResult = ref([]);

const logout = async () => {
  let logoutReq = await store.req("post", "auth/logout");
  // console.log("logout ", logoutReq);
  if (logoutReq.code == 200) {
    await localforage.removeItem("authUser");
    await store.clearOfflineCheckInterval();
    // await store.clearAllOfflineData();
    await router.push("/");
    window.location.reload();
  }
};

const searchItems = () => {
  const lowerCaseSearchText = searchText.value.toLowerCase();
  // searchResult.value = constVars.value?.data?.pages.filter((item) =>
  //   item.toLowerCase().includes(lowerCaseSearchText)
  // );
};

const closeSearch = () => {
  searchResult.value = [];
};

const gotoPage = (page) => {
  store.cPage = page;
};

const changePassword = () => {
  Swal.fire({
    title: "Change Password",
    showCancelButton: true,
    cancelButtonColor: "#d33",
    allowOutsideClick: false,
    width: "500px",
    html: `
    <div class="row">
      <div class="form-group col-md-6">
        <label for="">Current Password</label>
        <input type="text" class="form-control" id="cPasswChange" placeholder="Current password" />
      </div>
      <div class="form-group col-md-6">
        <label for="">New Password</label>
        <input type="text" class="form-control" id="nPasswChange" placeholder="New Password" />
      </div>
    </div>
   `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("cPasswChange").value,
        document.getElementById("nPasswChange").value,
      ];
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      let val = result.value;
      let url = `auth/change-password`;
      let data = await store.req("POST", url, {
        email: authUser.value.email,
        old_password: val[0],
        new_password: val[1],
      });

      if (data.code == 200) {
        await localforage.removeItem("authUser");
        await store.clearOfflineCheckInterval();
        await router.push("/");
        window.location.reload();
      }
    }
  });
};
const setMiniNav = () => {
  miniNav.value = !miniNav.value;
};
</script>
<template>
  <div class="header">
    <div class="header-left active">
      <a href="index.html" class="logo">
        <img src="/assets/img/isb.png" alt="" />
      </a>
      <a href="index.html" class="logo-small">
        <img src="/assets/img/isb-sm.png" alt="" />
      </a>
      <a id="toggle_btn" href="" @click.prevent="setMiniNav"></a>
    </div>

    <a id="mobile_btn" class="mobile_btn" href="#sidebar">
      <span class="bar-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </a>

    <ul class="nav user-menu">
      <li class="nav-item">
        <div class="top-nav-search">
          <a href="" class="responsive-search">
            <i class="fa fa-search"></i>
          </a>
          <form action="#">
            <div class="searchinputs">
              <input
                type="text"
                v-model="searchText"
                @update:model-value="searchItems"
                placeholder="Search Here ..."
              />
              <div class="search-addon">
                <span @click="closeSearch"
                  ><img src="/assets/img/icons/closes.svg" alt="img"
                /></span>
              </div>
            </div>
            <a class="btn" id="searchdiv"
              ><img src="/assets/img/icons/search.svg" alt="img"
            /></a>
          </form>

          <ul class="list-group search-items" v-if="searchResult.length > 0">
            <li class="list-group-item p-0" v-for="rst in searchResult">
              <div class="list-group">
                <a
                  href="#"
                  class="list-group-item list-group-item-action"
                  @click="gotoPage(rst)"
                >
                  {{ store.capitalizeFirstLetter(rst) }} - Form
                </a>
                <a
                  href="#"
                  class="list-group-item list-group-item-action"
                  @click="gotoPage(`${rst}-list`)"
                >
                  {{ store.capitalizeFirstLetter(rst) }} - List
                </a>
              </div>
            </li>
          </ul>
        </div>
      </li>

      <!-- <li class="nav-item dropdown">
        <a href="" class="dropdown-toggle nav-link" data-bs-toggle="dropdown">
          <img src="/assets/img/icons/notification-bing.svg" alt="img" />
          <span class="badge rounded-pill">4</span>
        </a>
        <div class="dropdown-menu notifications">
          <div class="topnav-dropdown-header">
            <span class="notification-title">Notifications</span>
            <a href="javascript:void(0)" class="clear-noti"> Clear All </a>
          </div>
          <div class="noti-content h-auto">
            <ul class="notification-list">
              <li class="notification-message shadow-sm">
                <a href="activities.html">
                  <div class="media d-flex">
                    <span class="avatar flex-shrink-0">
                      <img alt="" src="" />
                    </span>
                    <div class="media-body flex-grow-1">
                      <p class="noti-details"
                        ><span class="noti-title">Bernardo Galaviz</span>
                        added new task
                        <span class="noti-title">Private chat module</span></p
                      >
                      <p class="noti-time"
                        ><span class="notification-time">2 days ago</span></p
                      >
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
          <div class="topnav-dropdown-footer">
            <a href="activities.html">View all Notifications</a>
          </div>
        </div>
      </li> -->

      <li class="nav-item dropdown has-arrow main-drop">
        <a
          href=""
          class="dropdown-toggle nav-link userset"
          data-bs-toggle="dropdown"
        >
          <span class="user-img"
            ><img src="/assets/img/avator.jpg" alt="" />
            <span class="status online"></span
          ></span>
        </a>
        <div class="dropdown-menu menu-drop-user" v-if="authUser">
          <div class="profilename">
            <div class="profileset">
              <div class="profilesets d-block">
                <h6>{{ authUser.name }}</h6>
                <h6
                  ><small>{{ authUser.email }}</small></h6
                >
              </div>
            </div>
            <hr />
            <a
              class="dropdown-item logout pb-0"
              href="signin.html"
              @click.prevent="changePassword"
            >
              <i class="fas fa-key"></i> | Change Password
            </a>
            <hr class="m-0" />
            <a
              class="dropdown-item logout pb-0"
              href="signin.html"
              @click.prevent="logout"
              ><img
                src="/assets/img/icons/log-out.svg"
                class="me-2"
                alt="img"
              />Logout</a
            >
          </div>
        </div>
      </li>
      <li class="nav-item">
        <AppStatus />
      </li>
      <li class="nav-item">
        <div class="m-2">
          <button class="btn p-1 btn-rounded" @click="store.toggleMode()">
            <i
              class="fas fa-2x"
              :class="isDarkMode == 'enabled' ? 'fa-sun' : 'fa-moon'"
            ></i>
          </button>
        </div>
      </li>
    </ul>

    <div class="dropdown mobile-user-menu">
      <a
        href=""
        class="nav-link dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        ><i class="fa fa-ellipsis-v"></i
      ></a>
      <div class="dropdown-menu dropdown-menu-right">
        <!-- <a class="dropdown-item" href="profile.html">My Profile</a> -->
        <!-- <a class="dropdown-item" href="generalsettings.html">Settings</a> -->
        <a class="dropdown-item" href="" @click.prevent="logout">Logout</a>
      </div>
    </div>
  </div>
</template>
<style scoped>
.search-items {
  position: absolute;
  top: 50px;
  right: 143px;
  min-width: 230px !important;
}
/* .router-link-active */

/* routes: [
  // dynamic segments start with a colon
  { path: '/user/:id', component: User }
] */
/* $route.params.id */
</style>
