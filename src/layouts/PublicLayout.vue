<template>
  <q-layout view="hHh lpR fFf" class="background-layout">
    <q-header
      class="header-main"
      :style="
        (APP?.color?.header ? 'background: ' + APP.color.header + ' !important;' : '') +
        (APP?.color?.title ? 'color: ' + APP.color.title + ' !important;' : '')
      "
    >
      <q-toolbar>
        <q-btn
          flat
          no-caps
          no-wrap
          :label="APP.title"
          :size="$q.screen.gt.sm ? 'xl' : 'lg'"
          :class="'q-pa-xs text-weight-bold ' + ($q.screen.gt.sm ? 'q-ml-md' : 'q-ml-xs')"
          @click="on_header_menu_click()"
        >
        </q-btn>
        <q-space />
        <q-btn
          round
          :icon="is_dark_mode ? 'light_mode' : 'dark_mode'"
          :size="$q.screen.gt.sm ? 'md' : 'sm'"
          @click="on_dark_click"
        >
          <q-tooltip>{{ is_dark_mode ? $t('label.light') : $t('label.dark') }}</q-tooltip>
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
import { ref } from 'vue'
import { APP } from 'src/scripts/static'
import { util } from 'src/scripts/util'
import { api } from 'src/scripts/api'
import { uix } from 'src/scripts/uix'
let self

export default {
  setup() {
    return {
      APP,
      util,
      api,
      uix,
      is_dark_mode: ref(false),
    }
  },
  created() {
    self = this
    self.is_dark_mode = uix.dark.active()
  },
  methods: {
    /*
     * HEADER MENU
     */
    on_header_menu_click() {
      window.location.href = util.webPath() + '/'
    },

    /*
     * DARK CLICK
     */
    on_dark_click() {
      uix.dark.toggle()
      this.is_dark_mode = uix.dark.active()
    },
  },
}
</script>
