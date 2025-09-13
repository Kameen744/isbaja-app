import { defineStore } from "pinia";
import axios from "axios";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import localforage from "localforage";
import { useRoute, useRouter } from "vue-router";
import moment from "moment-timezone";
import { toRaw } from "vue";

const baseUrl = "https://isbaja-api.test";
// const baseUrlT = "http://127.0.0.1:8000";
// const baseUrl = "https://api.isbaja.com";
axios.defaults.baseURL = `${baseUrl}/api/`;

// it clicked on a dashbaord to should take you to the main item.

// axios.defaults.baseURL = "https://api.isbaja.com/api/";

// axios.defaults.headers.common["Accept"] = "application/json";
// axios.defaults.headers.post["Content-Type"] = "application/json";

// axios.defaults.withCredentials = true;
// axios.defaults.withXSRFToken = true;
// axios.defaults.headers.common["Referer"] = "http://localhost:1420";
// axios.defaults.headers.common["Origin"] = "http://localhost:1420";
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;

export const useMainStore = defineStore("useMainStore", {
  state: () => ({
    cPage: "main",
    cCompany: null,
    companies: {},
    warehouses: {},
    constVars: {},
    items: null,
    records: null,
    customers: null,
    suppliers: null,
    offlineRecords: null,
    uploadProgress: 0,
    editing: null,
    formData: null,
    formErrors: null,
    isLoading: false,
    isOnline: navigator.onLine,
    isLoggedIn: null,
    authUser: null,
    cacheData: ["company", "item"],
    queryParams: null,
    appInitialized: null,
    totals: null,
    router: useRouter(),
    productsRemain: null,
    rawMaterialsRemain: null,
    offlineCheckInterval: null,
    isDarkMode: "disabled",
    miniNav: false,
    isApp: false,
    bUrl: baseUrl,
    selectedWareHouseRecords: {},
  }),

  actions: {
    // ------------------- INIT APP -------------------------------
    async initialize() {
      this.loading();

      window.addEventListener("online", () => this.updateAppStatus());
      window.addEventListener("offline", () => this.updateAppStatus());

      if (window?.__TAURI_INTERNALS__) {
        this.isApp = true;
      } else {
        this.isApp = false;
      }

      await this.offlineCheck();

      let appData = await this.req("get", `app_data/${this.authUser.id}`);
      if (appData?.message === "Unauthenticated.") {
        await localforage.removeItem("authUser");
        await this.clearOfflineCheckInterval();
        await this.router.push("/");
        window.location.reload();
      }
      if (
        appData.data.user &&
        appData.data.user?.permissions.length !=
          this.authUser.permissions.length
      ) {
        await localforage.removeItem("authUser");
        this.router.push("/");
      }

      this.companies.data = appData.data.company;
      // console.log(this.companies);
      this.warehouses.data = appData.data.warehouse;
      this.items = appData.data.item.original;
      // this.customers = appData.data.customer.original;
      this.constVars.data = appData.data.const;

      this.cCompany = await this.getOffline("cCompany");
      this.isDarkMode = await this.getOffline("darkmode");
      await this.updateDarkMode();
      await this.filterItems();
      this.appInitialized = true;
      this.loading(false);
    },
    // setmode
    toggleMode() {
      if (this.isDarkMode == "enabled") {
        this.isDarkMode = "disabled";
      } else {
        this.isDarkMode = "enabled";
      }

      this.updateDarkMode();
    },
    // darkmode
    updateDarkMode(state) {
      if (this.isDarkMode == "enabled") {
        document.body.classList.add("dark-mode");
        this.saveOffline("darkmode", "enabled");
      } else {
        document.body.classList.remove("dark-mode");
        this.saveOffline("darkmode", "disabled");
      }
    },

    async togglMainWrapper() {
      const elm = document.querySelector(".main-wrapper");
      elm.classList.remove("slide-nav");
    },

    // -------------------- LOADING INDICATOR SET ---------------------
    loading(state = true) {
      if (state) {
        $("#global-loader").fadeIn("slow");
      } else {
        $("#global-loader").fadeOut("slow");
      }
    },

    // -------------------- FORMAT DATE ----------------------
    fmtDate(date) {
      return moment(date, "YYYYMMDD").tz("Africa/Lagos").format("ll");
    },

    fmtDateT(date) {
      return moment(date).tz("Africa/Lagos").format("lll");
    },

    // -------------------- GET CURRENT DATE -------------------
    getCurrentDate() {
      return moment().tz("Africa/Lagos").format("YYYY-MM-DD");
    },

    fmtNum(num) {
      return num.toLocaleString("en-US");
    },

    count_weight(data, type) {
      let val;
      if (type == "add") {
        if (data.total_unit_added > 0 && data.unit_per_bundle > 0) {
          val =
            Number(data.total_bundle_added) +
            Math.floor(
              Number(data.total_unit_added) / Number(data.unit_per_bundle)
            );
        } else {
          val = Number(data.total_bundle_added);
        }
      } else {
        if (data.total_unit_removed > 0 && data.unit_per_bundle > 0) {
          val =
            Number(data.total_bundle_removed) +
            Math.floor(
              Number(data.total_unit_removed) / Number(data.unit_per_bundle)
            );
        } else {
          val = Number(data.total_bundle_removed);
        }
      }

      return val;
    },

    count_bundles(data, type) {
      let val;
      if (type == "add") {
        if (data.total_unit_added > 0 && data.unit_per_bundle > 0) {
          val =
            Number(data.total_bundle_added) +
            Math.floor(
              Number(data.total_unit_added) / Number(data.unit_per_bundle)
            );
        } else {
          val = Number(data.total_bundle_added);
        }
      } else {
        if (data.total_unit_removed > 0 && data.unit_per_bundle > 0) {
          val =
            Number(data.total_bundle_removed) +
            Math.floor(
              Number(data.total_unit_removed) / Number(data.unit_per_bundle)
            );
        } else {
          val = Number(data.total_bundle_removed);
        }
      }

      return val;
    },

    count_unit_remain(data, type) {
      if (type == "add") {
        if (data.total_unit_added > 0 && data.unit_per_bundle > 0) {
          return Number(data.total_unit_added) % Number(data.unit_per_bundle);
        } else {
          return 0;
        }
      } else {
        if (data.total_unit_removed > 0 && data.unit_per_bundle > 0) {
          return Number(data.total_unit_removed) % Number(data.unit_per_bundle);
        } else {
          return 0;
        }
      }
    },

    count_instock(data) {
      const total_bundles_added = this.count_bundles(data, "add");
      const total_units_added = this.count_unit_remain(data, "add");

      const total_bundles_removed = this.count_bundles(data, "removed");
      const total_units_removed = this.count_unit_remain(data, "removed");

      const bundle = total_bundles_added - total_bundles_removed;
      return this.fmtNum(bundle);
    },

    // -------------------- OFFLINE CHECK --------------------
    async offlineCheck() {
      try {
        let token = `Bearer ${this.authUser.token}`;
        axios.defaults.headers.common["Authorization"] = token;
        await axios.request({
          method: "get",
          url: "check-connection",
        });
        this.isOnline = true;
      } catch {
        this.isOnline = false;
      }
      if (!this.appInitialized) {
        this.offlineCheckInterval = setInterval(this.offlineCheck, 200000);
      }
    },

    async clearOfflineCheckInterval() {
      await clearInterval(this.offlineCheckInterval);
    },

    // -------------------- UUID GENERATE --------------------

    randomUUID() {
      return uuidv4();
    },

    // --------------------UPDATE APP CONNECTIVITY STATUS -------------
    updateAppStatus() {
      this.isOnline = navigator.onLine;
    },

    //  ------------------ CURRENT COMPANY SET--------------------
    async setCurrentCompany(event) {
      const cId = event.target.value;
      const cCom = await this.companies.data.find((obj) => obj.id === cId);
      this.cCompany = cCom;

      this.totals = await this.req(
        "get",
        `dashboard/totals/${this.cCompany.id}`
      );

      await this.saveOffline("cCompany", {
        id: cCom.id,
        name: cCom.name,
        address: cCom.address,
      });

      window.location.reload();
      this.filterItems();
    },

    // ------------------ FILTER ITEMS BY COMPANY-------------
    filterItems() {
      if (this.cCompany) {
        const filtered = this.items.data.filter(
          (item) => item.company.id == this.cCompany.id
        );
        this.items.data = filtered;
      }
    },

    filterItemType(itype) {
      const filtered = this.items.data.filter((item) => item.type == itype);
      return filtered;
    },

    // ------------------- GET OBJECT FROM OBJ KEY -------------------
    getObj(objArray, objId) {
      const foundObject = objArray.find((obj) => obj.id === objId);
      return foundObject;
    },

    // -------------------- GET ITEM BY ID ---------------------------
    getItem(itemId) {
      const itemObject = this.items.data.find((obj) => obj.id === itemId);
      return itemObject;
    },

    getSupplier(itemId) {
      const itemObject = this.suppliers.data.find((obj) => obj.id === itemId);
      return itemObject;
    },

    getWarehouse(id) {
      const wareIbj = this.warehouses.data.find((obj) => obj.id === id);
      return wareIbj;
    },
    // ---------------------GET COMPANY ---------------------------------
    getComp(comId) {
      const itemObject = this.companies.data.find((obj) => obj.id === comId);
      return itemObject;
    },

    // ------------------ CAPITALIZE FIRST STR LETTER ----------------
    capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // --------------------- GET OFFLINE RECORD ------------------
    async getOffline(key) {
      let data = await localforage.getItem(key);
      return data;
    },

    // --------------------- CLEAN FORM DATA ---------------------------
    cleanFormData(data) {
      data = toRaw(data);
      data = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== "")
      );
      return data;
    },

    //  -------------------- SAVE OFFLINE RECORD ----------------------
    async saveOffline(url, data) {
      if (url.includes("form")) {
        data = this.cleanFormData(data);
        data.id = this.randomUUID();
        data.local_date = this.getCurrentDate();
        let existingFormRecord = await this.getOffline(url);
        if (existingFormRecord) {
          existingFormRecord.unshift(data);
          await localforage.setItem(url, existingFormRecord);
        } else {
          await localforage.setItem(url, [data]);
        }
      } else {
        localforage.setItem(url, data);
      }
    },

    // ------------------- UPDATED OFFLINE RECORD ------------------
    async updateOffline(key, idToUpdate, reqData) {
      var that = this;
      await localforage.getItem(key).then((storedArray) => {
        for (let i = 0; i < storedArray.length; i++) {
          if (storedArray[i].id == idToUpdate) {
            let data = that.cleanFormData(reqData);
            storedArray[i] = data;
            localforage.setItem(key, storedArray);
          }
        }
      });
    },
    // ------------------Clear offline all offline data---------
    async clearAllOfflineData() {
      localforage.clear();
    },
    // ------------------ DELETE OFFLINE RECORD---------------------
    async delOffline(key, idToRemove) {
      await localforage
        .getItem(key)
        .then((storedObject) => {
          if (
            storedObject &&
            storedObject?.data &&
            Array.isArray(storedObject.data)
          ) {
            storedObject.data = storedObject.data.filter(
              (item) => item.id !== idToRemove
            );
            if (storedObject.data.length <= 0) {
              localforage.removeItem(key);
            } else {
              localforage.setItem(key, storedObject);
            }
          } else if (Array.isArray(storedObject)) {
            storedObject = storedObject.filter(
              (item) => item.id !== idToRemove
            );
            localforage.setItem(key, storedObject);
          } else if (!Array.isArray(storedObject)) {
            localforage.removeItem(key);
          } else {
            this.alert("Delete!", "No valid data found", "error");
          }
        })
        .catch((err) => {
          console.error("Error retrieving data from local storage: ", err);
        });
    },

    // ----------------OFFLINE REQUEST HANDLER-----------------------
    async offlineRequestHandler(method, url, reqData) {
      if (method == "get") {
        const res = await this.getOffline(`${method}/${url}`);
        return res;
      } else if (method == "post") {
        if (url.includes("login")) {
          this.alert("Login Error!", "You are offline", "error");
          return { status: false };
        }
        const saveUrl = `form/${method}/${url}`;
        await this.saveOffline(saveUrl, reqData);
        this.offlineRecords = await this.getOffline(saveUrl);
        return { code: 200, status: "Saved" };
      } else if (method == "put") {
        const urlArray = url.split("/");
        const idToUpdate = urlArray[urlArray.length - 1];
        const valUrl = "form/post/" + urlArray[0];
        await this.updateOffline(valUrl, idToUpdate, reqData);
        this.offlineRecords = await this.getOffline(valUrl);
        return { code: 200, status: "Updated" };
      } else if (method == "delete") {
        const urlArray = url.split("/");
        const idToDelete = urlArray[urlArray.length - 1];
        const valUrl = "form/post/" + urlArray[0];
        await this.delOffline(valUrl, idToDelete);
        this.offlineRecords = await this.getOffline(valUrl);
        // return { code: 200, status: "Deleted" };
      }
      return {};
    },

    // --------------------- UPLOAD OFFLINE RECORDS -----------------------
    async uploadOfflineRecords(name) {
      const data = await this.getOffline(`form/post/${name}`);
    },

    // ------------------- HANDLE ALL REQUESTS-------------------------------

    async req(method, url, reqData = {}) {
      if (!this.isOnline) {
        const res = await this.offlineRequestHandler(method, url, reqData);
        return res;
      }
      // console.log(this.authUser);
      if (this.authUser) {
        let token = `Bearer ${this.authUser.token}`;
        axios.defaults.headers.common["Authorization"] = token;
      }
      try {
        const res = await axios.request({
          method: method,
          url: url,
          data: reqData,
        });

        if (method == "get") {
          let saveUrl = "get/" + url;
          this.saveOffline(saveUrl, res.data);
        }
        return res.data;
      } catch (error) {
        var that = this;
        if (error.message == "Network Error") {
          const res = await that.offlineRequestHandler(method, url, reqData);
          return res;
        }

        this.loading(false);
        return error.response.data;
      }
    },

    // ----------------GET RECORD HANDLER---------------------------

    async getRecord(name) {
      if (this.queryParams) {
        name = name + "?" + this.queryParams;
      }

      const res = await this.req("get", name);
      const title = this.capitalizeFirstLetter(name);
      // console.log("from getRecords ", res);
      if (this.isOnline) {
        if (res?.code === 200) {
          this.records = res;
        } else {
          this.alert(title, res.status, "warning");
        }
      } else {
        this.records = res;
      }

      this.queryParams = null;
    },

    // ---------------------UPLOAD RECORD-------------------------------
    async uploadRecords(url) {
      // this.loading();
      const upload_endpoint = "form/post/" + url;
      const recs = await this.getOffline(upload_endpoint);
      let token = `Bearer ${this.authUser.token}`;
      axios.defaults.headers.common["Authorization"] = token;
      const totalRecs = recs.length;
      for (let i = 0; i < totalRecs; i++) {
        let rec = recs[i];
        const res = await axios.request({
          method: "POST",
          url: upload_endpoint,
          data: rec,
        });
        if (res?.data?.code == 200) {
          await this.delOffline(upload_endpoint, rec.id);
          this.uploadProgress = Math.round(((i + 1) / totalRecs) * 100);
        } else {
          this.alert(url, "Erro uploading data", "error");
        }

        this.offlineRecords = await this.getOffline(upload_endpoint);
        this.records = await this.req("get", url);
      }
    },
    // ---------------------AUTH USER SET-------------------------------

    async setAuthUser() {
      if (this.authUser === null) {
        this.authUser = await localforage.getItem("authUser");
      }
    },

    // ---------------------ACTIVE MENU GET----------------------------
    activeMenu(name) {
      if (this.cPage.includes(name)) {
        return "active";
      }
      return "";
    },

    // ----------------------ACTIVE LINK GET -----------------------------
    activeLink(name) {
      if (this.cPage == name) {
        return "active";
      }
      return "";
    },

    // ---------------------ALERT USER WITH MSG--------------------------
    alert(title, msg, icon = "success") {
      Swal.fire({
        title: title,
        text: msg,
        icon: icon,
        showConfirmButton: false,
        timer: 4000,
        // confirmButtonText: "Cool",
      });
    },

    // ---------------------CONFIRM ALERT----------------------------
    confirm() {
      return Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        reverseButtons: false,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, confirm!",
      });
    },

    // -------------- PERMISSION-------------
    can(perm) {
      if (this.authUser.permissions.includes(perm)) {
        return true;
      } else {
        return false;
      }
    },

    // --------- FORM ACTIONS --------------------
    resetForm() {
      const that = this;
      Object.keys(that.formData).forEach((key) => {
        that.formData[key] = "";
      });
    },

    allowAction(type) {
      if (
        (type != "local" && this.isOnline) ||
        (type == "local" && !this.isOnline)
      ) {
        return true;
      } else {
        return false;
      }
    },

    validateForm(requiredFields) {
      if (this.formData?.company_id === "") {
        this.formData.company_id = this.cCompany.id;
      }
      for (let i = 0; i < requiredFields.length; i++) {
        let field = requiredFields[i];
        const d = this.formData[field];
        if (d == "" || d == null || d == undefined || d == [] || d == {}) {
          let title;
          if (field.includes("_")) {
            let splitTitle = field.split("_");
            if (splitTitle[1] == "id") {
              title = this.capitalizeFirstLetter(splitTitle[0]);
            } else {
              title =
                this.capitalizeFirstLetter(splitTitle[0]) + " " + splitTitle[1];
            }
          } else {
            title = this.capitalizeFirstLetter(field);
          }
          let msg = title + " is required";
          this.alert("Form Error!", msg, "error");
          return false;
        }
      }
      return true;
    },

    async createRecord(name) {
      this.loading();

      if (!this.formData?.user_id) {
        this.formData.user_id = this.authUser.id;
      }

      const res = await this.req("post", name, this.formData);
      const title = this.capitalizeFirstLetter(name);
      if (res?.code === 200) {
        await this.getRecord(name);
        this.loading(false);
        this.alert(title, "Created Success");
      } else if (res?.code == 401 || res?.code == 500) {
        this.loading(false);
        this.alert(title, res.status, "warning");
      } else if (res?.errors) {
        this.loading(false);
        this.alert(title, res.message, "warning");
      } else if (!this.isOnline) {
        this.loading(false);
        this.alert(title, "Created Success");
      }
      return res;
    },

    editRecord(name, rec) {
      // check and set a foreign key id
      Object.keys(rec).forEach((key) => {
        // checks if value is an object
        if (typeof rec[key] == "object") {
          // checks if the object has `id`
          if (rec[key]?.id) {
            // create a new field name with the value of key
            const key_id = key + "_id";
            // set newly created field value to the id value of the object
            rec[key_id] = rec[key].id;
          }
        }
      });

      this.editing = rec;
      this.formData = rec;
      this.cPage = name;
    },

    editInventory(name, rec) {
      // console.log(rec);
    },

    editProductionOrder(name, rec) {
      if (!rec?.company_id) {
        rec.company_id = rec.company.id;

        for (let i = 0; i < rec.produced.length; i++) {
          rec.produced[i]["item_id"] = rec.produced[i].item.id;
          rec.produced[i]["company_id"] = rec.produced[i].company.id;
        }

        for (let i = 0; i < rec.used.length; i++) {
          rec.used[i]["item_id"] = rec.used[i].item.id;
          rec.used[i]["company_id"] = rec.used[i].company.id;
        }
      }

      this.formData = rec;
      // console.log("form-data", this.formData);
      this.editing = rec;
      this.formData = rec;
      this.cPage = name;
    },
    // ---------------------EDIT SALES ORDER -------------------
    editSaleOrder(name, rec) {
      this.formData.name = rec?.customer?.name;
      this.formData.phone = rec?.customer?.phone;
      this.formData.customer_id = rec.customer_id;
      this.formData.company_id = rec.company_id;
      this.formData.ware_house_id = rec?.items[0]?.ware_house_id;
      this.formData.order_date = rec.order_date;
      this.formData.vehicle_no = rec.vehicle_no;
      this.formData.items = [];
      this.formData.tp = rec.tp;

      for (let i = 0; i < this.items.data.length; i++) {
        const item = this.items.data[i];
        if (item.type == "Finished Product") {
          // console.log("item: ", item, "EditedItems: ", rec.items);
          // console.log('editedItem: ', )
          const itemToEdit = rec.items.find(
            (itemEd) => itemEd.item_id == item.id
          );

          if (itemToEdit) {
            this.formData.items.push(itemToEdit);
          } else {
            this.formData.items.push({
              item_id: item.id,
              bundle_removed: 0,
              price: item.bundle_price,
            });
          }
        }
      }

      this.editing = rec;
      // this.formData = rec;
      this.cPage = name;
    },

    // ----------------- filter warehouses----------
    filter_warehouses(type = "material") {
      if (!this.warehouses?.data || !this.cCompany?.id) return [];
      return this.warehouses.data.filter((w) => {
        const name = w.name?.toLowerCase() || "";
        if (type === "material") {
          return (
            w.company.id === this.cCompany.id &&
            (name.includes(type) ||
              name.includes("store") ||
              name.includes("feeder"))
          );
        }
        return w.company.id === this.cCompany.id && name.includes(type);
      });
    },

    filter_warehouses_by_company() {
      if (!this.warehouses?.data || !this.cCompany?.id) return [];
      return this.warehouses.data.filter((w) => {
        return w.company.id === this.cCompany.id;
      });
    },

    filter_companies() {
      if (!this.companies?.data || !this.cCompany?.id) return [];
      return this.companies.data.filter((c) => {
        return c.id === this.cCompany.id;
      });
    },

    // -------------------------UPDATE RECORD----------------------
    async updateRecord(name) {
      this.loading();
      this.formData.user_id = this.authUser.id;

      let title = this.capitalizeFirstLetter(name);
      let res = await this.req(
        "put",
        `${name}/${this.editing.id}`,
        this.formData
      );

      if (res?.code === 200) {
        await this.getRecord(name);
        this.loading(false);
        this.alert(title, "Update Success");

        this.cPage = name + "-list";
      } else if (res?.code == 401 || res?.code == 500) {
        this.loading(false);
        this.alert(title, res.status, "warning");
      } else if (res?.errors) {
        this.formErrors = res.errors;
        this.loading(false);
        this.alert(title, res.message, "warning");
      }

      this.editing = false;
      return res;
    },

    async delRecord(name, rec) {
      var that = this;
      if (!this.queryParams) {
        this.queryParams = `col=company_id&colId=${this.cCompany.id}`;
      }
      await this.confirm().then(async (result) => {
        if (result.isConfirmed) {
          that.loading();
          await that.offlineCheck();
          const res = await this.req("delete", `${name}/${rec.id}`);
          if (res?.code == 200) {
            await this.getRecord(name);
            this.loading(false);
            this.alert("Deleted!", "Record", "warning");
          } else {
            this.loading(false);
            this.alert("Deleted!", res?.status, "warning");
          }
        }
      });
    },

    async logout() {
      try {
        await this.req("post", "auth/logout");
      } catch (error) {}
      // const logoutReq =
      // if (logoutReq.code == 200) {
      //   await localforage.removeItem("authUser");
      //   await this.clearOfflineCheckInterval();
      //   await this.router.push("/");
      //   window.location.reload();
      // }
      this.isLoggedIn = false;
      await localforage.removeItem("authUser");
      await this.clearOfflineCheckInterval();
      await this.router.push("/");
      window.location.reload();
    },

    onNumInputFocus(event) {
      if (event.target.value == 0) {
        event.target.value = "";
      }
    },

    onNumInputFocusOut(event) {
      if (event.target.value == "" || event.target.value <= 0) {
        event.target.value = 0;
      }
    },
  },
});
