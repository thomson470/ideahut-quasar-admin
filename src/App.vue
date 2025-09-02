<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { util } from "src/scripts/util";
import { api } from "src/scripts/api";
import { storage } from "src/scripts/storage";
let self;

export default defineComponent({
  name: "App",
  created() {
    self = this;
    let menu = storage.menu();
    if (window.location.pathname === util.webPath() + "/index.html") {
      let qp = Object.fromEntries([
        ...new URLSearchParams(window.location.href.split("?")[1]),
      ]);
      let next = util.isString(qp._next_) ? qp._next_ : "";
      if ("" !== next) {
        next = atob(next);
      }
      if (!(menu.active?.link && next === menu.active.link)) {
        delete menu.active;
        delete menu.next;
        storage.menu(menu);
      }
      let auth = util.isString(qp._auth_) ? qp._auth_ : "";
      if ("" !== auth) {
        let cauth = storage.auth();
        let ctoken = cauth.token;
        cauth.token = auth;
        storage.auth(cauth);
        api.call({
          path: "/info",
          onSuccess() {
            let dauth = storage.auth();
            dauth.logout = true;
            storage.auth(dauth);
            window.location.href = util.webPath() + "/index.html";
          },
          onError() {
            let dauth = storage.auth();
            dauth.token = ctoken;
            storage.auth(dauth);
            self.$router.push({ path: "/" });
          },
          notify: false,
        });
      } else if ("" !== next) {
        menu.next = next;
        storage.menu(menu);
        self.$router.push({
          path: next,
          query: Object.fromEntries([
            ...new URLSearchParams(next.split("?")[1]),
          ]),
        });
      } else {
        self.$router.push({ path: "/" });
      }
    } else {
      delete menu.active;
      delete menu.next;
      storage.menu(menu);
      self.$router.push({ path: "/" });
    }
  },
});
</script>
