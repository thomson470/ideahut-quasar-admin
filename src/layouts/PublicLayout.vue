<template>
    <q-layout view="hHh lpR fFf" class="background-layout">
        <q-header class="header-main">
            <q-toolbar>
                <q-btn
                    flat
                    no-caps
                    no-wrap
                    :label="util.appName()"
                    :size="$q.screen.gt.sm ? 'xl' : 'lg'"
                    :class="'q-pa-xs text-weight-bold ' + ($q.screen.gt.sm ? 'q-ml-md' : 'q-ml-xs')"
                    @click="on_header_menu_click()"
                >
                </q-btn>
                <q-space />
                <q-btn
                    round
                    :icon="uix.dark.active() ? 'light_mode' : 'dark_mode'"
                    :size="$q.screen.gt.sm ? 'md' : 'sm'"
                    @click="uix.dark.toggle()"
                >
                    <q-tooltip>{{uix.dark.active() ? $t("label.light") : $t("label.dark")}}</q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page>
                <router-view />
            </q-page>
        </q-page-container>
    </q-layout>
</template>
  
<script>
import { ref } from "vue";
import { util } from "src/scripts/util";
import { api } from "src/scripts/api";
import { uix } from "src/scripts/uix";
import { storage } from "src/scripts/storage";

export default {
    setup() {
        return {
            util,
            api,
            uix,
        };
    },
    created() {
        
    },
    methods: {
        /*
         * HEADER MENU
         */
        on_header_menu_click() {
            window.location.href = util.publicPath() + "/";
        },
    },
};
</script>
  