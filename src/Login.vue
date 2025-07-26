<script setup>
import localforage from "localforage";
import { useMainStore } from "./stores/main-store";
import { storeToRefs } from "pinia";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const route = useRoute();
const store = useMainStore();
const loginProgress = ref(false);
const { isLoggedIn } = storeToRefs(store);
const data = ref({
  email: "",
  password: "",
});

const authError = ref("");

const login = async () => {
  if (data.value.email && data.value.password) {
    loginProgress.value = true;
    // https://isbaja-api.test
    // https://api.isbaja.com
    axios
      .get("https://api.isbaja.com/sanctum/csrf-cookie")
      // .get("https://isbaja-api.test/sanctum/csrf-cookie")
      .then(async (response) => {
        let loginReq = await store.req("post", "auth/login", data.value);
        if (loginReq.status === false) {
          authError.value = loginReq;
          setTimeout(() => {
            authError.value = "";
          }, 3000);
          loginProgress.value = false;
        } else {
          localforage.setItem("authUser", loginReq.user);
          isLoggedIn.value = true;
          router.push("/app");
        }
      });
  }
};
</script>
<template>
  <div class="d-flex flex-column container">
    <div class="row vh-100">
      <div class="col-sm-10 col-md-8 col-lg-6 d-table h-100 mx-auto">
        <div class="d-table-cell align-middle">
          <div class="card">
            <div class="card-body">
              <div class="m-sm-4">
                <div class="text-center">
                  <img
                    class="img-fluid"
                    src="/assets/img/isb.png"
                    alt="ISBAJA"
                    width="200"
                    height="200"
                  />
                </div>
                <hr />

                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fa fa-envelope" aria-hidden="true"></i>
                    </span>
                    <input
                      class="form-control"
                      v-model="data.email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required=""
                    />
                  </div>

                  <!-- <span class="text-danger">{{ $message }}</span> -->
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fa fa-key" aria-hidden="true"></i>
                    </span>
                    <input
                      class="form-control form-control"
                      v-model="data.password"
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                    />
                  </div>

                  <span class="text-danger" v-if="authError">
                    {{ authError.message }}
                  </span>

                  <!-- <small class="mt-2">
                    <a href="#">Forgot password?</a>
                  </small> -->
                </div>
                <div class="mt-1">
                  <label class="form-check">
                    <input
                      class="form-check-input"
                      wire:model="remember"
                      type="checkbox"
                      value="remember-me"
                      name="remember-me"
                      checked=""
                    />
                    <span class="form-check-label">
                      Remember me next time
                    </span>
                  </label>
                </div>
                <hr />
                <div class="mt-3 text-center">
                  <!-- <button
                    class="btn btn-lg btn-primary"
                    type="button"
                    @click="login"
                    >Sign in</button
                  > -->
                  <button
                    class="btn btn-primary mb-1"
                    type="button"
                    :disabled="loginProgress"
                    @click="login"
                  >
                    <span
                      class="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                      v-if="loginProgress"
                    ></span>
                    {{ loginProgress ? "Loading..." : "Sign in" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
