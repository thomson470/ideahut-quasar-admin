<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="row q-mt-none q-pa-sm">
    <div class="col-md-6 col-xs-12 q-pa-xs q-mb-sm">
      <q-table
        v-if="application?.length"
        class="table-sticky-header no-column property"
        style="max-height: 27vh"
        :title="$t('label.application')"
        :rows="application"
        :separator="'cell'"
        :rows-per-page-options="[0]"
        hide-bottom
        hide-header
        bordered
        dense
      >
        <template v-slot:top-right>
          <q-btn
            v-if="sysprops"
            round
            glossy
            dense
            size="sm"
            icon="display_settings"
            class="q-mr-sm"
            @click="on_keyvalue_show($t('label.system'), sysprops, true)"
          >
            <q-tooltip>{{ $t("label.system") }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            glossy
            dense
            size="sm"
            icon="lightbulb"
            @click="on_keyvalue_show($t('label.application'), application)"
          >
            <q-tooltip>{{ $t("label.view") }}</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </div>
    <div class="col-md-6 col-xs-12 q-pa-xs q-mb-sm">
      <q-table
        v-if="version?.length"
        class="table-sticky-header no-column"
        style="max-height: 27vh"
        :title="$t('label.version')"
        :rows="version"
        :separator="'cell'"
        :rows-per-page-options="[0]"
        hide-bottom
        hide-header
        bordered
        dense
      >
        <template v-slot:top-right>
          <q-btn
            v-if="envprops"
            round
            glossy
            dense
            size="sm"
            icon="display_settings"
            class="q-mr-sm"
            @click="on_keyvalue_show($t('label.environment'), envprops, true)"
          >
            <q-tooltip>{{ $t("label.environment") }}</q-tooltip>
          </q-btn>
          <q-btn
            round
            glossy
            dense
            size="sm"
            icon="lightbulb"
            @click="on_keyvalue_show($t('label.version'), version)"
          >
            <q-tooltip>{{ $t("label.view") }}</q-tooltip>
          </q-btn>
        </template>
      </q-table>
    </div>
    <div class="col-md-12 col-xs-12 q-pa-xs q-mb-sm">
      <q-table
        class="table-sticky-header"
        :title="$t('label.bean')"
        :rows="bean.rows"
        :columns="bean.columns"
        :visible-columns="bean.visibles"
        :loading="bean.loading"
        :selection="'single'"
        :dense="$q.screen.lt.md"
        :no-data-label="$t('error.data_not_available')"
        rows-per-page-label=" "
        :rows-per-page-options="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
        binary-state-sort
        :separator="'cell'"
        v-model:pagination="bean.pagination"
        @request="get_beans"
        bordered
      >
        <template v-slot:top-right>
          <q-btn
            glossy
            round
            dense
            class="q-ma-none q-ml-md"
            color="deep-orange"
            icon="search"
            @click="on_bean_search_click"
          >
            <q-badge
              v-if="Object.keys(bean.filters).length"
              class="led-green"
              floating
            ></q-badge>
            <q-tooltip>{{ $t("label.search") }}</q-tooltip>
          </q-btn>
          <q-btn
            glossy
            round
            dense
            class="q-ma-none q-ml-md"
            color="indigo"
            icon="refresh"
            :loading="bean.loading"
            @click="on_bean_refresh_click"
          >
            <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
          </q-btn>
        </template>

        <template v-slot:no-data="{ message }">
          <div class="full-width row flex-center text-accent q-gutter-sm">
            <q-icon size="2em" name="block" />
            <span class="text-subtitle2">{{ message }}</span>
          </div>
        </template>

        <template v-slot:body-selection="scope">
          <q-btn
            glossy
            round
            dense
            size="sm"
            class="q-ma-none q-ml-xs q-mr-sm"
            color="deep-purple"
            icon="visibility"
          >
            <q-tooltip>{{ $t("label.view") }}</q-tooltip>
            <q-popup-proxy
              transition-show="scale"
              transition-hide="scale"
              @before-show="bean.popup = scope.row"
              :style="'width: 400px;'"
            >
              <q-card>
                <q-card-section
                  style="max-height: 600px"
                  class="q-pa-xs q-mt-none scroll"
                >
                  <q-input
                    v-if="bean.visibles.includes('beanName')"
                    type="text"
                    :label="$t('label.bean_name')"
                    class="q-mb-xs"
                    v-model="bean.popup.beanName"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                  <q-input
                    v-if="bean.visibles.includes('isProxy')"
                    type="text"
                    :label="$t('label.proxy')"
                    class="q-mb-xs"
                    v-model="bean.popup.isProxy"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                  <q-input
                    v-if="bean.visibles.includes('isReloadable')"
                    type="text"
                    :label="$t('label.reloadable')"
                    class="q-mb-xs"
                    v-model="bean.popup.isReloadable"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                  <q-input
                    v-if="bean.visibles.includes('isReconfigure')"
                    type="text"
                    :label="$t('label.reconfigure')"
                    class="q-mb-xs"
                    v-model="bean.popup.isReconfigure"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                  <q-input
                    v-if="bean.visibles.includes('className')"
                    type="text"
                    :label="$t('label.class_name')"
                    class="q-mb-xs"
                    v-model="bean.popup.className"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                  <q-input
                    v-if="bean.visibles.includes('scope')"
                    type="text"
                    :label="$t('label.scope')"
                    class="q-mb-xs"
                    v-model="bean.popup.scope"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                  <q-input
                    v-if="bean.visibles.includes('qualifiers')"
                    type="text"
                    :label="$t('label.qualifiers')"
                    class="q-mb-xs"
                    v-model="bean.popup.qualifiers"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                  <q-input
                    v-if="bean.visibles.includes('types')"
                    type="text"
                    :label="$t('label.types')"
                    class="q-mb-xs"
                    v-model="bean.popup.types"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                  <q-input
                    v-if="bean.visibles.includes('stereotypes')"
                    type="text"
                    :label="$t('label.stereotypes')"
                    class="q-mb-xs"
                    v-model="bean.popup.stereotypes"
                    readonly
                    filled
                    dense
                    autogrow
                  />
                </q-card-section>
              </q-card>
            </q-popup-proxy>
          </q-btn>
        </template>
      </q-table>
    </div>
  </div>

  <q-dialog
    v-model="bean.search.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
    persistent
  >
    <q-card
      :style="
        'width: ' + ($q.screen.lt.md ? '100%;' : '50%;') + bean.search.style
      "
    >
      <q-card-section
        class="q-pa-none header-main"
        :style="
          APP?.color?.header
            ? 'background: ' + APP.color.header + ' !important;'
            : ''
        "
        v-touch-pan.mouse="bean.search.onDrag"
      >
        <q-item class="q-pr-none">
          <q-item-section>
            <q-item-label class="text-h6 text-white">{{
              $t("label.search")
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              class="text-caption text-white q-pl-xs q-pr-xs q-mr-xs"
              flat
              round
              glossy
              icon="close"
              v-close-popup
            >
              <q-tooltip>{{ $t("label.close") }}</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section style="max-height: 70vh" class="q-pa-xs q-mt-xs scroll">
        <q-form
          v-if="bean.visibles.includes('beanName')"
          @submit="on_bean_filter_click"
          @reset="on_bean_reset_click"
        >
          <q-input
            v-model="bean.filters.beanName"
            type="text"
            :label="$t('label.bean_name')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form
          v-if="bean.visibles.includes('className')"
          @submit="on_bean_filter_click"
          @reset="on_bean_reset_click"
        >
          <q-input
            v-model="bean.filters.className"
            type="text"
            :label="$t('label.class_name')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form
          v-if="bean.visibles.includes('scope')"
          @submit="on_bean_filter_click"
          @reset="on_bean_reset_click"
        >
          <q-input
            v-model="bean.filters.scope"
            type="text"
            :label="$t('label.scope')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form
          v-if="bean.visibles.includes('qualifiers')"
          @submit="on_bean_filter_click"
          @reset="on_bean_reset_click"
        >
          <q-input
            v-model="bean.filters.qualifiers"
            type="text"
            :label="$t('label.qualifiers')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form
          v-if="bean.visibles.includes('types')"
          @submit="on_bean_filter_click"
          @reset="on_bean_reset_click"
        >
          <q-input
            v-model="bean.filters.types"
            type="text"
            :label="$t('label.types')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form
          v-if="bean.visibles.includes('stereotypes')"
          @submit="on_bean_filter_click"
          @reset="on_bean_reset_click"
        >
          <q-input
            v-model="bean.filters.stereotypes"
            type="text"
            :label="$t('label.stereotypes')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-select
          v-if="bean.visibles.includes('isProxy')"
          v-model="bean.filters.isProxy"
          :label="$t('label.proxy')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
        <q-select
          v-if="bean.visibles.includes('isReloadable')"
          v-model="bean.filters.isReloadable"
          :label="$t('label.reloadable')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
        <q-select
          v-if="bean.visibles.includes('isReconfigure')"
          v-model="bean.filters.isReconfigure"
          :label="$t('label.reconfigure')"
          :options="option.boolean"
          filled
          class="q-mb-xs"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions class="row">
        <div class="col-6 q-pr-xs text-left">
          <q-btn
            :label="$t('label.reset')"
            color="orange"
            no-caps
            glossy
            @click="on_bean_reset_click"
          />
        </div>
        <div class="col-6 q-pl-xs text-right">
          <q-btn
            :label="$t('label.filter')"
            color="purple"
            no-caps
            glossy
            @click="on_bean_filter_click"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="dialog.keyvalue.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <KeyValue
      :parameters="dialog.keyvalue.parameters"
      :style="dialog.keyvalue.style"
      v-touch-pan.mouse="dialog.keyvalue.onDrag"
    />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { APP } from "src/scripts/static";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
let self;

export default {
  components: {
    KeyValue: defineAsyncComponent(() => import("src/pages/KeyValue.vue")),
  },
  setup() {
    return {
      APP,
      util,
      sysprops: ref([]),
      envprops: ref([]),
      application: ref([]),
      version: ref([]),
      bean: ref({
        rows: [],
        filters: {},
        columns: [],
        visibles: [],
        loading: false,
        pagination: {
          page: 1,
          rowsPerPage: 20,
          sortBy: "beanName",
          descending: false,
        },
        search: uix.dialog.init(() => self.bean.search),
      }),
      option: ref({
        boolean: ["", "true", "false"],
      }),
      dialog: ref({
        keyvalue: uix.dialog.init(() => self.dialog.keyvalue),
      }),
    };
  },

  created() {
    self = this;
    self.bean.columns = [
      {
        name: "beanName",
        label: self.$t("label.bean_name"),
        field: "beanName",
        align: "left",
        sortable: true,
      },
      {
        name: "isProxy",
        label: self.$t("label.proxy"),
        field: "isProxy",
        align: "left",
        sortable: true,
      },
      {
        name: "isReloadable",
        label: self.$t("label.reloadable"),
        field: "isReloadable",
        align: "left",
        sortable: true,
      },
      {
        name: "isReconfigure",
        label: self.$t("label.reconfigure"),
        field: "isReconfigure",
        align: "left",
        sortable: true,
      },
      {
        name: "className",
        label: self.$t("label.class_name"),
        field: "className",
        align: "left",
        sortable: true,
      },
      {
        name: "scope",
        label: self.$t("label.scope"),
        field: "scope",
        align: "left",
        sortable: true,
      },
      {
        name: "qualifiers",
        label: self.$t("label.qualifiers"),
        field: "qualifiers",
        align: "left",
        sortable: true,
        format: function (val) {
          return val ? val.join(", ") : "";
        },
      },
      {
        name: "types",
        label: self.$t("label.types"),
        field: "types",
        align: "left",
        sortable: true,
        format: function (val) {
          return val ? val.join(", ") : "";
        },
      },
      {
        name: "stereotypes",
        label: self.$t("label.stereotypes"),
        field: "stereotypes",
        align: "left",
        sortable: true,
        format: function (val) {
          return val ? val.join(", ") : "";
        },
      },
    ];
    self.get_info();
    self.get_vars();
    self.get_beans();
  },
  methods: {
    /*
     * GET INFO
     */
    get_info() {
      api.call({
        path: "/info",
        onSuccess(data) {
          if (util.isObject(data.application)) {
            let app = data.application;
            self.application = [
              {
                label: self.$t("label.id"),
                value: app.id,
              },
              {
                label: self.$t("label.reactive"),
                value: app.reactive,
              },
              {
                label: self.$t("label.native_image"),
                value: app.inNativeImage,
              },
              {
                label: self.$t("label.virtual_thread"),
                value: app.virtualThread,
              },
              {
                label: self.$t("label.display_name"),
                value: app.displayName,
              },
              {
                label: self.$t("label.server_classname"),
                value: util.isString(app.serverClassname)
                  ? app.serverClassname
                  : "",
              },
              {
                label: self.$t("label.server_port"),
                value: util.isNumber(app.serverPort) ? app.serverPort : "",
              },
              {
                label: self.$t("label.bean_count"),
                value: app.beanCount,
              },
              {
                label: self.$t("label.startup_time"),
                value: util.isNumber(app.startupTime)
                  ? util.format.date(app.startupTime, {
                      format: "YYYY-MM-DD HH:mm:ss",
                    })
                  : "",
              },
            ];
          }
          if (util.isObject(data.version)) {
            let version = data.version;
            self.version = [];
            Object.keys(version).forEach((key) => {
              self.version.push({
                label: version[key].label,
                value: version[key].value,
              });
            });
          }

          self.version = self.version.filter((o) => {
            return util.isString(o.value);
          });
          if (util.isArray(data.beans)) {
            self.bean.rows = data.beans;
            self.bean.pagination.rowsNumber = self.bean.rows.length;
          }
        },
      });
    },

    /*
     * GET VARS
     */
    get_vars() {
      api.call({
        path: "/vars",
        onSuccess(data) {
          if (util.isObject(data)) {
            self.sysprops = [];
            if (util.isObject(data.system)) {
              Object.keys(data.system).forEach((key) => {
                self.sysprops.push({
                  label: key,
                  value: data.system[key],
                });
              });
              util.sort.array(self.sysprops, "label");
            }
            self.envprops = [];
            if (util.isObject(data.environment)) {
              Object.keys(data.environment).forEach((key) => {
                self.envprops.push({
                  label: key,
                  value: data.environment[key],
                });
              });
              util.sort.array(self.envprops, "label");
            }
          }
        },
      });
    },

    /*
     * GET BEANS
     */
    get_beans(props) {
      let { page, rowsPerPage, sortBy, descending } =
        self.bean_pagination(props);
      let params = {
        index: page,
        size: rowsPerPage,
        order: (descending ? "-" : "") + sortBy,
      };
      Object.keys(self.bean.filters).forEach((key) => {
        params[key] = self.bean.filters[key];
      });
      self.bean.loading = true;
      api.call({
        path: "/beans",
        params: params,
        onFinish() {
          self.bean.loading = false;
        },
        onSuccess(data, info) {
          if (util.isObject(data)) {
            self.bean.rows = util.isArray(data.data) ? data.data : [];
            for (const row of self.bean.rows) {
              row.isProxy = row.isProxy + "";
              row.isReconfigure = row.isReconfigure + "";
              row.isReloadable = row.isReloadable + "";
            }
            let pagination = self.bean.pagination;
            pagination.page = data.index;
            pagination.rowsPerPage = data.size;
            if (util.isNumber(data.records)) {
              pagination.rowsNumber = data.records;
            } else {
              let rowsNumber = data.index * data.size;
              if (self.bean.rows.length !== data.size) {
                pagination.rowsNumber = rowsNumber;
              } else {
                pagination.rowsNumber = rowsNumber + 1;
              }
            }
          }
          if (util.isArray(info.visibles)) {
            self.bean.visibles = info.visibles;
          } else {
            self.bean.visibles = [];
            for (const c of self.bean.columns) {
              self.bean.visibles.push(c.name);
            }
          }
        },
      });
    },
    bean_pagination(props) {
      let pagination = props?.pagination
        ? props.pagination
        : self.bean.pagination;
      if (pagination) {
        self.bean.pagination = pagination;
        return pagination;
      }
      return self.bean.pagination;
    },

    /*
     * BEAN REFRESH CLICK
     */
    on_bean_refresh_click() {
      if (!self.bean.rows?.length) {
        if (self.bean.pagination.page > 1) {
          self.bean.pagination.page = 1;
        }
      }
      self.get_beans({
        pagination: self.bean.pagination,
      });
    },

    /*
     * BEAN SEARCH CLICK
     */
    on_bean_search_click() {
      uix.dialog.show(self.bean.search);
    },

    /*
     * BEAN FILTER CLICK
     */
    on_bean_filter_click() {
      let filters = self.bean.filters;
      if (!(util.isString(filters.beanName) && "" !== filters.beanName)) {
        delete filters.beanName;
      }
      if (!(util.isString(filters.className) && "" !== filters.className)) {
        delete filters.className;
      }
      if (!(util.isString(filters.isProxy) && "" !== filters.isProxy)) {
        delete filters.isProxy;
      }
      if (
        !(util.isString(filters.isReloadable) && "" !== filters.isReloadable)
      ) {
        delete filters.isReloadable;
      }
      if (
        !(util.isString(filters.isReconfigure) && "" !== filters.isReconfigure)
      ) {
        delete filters.isReconfigure;
      }
      self.get_beans({
        pagination: self.bean.pagination,
      });
      uix.dialog.hide(self.bean.search);
    },

    /*
     * BEAN RESET CLICK
     */
    on_bean_reset_click() {
      self.bean.filters = {};
    },

    /*
     * KEY VALUE
     */
    on_keyvalue_show(title, rows, search) {
      uix.dialog.show(self.dialog.keyvalue, {
        title: title,
        search: true === search,
        rows: rows,
      });
    },
  },
};
</script>
