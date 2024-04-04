<template>
    <q-layout view="hHh lpR fFf" class="background-layout">
        <q-header class="header-main">
            <q-toolbar>
                <q-btn
                    round
                    :size="$q.screen.gt.sm ? 'md' : 'sm'"
                    :aria-label="$t('label.menu')"
                    icon="menu"
                    @click="on_toggle_menu"
                >
                    <q-tooltip>{{ $t("label.menu") }}</q-tooltip>
                </q-btn>
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
                <q-btn
                    v-if="is_logged_in"
                    round
                    icon="logout"
                    class="q-ml-sm"
                    :size="$q.screen.gt.sm ? 'md' : 'sm'"
                    :loading="is_logout_progress"
                    @click="on_logout_click()"
                >
                    <q-tooltip>{{ $t("label.logout") }}</q-tooltip>
                </q-btn>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="is_show_menu"
            bordered
            elevated
            :width="300"
            :breakpoint="400"
            class="background-drawer"
        >
            <q-scroll-area :class="'fit q-pt-sm'">
                <q-list>
                    <template v-for="(menu, index) in menus" :key="index">
                        <q-separator v-if="menu.separator" />
                        <q-expansion-item
                            v-else-if="menu.children?.length"
                            :default-opened="(active_menu.parent && menu.id === active_menu.parent.id) || (active_menu.parent?.parent && menu.id === active_menu.parent.parent.id)"
                        >
                            <template v-slot:header>
                                <q-item-section avatar style="min-width: 0px !important;">
                                    <q-icon :name="menu.icon" />
                                </q-item-section>
                                <q-item-section>
                                    {{ menu.title }}
                                </q-item-section>
                            </template>
                            <div v-for="child in menu.children" :key="child.id" class="drawer-child">
                                <q-separator v-if="child.separator" />
                                <q-expansion-item 
                                    v-else-if="child.children?.length"
                                    :default-opened="active_menu.parent && child.id === active_menu.parent.id"
                                >
                                    <template v-slot:header>
                                        <q-item-section avatar style="min-width: 0px !important; padding-left: 24px;">
                                            <q-icon :name="child.icon" />
                                        </q-item-section>
                                        <q-item-section>
                                            {{ child.title }}
                                        </q-item-section>
                                    </template>
                                    <div v-for="grand in child.children" :key="grand.id">
                                        <q-separator v-if="grand.separator" />
                                        <q-item
                                            v-else
                                            v-ripple
                                            clickable
                                            @click="on_menu_click(grand)"
                                        >
                                            <q-item-section avatar style="min-width: 0px !important; padding-left: 48px;">
                                                <q-icon :name="grand.icon" />
                                            </q-item-section>
                                            <q-item-section :class="active_menu.id === grand.id ? 'text-weight-bold' : ''">
                                                {{ grand.title }}
                                            </q-item-section>
                                        </q-item>
                                    </div>
                                </q-expansion-item>
                                <q-item 
                                    v-else 
                                    v-ripple 
                                    clickable 
                                    @click="on_menu_click(child)"
                                >
                                    <q-item-section avatar style="min-width: 0px !important; padding-left: 24px;">
                                        <q-icon :name="child.icon" />
                                    </q-item-section>
                                    <q-item-section :class="active_menu.id === child.id ? 'text-weight-bold' : ''">
                                        {{ child.title }}
                                    </q-item-section>
                                </q-item>
                            </div>
                        </q-expansion-item>
                        <q-item v-else v-ripple clickable @click="on_menu_click(menu)">
                            <q-item-section
                                avatar
                                style="
                                margin: 0px !important;
                                padding: 0px !important;
                                min-width: 0px !important;
                                "
                            >
                                <q-icon :name="menu.icon" />
                            </q-item-section>
                            <q-item-section
                                :class="
                                'q-pl-md' +
                                (active_menu.id === menu.id ? ' text-weight-bold' : '')
                                "
                            >
                                {{ menu.title }}
                            </q-item-section>
                        </q-item>
                    </template>
                </q-list>
            </q-scroll-area>
        </q-drawer>

        <q-page-container>
            <q-page>
                <q-item
                    v-if="active_menu?.title"
                    class="q-pa-sm q-pl-md q-pb-md text-h5"
                >
                    <q-item-section v-if="active_menu.icon" avatar style="min-width: 0px !important;">
                        <q-icon :name="active_menu.icon" />
                    </q-item-section>
                    <q-item-section>
                        {{ active_menu.title }}
                    </q-item-section>
                </q-item>
                <router-view />
                <q-page-scroller
                    position="bottom-right"
                    :scroll-offset="120"
                    :offset="[12, 12]"
                >
                <q-btn
                    round
                    glossy
                    size="sm"
                    icon="keyboard_arrow_up"
                    color="primary"
                />
                </q-page-scroller>
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
            is_logged_in: ref(false),
            is_logout_progress: ref(false),
            is_show_menu: ref(false),
            active_menu: ref({ id: {} }),
            menus: ref([]),
        };
    },
    created() {
        let self = this;
        let auth = storage.auth();
        self.is_logged_in = util.isString(auth.token) && "" !== auth.token && true === auth.logout;
        api.call({
            path: "/menus",
            onSuccess(menus) {
                menus = util.isArray(menus) ? menus : [];
                self.menus = [
                    {
                        id: "home",
                        title: "Home",
                        link: "/",
                        icon: "home",
                    }
                ];
                self.menus.push({ separator: true });
                for (const menu of menus) {
                    if (menu.children?.length) {
                        menu.icon = util.isString(menu.icon) && "" !== menu.icon ? menu.icon : "dashboard";
                        for (const child of menu.children) {
                            if (child.children?.length) {
                                child.icon = util.isString(child.icon) && "" !== child.icon ? child.icon : "category";
                                for (const grand of child.children) {
                                    grand.icon = util.isString(grand.icon) && "" !== grand.icon ? grand.icon : "stream";
                                } 
                            } else {
                                child.icon = util.isString(child.icon) && "" !== child.icon ? child.icon : "blur_on";
                            }
                        }
                    } else {
                        menu.icon = util.isString(menu.icon) && "" !== menu.icon ? menu.icon : "extension";
                    }
                    self.menus.push(menu);
                    self.menus.push({ separator: true });
                }
                let menu = storage.menu();
                self.active_menu = util.isObject(menu.active) ? menu.active : { id: {} };
                self.is_show_menu = true === menu.show;
            },
        });
    },
    methods: {

        /*
         * TOGGLE MENU
         */
        on_toggle_menu: function () {
            let self = this;
            self.is_show_menu = !self.is_show_menu;
            let menu = storage.menu();
            menu.show = self.is_show_menu;
            storage.menu(menu);
        },

        /*
         * HEADER MENU
         */
        on_header_menu_click() {
            let self = this;
            self.active_menu = { id: {} };
            let cmenu = storage.menu();
            delete cmenu.active;
            storage.menu(cmenu);
            window.location.href = util.publicPath() + "/";
        },
  
        /*
         * MENU CLICK
         */
        on_menu_click(menu) {
            let self = this;
            if (util.isString(menu.link) && "" !== menu.link) {
                if (menu.noPushRoute) {
                    self.active_menu = { id: {} };
                    let cmenu = storage.menu();
                    delete cmenu.active;
                    storage.menu(cmenu);
                    window.location.href = util.publicPath() + menu.link;
                } else {
                    self.active_menu = menu;
                    let cmenu = storage.menu();
                    cmenu.active = menu;
                    storage.menu(cmenu);
                    self.$router.push({ path: menu.link, query: Object.fromEntries([...new URLSearchParams(menu.link.split('?')[1])]) });
                }
            }
        },

        /*
         * LOGOUT
         */
        on_logout_click() {
            let self = this;
            uix.confirm(function() {
                self.is_logout_progress = true;
                let auth = storage.auth();
                if (true === auth.persistent) {
                    storage.auth(null);
                    window.location.href = util.publicPath();
                    self.is_logout_progress = false;
                } else {
                    api.send({
                        path: "/logout",
                        method: "post",
                        onFinish() {
                            self.is_logout_progress = false;
                        },
                        onSuccess() {
                            storage.auth(null);
                            window.location.href = util.publicPath();
                        },
                    });
                }
            }, "confirm.logout");
        },
        
    },
};
</script>
  