<template>
    <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { util } from "src/scripts/util";
import { storage } from "src/scripts/storage";

export default defineComponent({
    name: "App",
    created() {
        let self = this;
        let menu = storage.menu();
        if (window.location.pathname === util.publicPath() + "/index.html") {
            let qp = Object.fromEntries([...new URLSearchParams(window.location.href.split('?')[1])]);
            let next = util.isString(qp._next_) ? qp._next_ : "";
            if ("" !== next) {
                next = atob(next);
            }
            if (!(menu.active?.link && next === menu.active.link)) {
                delete menu.active;
                storage.menu(menu);
            }
            self.$router.push({ path: next, query: Object.fromEntries([...new URLSearchParams(next.split('?')[1])]) });
        } else {
            delete menu.active;
            storage.menu(menu);
            self.$router.push({ path: "/"});
        }
    },
});
</script>
  